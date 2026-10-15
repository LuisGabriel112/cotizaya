import type { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
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
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";

// Corre contra la base real de Supabase, dentro de una transacción que siempre se revierte.

const PERMISO_NEGADO = "42501";

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

suite("Cupo mensual del plan gratis", () => {
  const db = nuevaConexion();
  const LIMITE_MENSUAL = "CY429";
  let dueno: Dueno;
  let taller: string;

  const intentarCrear = () => codigoDeError(db, "insert into public.quotes (workshop_id) values ($1)", [taller]);

  async function crearComoDueno(n: number): Promise<void> {
    for (let i = 0; i < n; i++) await db.query("insert into public.quotes (workshop_id) values ($1)", [taller]);
  }

  async function ponerPlan(plan: string, hasta: string | null): Promise<void> {
    await db.query("update public.workshops set plan = $2, plan_until = $3::date where id = $1", [taller, plan, hasta]);
  }

  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    dueno = nuevoDueno();
    taller = await crearTallerCon(db, dueno, "El Faro");
  });
  afterEach(() => db.query("rollback"));

  it("en gratis la sexta del mes se rechaza y no gasta folio", async () => {
    await comoUsuario(db, dueno);
    await crearComoDueno(5);
    expect(await intentarCrear()).toBe(LIMITE_MENSUAL);
    await comoPostgres(db);
    const { rows } = await db.query("select siguiente_folio from public.workshops where id = $1", [taller]);
    expect(rows[0]).toEqual({ siguiente_folio: 6 });
  });

  it("las del mes pasado no cuentan", async () => {
    await crearComoDueno(5);
    await db.query("update public.quotes set created_at = now() - interval '40 days' where workshop_id = $1", [taller]);
    await comoUsuario(db, dueno);
    expect(await intentarCrear()).toBeNull();
  });

  it("fundador vigente o sin fecha no tiene límite", async () => {
    await ponerPlan("fundador", null);
    await crearComoDueno(5);
    await comoUsuario(db, dueno);
    expect(await intentarCrear()).toBeNull();
    await comoPostgres(db);
    await db.query("update public.workshops set plan_until = public.hoy_en_mexico() where id = $1", [taller]);
    await comoUsuario(db, dueno);
    expect(await intentarCrear()).toBeNull();
  });

  it("fundador vencido vuelve al límite gratis", async () => {
    await crearComoDueno(5);
    await db.query("update public.workshops set plan = 'fundador', plan_until = public.hoy_en_mexico() - 1 where id = $1", [taller]);
    await comoUsuario(db, dueno);
    expect(await intentarCrear()).toBe(LIMITE_MENSUAL);
  });

  it("el cupo es por taller", async () => {
    await crearComoDueno(5);
    const otro = nuevoDueno();
    const tallerOtro = await crearTallerCon(db, otro, "La Costa");
    await comoUsuario(db, otro);
    expect(await codigoDeError(db, "insert into public.quotes (workshop_id) values ($1)", [tallerOtro])).toBeNull();
  });

  it("nadie llama directo a las funciones del cupo", async () => {
    await comoUsuario(db, dueno);
    expect(await codigoDeError(db, "select public.plan_de_pago_vigente('fundador', null)")).toBe(PERMISO_NEGADO);
  });
});

suite("Pagos de Mercado Pago", () => {
  const db = nuevaConexion();
  let dueno: Dueno;
  let taller: string;

  async function registrar(externalId: string, status: string, periodo = "mes", metodo = "tarjeta"): Promise<void> {
    await db.query("set local role service_role");
    await db.query("select public.registrar_pago($1, $2, $3, $4, $5, $6)", [taller, externalId, metodo, periodo === "mes" ? 9900 : 99000, periodo, status]);
    await db.query("reset role");
  }

  async function plan(): Promise<{ plan: string; dias: number | null }> {
    const { rows } = await db.query(
      "select plan, plan_until - public.hoy_en_mexico() as dias from public.workshops where id = $1",
      [taller],
    );
    return rows[0];
  }

  async function diasDeUnMesDesde(desdeDias: number): Promise<number> {
    const { rows } = await db.query<{ d: number }>(
      "select ((public.hoy_en_mexico() + $1::int + interval '1 month')::date - public.hoy_en_mexico()) as d",
      [desdeDias],
    );
    return rows[0]!.d;
  }

  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    dueno = nuevoDueno();
    taller = await crearTallerCon(db, dueno, "El Faro");
  });
  afterEach(() => db.query("rollback"));

  it("un pago aprobado activa fundador por un mes y queda registrado", async () => {
    await registrar("mp-1", "approved");
    expect(await plan()).toEqual({ plan: "fundador", dias: await diasDeUnMesDesde(0) });
    const { rows } = await db.query("select metodo, monto_centavos, periodo, status from public.payments where external_id = 'mp-1'");
    expect(rows).toEqual([{ metodo: "tarjeta", monto_centavos: 9900, periodo: "mes", status: "approved" }]);
  });

  it("OXXO pendiente no activa; al aprobarse sí, con una sola fila", async () => {
    await registrar("mp-2", "pending", "mes", "oxxo");
    expect(await plan()).toEqual({ plan: "gratis", dias: null });
    await registrar("mp-2", "approved", "mes", "oxxo");
    expect((await plan()).plan).toBe("fundador");
    const { rows } = await db.query("select status from public.payments where external_id = 'mp-2'");
    expect(rows).toEqual([{ status: "approved" }]);
  });

  it("una notificación repetida no extiende dos veces", async () => {
    await registrar("mp-3", "approved");
    await registrar("mp-3", "approved");
    expect((await plan()).dias).toBe(await diasDeUnMesDesde(0));
  });

  it("pagar antes de vencer suma al tiempo que queda", async () => {
    await db.query("update public.workshops set plan = 'fundador', plan_until = public.hoy_en_mexico() + 10 where id = $1", [taller]);
    await registrar("mp-4", "approved");
    expect((await plan()).dias).toBe(await diasDeUnMesDesde(10));
  });

  it("pagar ya vencido cuenta desde hoy", async () => {
    await db.query("update public.workshops set plan = 'fundador', plan_until = public.hoy_en_mexico() - 10 where id = $1", [taller]);
    await registrar("mp-5", "approved");
    expect((await plan()).dias).toBe(await diasDeUnMesDesde(0));
  });

  it("un año extiende un año", async () => {
    await registrar("mp-6", "approved", "anio");
    const { rows } = await db.query<{ d: number }>(
      "select ((public.hoy_en_mexico() + interval '1 year')::date - public.hoy_en_mexico()) as d",
    );
    expect((await plan()).dias).toBe(rows[0]!.d);
  });

  it("un fundador sin fecha se queda sin fecha", async () => {
    await db.query("update public.workshops set plan = 'fundador', plan_until = null where id = $1", [taller]);
    await registrar("mp-7", "approved");
    expect(await plan()).toEqual({ plan: "fundador", dias: null });
  });

  it("el dueño ni el anónimo pueden registrar pagos", async () => {
    const llamada = "select public.registrar_pago($1, 'x', 'tarjeta', 9900, 'mes', 'approved')";
    await comoUsuario(db, dueno);
    expect(await codigoDeError(db, llamada, [taller])).toBe(PERMISO_NEGADO);
    await comoAnonimo(db);
    expect(await codigoDeError(db, llamada, [taller])).toBe(PERMISO_NEGADO);
  });
});
