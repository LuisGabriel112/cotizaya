// Uso: node supabase/scripts/migrar.ts   (lee SUPABASE_DB_URL de .env.local)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import pg from "pg";
import { opcionesSsl, pendientes, versionDe } from "./migraciones.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_DB_URL;
if (!url) throw new Error("Falta SUPABASE_DB_URL en .env.local");

const DIR = "supabase/migrations";
const db = new pg.Client({ connectionString: url, ssl: opcionesSsl(url) });
await db.connect();
await db.query(`create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text)`);
const { rows } = await db.query<{ version: string }>("select version from supabase_migrations.schema_migrations");

for (const archivo of pendientes(readdirSync(DIR), new Set(rows.map((r) => r.version)))) {
  // Cada archivo entra completo o no entra.
  await db.query("begin");
  await db.query(readFileSync(`${DIR}/${archivo}`, "utf8"));
  await db.query("insert into supabase_migrations.schema_migrations (version, name) values ($1, $2)", [versionDe(archivo), archivo]);
  await db.query("commit");
  console.log(`Aplicada ${archivo}`);
}
await db.end();
console.log("Base al día.");
