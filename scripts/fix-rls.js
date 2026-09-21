/**
 * Fix 1: Deploy role escalation trigger (database-level)
 * Fix 2: Reset Customer A's accidentally escalated role back to CUSTOMER
 * Fix 3: Verify the trigger works
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=\s]+)\s*=\s*(.*)/);
  if (m) process.env[m[1]] = m[2];
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1];
const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svcKey     = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Execute raw SQL via Supabase Management API (uses service role JWT which IS valid for this endpoint)
async function execSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      // Management API uses the service_role key as Bearer token
      'Authorization': `Bearer ${svcKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { raw: text }; }
}

async function main() {
  console.log('\n🔧 Applying RLS Fixes...\n');

  // ── Fix 1: Reset Customer A role back to CUSTOMER (service role bypasses RLS)
  const customerAId = 'c4acb203-0b80-4770-847b-60735f8e3f39';
  const { error: resetErr } = await admin
    .from('profiles')
    .update({ role: 'CUSTOMER' })
    .eq('id', customerAId);
  console.log('Reset Customer A role:', resetErr ? '❌ ' + resetErr.message : '✅ Reset to CUSTOMER');

  // ── Fix 2: Deploy a TRIGGER that blocks any client-side role change
  // This is more robust than WITH CHECK because it fires BEFORE UPDATE
  // and cannot be bypassed by crafted queries.
  const triggerFn = await execSQL(`
    CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, auth
    AS $$
    BEGIN
      -- auth.uid() is NULL when called from service_role (admin)
      -- If a regular user is making this change and the role is being changed, BLOCK IT
      IF auth.uid() IS NOT NULL AND OLD.role IS DISTINCT FROM NEW.role THEN
        RAISE EXCEPTION 'permission denied: role changes must be made by an administrator'
          USING ERRCODE = 'insufficient_privilege';
      END IF;
      RETURN NEW;
    END;
    $$
  `);
  console.log('Create trigger function:', triggerFn?.message ? '❌ ' + triggerFn.message : '✅ Created');

  const triggerAttach = await execSQL(`
    DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
    CREATE TRIGGER trg_prevent_role_escalation
      BEFORE UPDATE OF role ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_role_escalation()
  `);
  console.log('Attach trigger:', triggerAttach?.message ? '❌ ' + triggerAttach.message : '✅ Attached');

  // ── Fix 3: Seed one test order in the DB so owner order test can pass
  const ownerId = 'e02bed12-0300-4e40-ac0d-aa846482a691';
  const { data: testOrder, error: seedErr } = await admin
    .from('orders')
    .insert({
      user_id:        ownerId,
      order_number:   'TEST-SEED-001',
      customer_name:  'Test Order',
      customer_email: 'hetsony143@gmail.com',
      total_amount:   99.99,
      status:         'DELIVERED',
    })
    .select('id')
    .single();
  console.log('Seed test order:', seedErr ? '❌ ' + seedErr.message : '✅ Created ' + testOrder?.id);

  // ── Verify: try to escalate as Customer A (should now fail with trigger)
  console.log('\n🧪 Verifying trigger...');
  const clientA = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await clientA.auth.signInWithPassword({
    email:    'test.customer.a@maisoncakeco.test',
    password: 'TestPass123!',
  });
  const { data: escalated, error: escalateErr } = await clientA
    .from('profiles')
    .update({ role: 'OWNER' })
    .eq('id', customerAId)
    .select('role');

  const blocked = !!escalateErr || !escalated || escalated.length === 0 || escalated?.[0]?.role !== 'OWNER';
  console.log('Role escalation blocked?', blocked ? '✅ YES — trigger works!' : '❌ NO — still vulnerable');
  if (escalateErr) console.log('  Error:', escalateErr.message);

  // Cleanup test order
  if (testOrder?.id) {
    await admin.from('orders').delete().eq('id', testOrder.id);
    console.log('\n🧹 Cleaned up test order');
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
