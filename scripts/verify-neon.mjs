/**
 * One-off verification: does the Neon database actually have the app schema?
 * Reads DATABASE_URL_UNPOOLED (or DATABASE_URL) from .env.local and lists the
 * public tables + row counts, so "migrations ran" is confirmed by observation
 * rather than inferred from the migrator's exit line.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const pick = (key) => {
  const line = raw.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).replace(/^"|"$/g, "") : undefined;
};
const connectionString = pick("DATABASE_URL_UNPOOLED") ?? pick("DATABASE_URL");
if (!connectionString) {
  console.error("no DATABASE_URL in .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
try {
  const tables = await pool.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  );
  console.log("TABLES IN NEON:");
  for (const row of tables.rows) {
    const count = await pool.query(`select count(*)::int as n from "${row.table_name}"`);
    console.log(`  - ${row.table_name} (${count.rows[0].n} rows)`);
  }
  const version = await pool.query("select version()");
  console.log("SERVER:", version.rows[0].version.split(",")[0]);
} catch (err) {
  console.error("QUERY FAILED:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
