import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { crearTallerCon } from "./pg-sesion";

suite("pagos: replay y concurrencia", () => {
  const db = nuevaConexion();
  let taller: string, otro: string;
  let propietarios: string[];
  const pago = () => `pago-${taller}`;
  const registrar = (estado: string, id = pago(), tallerId = taller) => db.query(
    "select public.registrar_pago($1, $2, 'tarjeta', 9900, 'mes', $3)", [tallerId, id, estado]);
  const fecha = async () => (await db.query("select plan_until::text as fecha from workshops where id=$1", [taller])).rows[0].fecha;
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    const a = nuevoDueno(), b = nuevoDueno();
    propietarios = [a.id, b.id];
    taller = await crearTallerCon(db, a, "Pruebas pagos");
    otro = await crearTallerCon(db, b, "Otro taller");
  });
  afterEach(async () => {
    await db.query("delete from workshops where id = any($1::uuid[])", [[taller, otro]]);
    await db.query("delete from auth.users where id = any($1::uuid[])", [propietarios]);
  });
  it("approved→pending→approved no extiende dos veces", async () => {
    await registrar("approved");
    const primera = await fecha();
    await registrar("pending");
    await registrar("approved");
    expect(await fecha()).toBe(primera);
  });
  it.each(["pending", "rejected", "cancelled", "refunded"])("%s no activa el plan", async (estado) => {
    await registrar(estado);
    expect(await fecha()).toBeNull();
  });
  it("no reutiliza una identidad de pago para otro taller", async () => {
    await registrar("pending");
    await expect(registrar("approved", pago(), otro)).rejects.toMatchObject({ code: "22023" });
    expect(await fecha()).toBeNull();
  });
  it("rechaza monto o periodo diferente al registrado", async () => {
    await registrar("pending");
    await expect(db.query("select public.registrar_pago($1,$2,'tarjeta',99000,'anio','approved')", [taller, pago()])).rejects.toMatchObject({ code: "22023" });
  });
  it("dos entregas concurrentes de un pago se confirman una vez", async () => {
    const segunda = nuevaConexion();
    await segunda.connect();
    try {
      await Promise.all([registrar("approved"), segunda.query(
        "select public.registrar_pago($1,$2,'tarjeta',9900,'mes','approved')", [taller, pago()])]);
      const primera = await fecha();
      await registrar("approved");
      expect(await fecha()).toBe(primera);
      expect((await db.query("select count(*)::int as n from payments where external_id=$1", [pago()])).rows[0].n).toBe(1);
    } finally { await segunda.end(); }
  });
  it("dos pagos distintos concurrentes suman ambos periodos", async () => {
    const segunda = nuevaConexion();
    await segunda.connect();
    try {
      await Promise.all([registrar("approved"), segunda.query(
        "select public.registrar_pago($1,$2,'tarjeta',9900,'mes','approved')", [taller, `${pago()}-otro`])]);
      const esperada = await db.query("select ((public.hoy_en_mexico() + interval '1 month')::date + interval '1 month')::date::text as fecha");
      expect(await fecha()).toBe(esperada.rows[0].fecha);
    } finally { await segunda.end(); }
  });
});
