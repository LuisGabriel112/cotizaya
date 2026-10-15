import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { codigoDeError, comoPostgres, comoUsuario, crearCotizacion, crearTallerCon, type Dueno } from "./pg-sesion";

// Corre contra la base real de Supabase, dentro de una transacción que siempre se revierte.

const PERMISO_NEGADO = "42501";
const VIOLA_CHECK = "23514";
const CLAVE_REPETIDA = "23505";
const MATERIAL = "corrediza-2-6mm";

suite("Catálogo editable por el taller", () => {
  const db = nuevaConexion();
  let dueno: Dueno, otro: Dueno;
  let taller: string, tallerAjeno: string;

  const precioDe = async (tallerId: string): Promise<number> => {
    const { rows } = await db.query<{ precio_centavos: number }>(
      "select precio_centavos from public.materials where workshop_id = $1 and clave = $2",
      [tallerId, MATERIAL],
    );
    return rows[0]!.precio_centavos;
  };

  const idDe = async (tallerId: string): Promise<string> => {
    const { rows } = await db.query<{ id: string }>("select id from public.materials where workshop_id = $1 and clave = $2", [tallerId, MATERIAL]);
    return rows[0]!.id;
  };

  async function cotizarConElMaterial(tallerId: string): Promise<string> {
    const cotizacion = await crearCotizacion(db, tallerId, "Leticia Cruz");
    await db.query(
      `insert into public.quote_items (quote_id, workshop_id, descripcion, material_id, unidad, precio_centavos, cantidad, mano_obra_centavos)
       select $2, $1, 'Ventana', id, unidad, precio_centavos, 1, 35000
         from public.materials where workshop_id = $1 and clave = $3`,
      [tallerId, cotizacion.id, MATERIAL],
    );
    return cotizacion.id;
  }

  const partida = async (cotizacionId: string) =>
    (await db.query<{ precio_centavos: number; material_id: string | null }>("select precio_centavos, material_id from public.quote_items where quote_id = $1", [cotizacionId])).rows[0]!;

  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    [dueno, otro] = [nuevoDueno(), nuevoDueno()];
    taller = await crearTallerCon(db, dueno, "El Faro");
    tallerAjeno = await crearTallerCon(db, otro, "La Costa");
  });
  afterEach(() => db.query("rollback"));

  it("el dueño cambia el precio de su material", async () => {
    await comoUsuario(db, dueno);
    const cambio = await db.query("update public.materials set precio_centavos = 230000 where clave = $1", [MATERIAL]);
    await comoPostgres(db);
    expect(cambio.rowCount).toBe(1);
    expect(await precioDe(taller)).toBe(230000);
  });

  it("no puede cambiar el precio de un material de otro taller", async () => {
    const antes = await precioDe(tallerAjeno);
    await comoUsuario(db, dueno);
    const cambio = await db.query("update public.materials set precio_centavos = 1 where workshop_id = $1", [tallerAjeno]);
    await comoPostgres(db);
    expect(cambio.rowCount).toBe(0);
    expect(await precioDe(tallerAjeno)).toBe(antes);
  });

  it("no puede quitar un material de otro taller", async () => {
    await comoUsuario(db, dueno);
    const borrado = await db.query("delete from public.materials where workshop_id = $1", [tallerAjeno]);
    await comoPostgres(db);
    expect(borrado.rowCount).toBe(0);
    expect(await precioDe(tallerAjeno)).toBeGreaterThan(0);
  });

  it("agrega materiales a su taller, no al de otro", async () => {
    await comoUsuario(db, dueno);
    const alta = (id: string) =>
      codigoDeError(db, "insert into public.materials (workshop_id, clave, nombre, unidad, precio_centavos) values ($1, 'vidrio-filtrasol', 'Vidrio filtrasol', 'm2', 148050)", [id]);
    expect(await alta(taller)).toBeNull();
    expect(await alta(tallerAjeno)).toBe(PERMISO_NEGADO);
  });

  it("la base rechaza precios negativos y claves repetidas dentro del taller", async () => {
    await comoUsuario(db, dueno);
    expect(await codigoDeError(db, "update public.materials set precio_centavos = -1 where clave = $1", [MATERIAL])).toBe(VIOLA_CHECK);
    const repetida = "insert into public.materials (workshop_id, clave, nombre, unidad, precio_centavos) values ($1, $2, 'Otro', 'm2', 100)";
    expect(await codigoDeError(db, repetida, [taller, MATERIAL])).toBe(CLAVE_REPETIDA);
  });

  it("cambiar el precio no toca las cotizaciones ya hechas", async () => {
    const cotizacionId = await cotizarConElMaterial(taller);
    const precioViejo = await precioDe(taller);
    await comoUsuario(db, dueno);
    await db.query("update public.materials set precio_centavos = precio_centavos + 50000 where clave = $1", [MATERIAL]);
    await comoPostgres(db);
    expect((await partida(cotizacionId)).precio_centavos).toBe(precioViejo);
  });

  it("quitar un material deja la cotización con su precio y sin enlace al catálogo", async () => {
    const cotizacionId = await cotizarConElMaterial(taller);
    const precioViejo = await precioDe(taller);
    await comoUsuario(db, dueno);
    await db.query("delete from public.materials where id = $1", [await idDe(taller)]);
    await comoPostgres(db);
    expect(await partida(cotizacionId)).toEqual({ precio_centavos: precioViejo, material_id: null });
  });
});
