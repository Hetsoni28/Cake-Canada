const { Client } = require('pg');
const c = new Client({
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.uaurkspenqwtiwysufwc',
  password: 'PsXT9utvwMoWUj1U',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect().then(() => c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_variants'")).then(r => { console.log(r.rows); c.end() });
