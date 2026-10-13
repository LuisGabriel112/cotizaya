import { randomInt, randomUUID } from "node:crypto";
import { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  codigoDeError,
  comoAnonimo,
  comoPostgres,
  comoUsuario,
  crearCotizacion,
  crearTallerCon,
  crearUsuario,
  type Dueno,
} from "./pg-sesion";
import { opcionesSsl } from "../scripts/migraciones";

// Corre contra la base real de Supabase, dentro de una transacción que siempre se revierte.
const url = process.env.SUPABASE_DB_URL;
const suite = url ? describe : describe.skip;
if (!url) console.warn("SUPABASE_DB_URL no está definida: se saltan los tests de RLS.");

const PERMISO_NEGADO = "42501";

function nuevoDueno(): Dueno {
  return { id: randomUUID(), telefono: `52999${String(randomInt(0, 10_000_000)).padStart(7, "0")}` };
}

function nuevaConexion(): Client {
  return new Client({ connectionString: url, ssl: opcionesSsl(url ?? "") });
}

async function agregarPartida(db: Client, tallerId: string, quoteId: string): Promise<void> {
  await db.query(
    `insert into public.quote_items (quote_id, workshop_id, descripcion, material_id, unidad, precio_centavos, cantidad, mano_obra_centavos)
     select $2, $1, 'Ventana', id, unidad, precio_centavos, 1, 35000
       from public.materials where workshop_id = $1 and clave = 'corrediza-2-6mm'`,
    [tallerId, quoteId],
  );
}

suite("RLS entre talleres", () => {
  const db = nuevaConexion();
  let a: Dueno, b: Dueno;
  let tallerA: string, tallerB: string;
  let cotA: Awaited<ReturnType<typeof crearCotizacion>>, cotB: typeof cotA;

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  beforeEach(async () => {
    await db.query("begin");
    [a, b] = [nuevoDueno(), nuevoDueno()];
    tallerA = await crearTallerCon(db, a, "El Faro");
    tallerB = await crearTallerCon(db, b, "La Costa");
    cotA = await crearCotizacion(db, tallerA, "Leticia Cruz");
    cotB = await crearCotizacion(db, tallerB, "Ramón Pérez");
    await agregarPartida(db, tallerA, cotA.id);
    await agregarPartida(db, tallerB, cotB.id);
  });

  afterEach(() => db.query("rollback"));

  it("un taller solo lee sus cotizaciones", async () => {
    await comoUsuario(db, a);
    const { rows } = await db.query<{ workshop_id: string }>("select workshop_id from public.quotes");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.workshop_id === tallerA)).toBe(true);
  });

  it.each(["quote_items", "materials", "clients", "quote_events"])("un taller no lee %s de otro", async (tabla) => {
    await comoUsuario(db, a);
    const { rows } = await db.query(`select 1 from public.${tabla} where workshop_id = $1`, [tallerB]);
    expect(rows).toHaveLength(0);
  });

  it("un taller no inserta cotizaciones en otro", async () => {
    await comoUsuario(db, a);
    const codigo = await codigoDeError(db, "insert into public.quotes (workshop_id) values ($1)", [tallerB]);
    expect(codigo).toBe(PERMISO_NEGADO);
  });

  it("un taller no edita la cotización de otro", async () => {
    await comoUsuario(db, a);
    const { rowCount } = await db.query("update public.quotes set cliente_nombre = 'x' where id = $1", [cotB.id]);
    expect(rowCount).toBe(0);
  });

  it("un taller no cuelga partidas de la cotización de otro", async () => {
    await comoUsuario(db, a);
    const codigo = await codigoDeError(
      db,
      `insert into public.quote_items (quote_id, workshop_id, descripcion, unidad, precio_centavos, cantidad, mano_obra_centavos)
       values ($1, $2, 'x', 'pieza', 1, 1, 0)`,
      [cotB.id, tallerA],
    );
    expect(codigo).not.toBeNull();
  });

  it("el dueño no se cambia el plan", async () => {
    await comoUsuario(db, a);
    const codigo = await codigoDeError(db, "update public.workshops set plan = 'fundador' where id = $1", [tallerA]);
    expect(codigo).toBe(PERMISO_NEGADO);
  });

  it.each(["folio = 99", "public_slug = 'x'", "viewed_at = now()", "workshop_id = workshop_id"])(
    "el dueño no reescribe %s",
    async (asignacion) => {
      await comoUsuario(db, a);
      const codigo = await codigoDeError(db, `update public.quotes set ${asignacion} where id = $1`, [cotA.id]);
      expect(codigo).toBe(PERMISO_NEGADO);
    },
  );

  it.each(["quotes", "workshops", "materials", "quote_items"])("un anónimo no lee %s", async (tabla) => {
    await comoAnonimo(db);
    expect(await codigoDeError(db, `select 1 from public.${tabla}`)).toBe(PERMISO_NEGADO);
  });

  it("un usuario normal no ve la tabla de admins", async () => {
    await db.query("insert into public.admins (user_id) values ($1)", [b.id]);
    await comoUsuario(db, a);
    const { rows } = await db.query("select * from public.admins");
    expect(rows).toHaveLength(0);
  });

  it("un no-admin no puede dar de alta talleres", async () => {
    await comoUsuario(db, a);
    const codigo = await codigoDeError(db, "select public.admin_alta_taller('X', '529990000000', '', '')");
    expect(codigo).toBe(PERMISO_NEGADO);
  });

  it("un no-admin no puede editar datos de otro taller", async () => {
    await comoUsuario(db, a);
    const codigo = await codigoDeError(db, "select public.admin_editar_taller($1, 'X', '', '')", [tallerB]);
    expect(codigo).toBe(PERMISO_NEGADO);
  });

  it("el admin edita nombre, ciudad y condiciones de cualquier taller", async () => {
    await db.query("insert into public.admins (user_id) values ($1)", [a.id]);
    await comoUsuario(db, a);
    await db.query("select public.admin_editar_taller($1, $2, $3, $4)", [tallerB, " La Costa Sur ", " Veracruz ", " 50% de anticipo "]);
    await comoPostgres(db);
    const { rows } = await db.query("select nombre, ciudad, condiciones from public.workshops where id = $1", [tallerB]);
    expect(rows[0]).toEqual({ nombre: "La Costa Sur", ciudad: "Veracruz", condiciones: "50% de anticipo" });
  });
});

suite("folio, enlace público y primer ingreso", () => {
  const db = nuevaConexion();
  let a: Dueno, b: Dueno;
  let tallerA: string, tallerB: string;

  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    [a, b] = [nuevoDueno(), nuevoDueno()];
    tallerA = await crearTallerCon(db, a, "El Faro");
    tallerB = await crearTallerCon(db, b, "La Costa");
  });
  afterEach(() => db.query("rollback"));

  it("el folio es consecutivo por taller", async () => {
    const primera = await crearCotizacion(db, tallerA, "Uno");
    const segunda = await crearCotizacion(db, tallerA, "Dos");
    const deB = await crearCotizacion(db, tallerB, "Otro");
    expect(segunda.folio).toBe(primera.folio + 1);
    expect(deB.folio).toBe(1);
    expect(segunda.public_slug).toMatch(/^0002-[0-9a-f]{12}$/);
  });

  it("la vista pública trae la cotización y el contacto del taller, nada más", async () => {
    const cot = await crearCotizacion(db, tallerA, "Leticia");
    await agregarPartida(db, tallerA, cot.id);
    await comoAnonimo(db);
    const { rows } = await db.query<{ v: Record<string, Record<string, unknown>> }>(
      "select public.cotizacion_publica($1) as v",
      [cot.public_slug],
    );
    const v = rows[0]!.v;
    expect(Object.keys(v).sort()).toEqual(["items", "quote", "taller"]);
    expect(Object.keys(v.taller!).sort()).toEqual(["ciudad", "condiciones", "logo_url", "nombre", "plan", "telefono"]);
    expect(JSON.stringify(v)).not.toContain(a.telefono);
    expect(v.quote).not.toHaveProperty("workshop_id");
    expect(JSON.stringify(v)).not.toContain(tallerA);
  });

  it("abrir el enlace deja la cotización vista con evento", async () => {
    const cot = await crearCotizacion(db, tallerA, "Leticia");
    await db.query("update public.quotes set status = 'enviada' where id = $1", [cot.id]);
    await comoAnonimo(db);
    await db.query("select public.registrar_apertura($1)", [cot.public_slug]);
    await comoPostgres(db);
    const { rows } = await db.query("select status, aviso_pendiente from public.quotes where id = $1", [cot.id]);
    expect(rows[0]).toEqual({ status: "vista", aviso_pendiente: true });
    const eventos = await db.query("select tipo from public.quote_events where quote_id = $1", [cot.id]);
    expect(eventos.rows).toEqual([{ tipo: "abierta" }]);
  });

  it("el dueño revisando su propio enlace no la marca como vista", async () => {
    const cot = await crearCotizacion(db, tallerA, "Leticia");
    await comoUsuario(db, a);
    await db.query("select public.registrar_apertura($1)", [cot.public_slug]);
    await comoPostgres(db);
    const { rows } = await db.query("select status, viewed_at from public.quotes where id = $1", [cot.id]);
    expect(rows[0]).toEqual({ status: "borrador", viewed_at: null });
  });

  it("aceptar desde el enlace deja la cotización aceptada", async () => {
    const cot = await crearCotizacion(db, tallerA, "Leticia");
    await comoAnonimo(db);
    await db.query("select public.aceptar_cotizacion($1)", [cot.public_slug]);
    await comoPostgres(db);
    const { rows } = await db.query("select status from public.quotes where id = $1", [cot.id]);
    expect(rows[0]).toEqual({ status: "aceptada" });
  });

  it("el dueño reclama el taller que el admin dio de alta con su teléfono", async () => {
    const nuevo = nuevoDueno();
    await crearUsuario(db, nuevo);
    const { rows } = await db.query<{ id: string }>(
      "insert into public.workshops (owner_phone, nombre) values ($1, 'Vidrios Boca') returning id",
      [nuevo.telefono],
    );
    await comoUsuario(db, nuevo);
    const reclamo = await db.query<{ id: string }>("select public.reclamar_o_crear_taller() as id");
    expect(reclamo.rows[0]!.id).toBe(rows[0]!.id);
  });

  it("un teléfono nuevo sin nombre no crea taller; con nombre sí, con catálogo base", async () => {
    const nuevo = nuevoDueno();
    await crearUsuario(db, nuevo);
    await comoUsuario(db, nuevo);
    const sinNombre = await db.query<{ id: string | null }>("select public.reclamar_o_crear_taller() as id");
    expect(sinNombre.rows[0]!.id).toBeNull();
    await db.query("select public.reclamar_o_crear_taller('Aluminio Veracruz')");
    const { rows } = await db.query("select clave from public.materials");
    expect(rows).toHaveLength(6);
  });
});
