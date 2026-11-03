import { readFile, readdir } from "node:fs/promises";
import { Client } from "pg";
import { validarBaseDePruebas } from "./base-segura.ts";

validarBaseDePruebas(process.env.SUPABASE_DB_URL);
const db = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl:false });
await db.connect();
try {
  const {rows} = await db.query("select to_regclass('public.workshops') as tabla");
  if (rows[0].tabla) throw new Error("Base no vacía; crea otra base local de pruebas");
  await db.query("begin");
  await db.query(await readFile("supabase/tests/stub-local.sql","utf8"));
  const archivos = (await readdir("supabase/migrations")).filter(a=>a.endsWith(".sql")).sort();
  for (const archivo of archivos) await db.query(await readFile(`supabase/migrations/${archivo}`,"utf8"));
  await db.query("commit");
  console.log(`Base local preparada: ${archivos.length} migraciones; sin servicios productivos`);
} catch (error) {
  await db.query("rollback");
  throw error;
} finally { await db.end(); }
