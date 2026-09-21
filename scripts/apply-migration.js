/**
 * Apply migration 006 via Supabase admin RPC
 * Uses supabase-js service role client with pg via fetch
 */
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

// Load .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Read and split the migration into individual statements
const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/006_rls_hardening.sql'), 'utf8'
);

// Split on lines ending with ';' — each policy/grant/revoke is one statement
const statements = [];
let current = '';
for (const line of sql.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('--') || trimmed === '') {
    continue;
  }
  current += ' ' + trimmed;
  if (trimmed.endsWith(';')) {
    statements.push(current.trim());
    current = '';
  }
}

async function execSQL(stmt) {
  // Use Supabase's Management API via fetch
  const projectRef = URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) throw new Error('Cannot extract project ref from URL');

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${KEY}`,
    },
    body: JSON.stringify({ query: stmt }),
  });
  const json = await res.json();
  return json;
}

async function main() {
  console.log(`\n🔒 Applying Migration 006 — RLS Hardening`);
  console.log(`   Project: ${URL}`);
  console.log(`   Statements to run: ${statements.length}\n`);

  let ok = 0, skipped = 0, errors = 0;

  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 70);
    const result = await execSQL(stmt);

    if (result?.error) {
      const msg = result.error?.message ?? JSON.stringify(result.error);
      if (msg.includes('already exists') || msg.includes('does not exist')) {
        skipped++;
      } else {
        console.error(`  ✗ ${preview}`);
        console.error(`    → ${msg.slice(0, 100)}`);
        errors++;
      }
    } else {
      ok++;
    }
  }

  console.log('\n' + '═'.repeat(52));
  console.log(`  Applied : ${ok}`);
  console.log(`  Skipped : ${skipped}`);
  console.log(`  Errors  : ${errors}`);
  console.log('═'.repeat(52));
  if (errors === 0) {
    console.log('\n✅ Migration 006 deployed successfully!\n');
  } else {
    console.log('\n⚠  Check errors above.\n');
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
