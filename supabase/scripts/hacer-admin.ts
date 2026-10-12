// Uso: node supabase/scripts/hacer-admin.ts 2290000000
// El usuario debe haber entrado al menos una vez con ese celular.
import { existsSync } from "node:fs";
import pg from "pg";
import { opcionesSsl } from "./migraciones.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_DB_URL;
const diez = (process.argv[2] ?? "").replace(/\D/g, "").slice(-10);
if (!url || diez.length !== 10) throw new Error("Uso: node supabase/scripts/hacer-admin.ts <celular a 10 dígitos> (y SUPABASE_DB_URL en .env.local)");

const db = new pg.Client({ connectionString: url, ssl: opcionesSsl(url) });
await db.connect();
const { rowCount } = await db.query(
  "insert into public.admins (user_id) select id from auth.users where phone = $1 on conflict do nothing",
  [`52${diez}`],
);
await db.end();
console.log(rowCount ? "Listo: ya es admin." : "No encontré ese celular en auth.users (¿ya entró a la app?) o ya era admin.");
