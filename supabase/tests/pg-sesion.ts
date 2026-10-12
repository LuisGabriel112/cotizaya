import type { ClientBase } from "pg";

// Simula lo que hace PostgREST: cambiar de rol y fijar los claims del JWT,
// todo con "set local" para que el rollback del test lo borre.

export interface Dueno {
  id: string;
  telefono: string;
}

export async function comoUsuario(db: ClientBase, dueno: Dueno): Promise<void> {
  const claims = JSON.stringify({ sub: dueno.id, phone: dueno.telefono, role: "authenticated" });
  await db.query("select set_config('request.jwt.claims', $1, true)", [claims]);
  await db.query("set local role authenticated");
}

export async function comoAnonimo(db: ClientBase): Promise<void> {
  await db.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ role: "anon" })]);
  await db.query("set local role anon");
}

export async function comoPostgres(db: ClientBase): Promise<void> {
  await db.query("reset role");
}

/** Corre la consulta dentro de un savepoint y regresa el código de error de Postgres, o null. */
export async function codigoDeError(db: ClientBase, sql: string, params: unknown[] = []): Promise<string | null> {
  await db.query("savepoint intento");
  try {
    await db.query(sql, params);
    await db.query("release savepoint intento");
    return null;
  } catch (e) {
    await db.query("rollback to savepoint intento");
    return (e as { code?: string }).code ?? "desconocido";
  }
}

export async function crearUsuario(db: ClientBase, dueno: Dueno): Promise<void> {
  await db.query("insert into auth.users (id, phone, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [
    dueno.id,
    dueno.telefono,
  ]);
}

export async function crearTallerCon(db: ClientBase, dueno: Dueno, nombre: string): Promise<string> {
  await crearUsuario(db, dueno);
  const { rows } = await db.query<{ id: string }>(
    "insert into public.workshops (owner_id, owner_phone, nombre) values ($1, $2, $3) returning id",
    [dueno.id, dueno.telefono, nombre],
  );
  await db.query("select public.sembrar_catalogo($1)", [rows[0]!.id]);
  return rows[0]!.id;
}

export async function crearCotizacion(db: ClientBase, tallerId: string, cliente: string) {
  const { rows } = await db.query<{ id: string; folio: number; public_slug: string }>(
    "insert into public.quotes (workshop_id, cliente_nombre) values ($1, $2) returning id, folio, public_slug",
    [tallerId, cliente],
  );
  return rows[0]!;
}
