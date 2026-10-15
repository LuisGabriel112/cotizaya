import { randomInt, randomUUID } from "node:crypto";
import { Client } from "pg";
import { describe } from "vitest";
import { opcionesSsl } from "../scripts/migraciones";
import type { Dueno } from "./pg-sesion";

export const urlDeBase = process.env.SUPABASE_DB_URL;

// Sin base configurada la suite se salta en vez de fallar.
export const suiteDeBase = urlDeBase ? describe : describe.skip;
if (!urlDeBase) console.warn("SUPABASE_DB_URL no está definida: se saltan los tests de base.");

export function nuevoDueno(): Dueno {
  return { id: randomUUID(), telefono: `52999${String(randomInt(0, 10_000_000)).padStart(7, "0")}` };
}

export function nuevaConexion(): Client {
  return new Client({ connectionString: urlDeBase, ssl: opcionesSsl(urlDeBase ?? "") });
}
