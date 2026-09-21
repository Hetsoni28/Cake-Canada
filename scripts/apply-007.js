/**
 * Apply Migration 007 — Role Escalation Trigger
 * Uses Supabase Canada-Central connection pooler
 */
const { Client } = require('pg');

async function run() {
  const client = new Client({
    host:     'aws-0-ca-central-1.pooler.supabase.com',
    port:     6543,
    database: 'postgres',
    user:     'postgres.uaurkspenqwtiwysufwc',
    password: 'PsXT9utvwMoWUj1U',
    ssl:      { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log('\nConnected to Supabase (Canada Central pooler)\n');

  // Create the trigger function (dollar-quoted, sent as single query)
  await client.query(`
    CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, auth
    AS $body$
    BEGIN
      IF auth.uid() IS NOT NULL AND OLD.role IS DISTINCT FROM NEW.role THEN
        RAISE EXCEPTION 'permission denied: role changes must be made by an administrator'
          USING ERRCODE = 'insufficient_privilege';
      END IF;
      RETURN NEW;
    END;
    $body$
  `);
  console.log('  ✅ Function prevent_role_escalation() created');

  await client.query('REVOKE ALL ON FUNCTION public.prevent_role_escalation() FROM PUBLIC');
  console.log('  ✅ Revoked public access');

  await client.query('GRANT EXECUTE ON FUNCTION public.prevent_role_escalation() TO service_role');
  console.log('  ✅ Granted to service_role only');

  await client.query('DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles');
  console.log('  ✅ Old trigger dropped (if existed)');

  await client.query(`
    CREATE TRIGGER trg_prevent_role_escalation
      BEFORE UPDATE OF role ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_role_escalation()
  `);
  console.log('  ✅ Trigger trg_prevent_role_escalation created on profiles.role');

  // Verify the trigger is in place
  const { rows } = await client.query(
    "SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass AND tgname = 'trg_prevent_role_escalation'"
  );

  await client.end();

  if (rows.length > 0) {
    console.log('\n🎉 Migration 007 successfully deployed!');
    console.log('   Role escalation is now blocked at the database level.\n');
  } else {
    console.log('\n⚠  Trigger not found after creation — something went wrong.\n');
    process.exit(1);
  }
}

run().catch(e => {
  console.error('\n💥 Fatal:', e.message);
  process.exit(1);
});
