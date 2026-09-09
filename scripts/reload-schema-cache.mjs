// Forces Supabase's PostgREST layer to reload its schema/policy cache.
//
// Usually not needed — PostgREST reloads automatically within a few seconds
// of a schema change. But if you've just changed RLS policies via the SQL
// Editor and calls from the site are still getting rejected, run this once:
//
//   node --env-file=.env.local scripts/reload-schema-cache.mjs
//
// Requires SUPABASE_DB_PASSWORD in .env.local (your Postgres database
// password, from Supabase → Project Settings → Database) and connects via
// the connection pooler (Project Settings → Database → Connection pooling),
// since the direct db.<ref>.supabase.co host is IPv6-only and often
// unreachable from home/office networks.

import pg from "pg";

const POOLER_HOST = "aws-0-ap-northeast-2.pooler.supabase.com";
const POOLER_USER = "postgres.lntkkxwqobbltmjtfpxs";

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Set SUPABASE_DB_PASSWORD in .env.local first.");
  process.exit(1);
}

const client = new pg.Client({
  host: POOLER_HOST,
  port: 5432,
  user: POOLER_USER,
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(`NOTIFY pgrst, 'reload schema';`);
await client.end();
console.log("Schema cache reload requested.");
