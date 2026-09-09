// Applies supabase/schema.sql directly to the live database via the
// connection pooler, then reloads PostgREST's schema cache.
//
//   node --env-file=.env.local scripts/apply-schema.mjs
//
// Requires SUPABASE_DB_PASSWORD in .env.local.

import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POOLER_HOST = "aws-0-ap-northeast-2.pooler.supabase.com";
const POOLER_USER = "postgres.lntkkxwqobbltmjtfpxs";

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Set SUPABASE_DB_PASSWORD in .env.local first.");
  process.exit(1);
}

const sql = readFileSync(join(__dirname, "..", "supabase", "schema.sql"), "utf8");

const client = new pg.Client({
  host: POOLER_HOST,
  port: 5432,
  user: POOLER_USER,
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log("schema.sql applied successfully");
} finally {
  await client.query(`NOTIFY pgrst, 'reload schema';`);
  await client.end();
}
