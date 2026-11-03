import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { codigoDeError, comoUsuario, crearCotizacion, crearTallerCon } from "./pg-sesion";
import type { Dueno } from "./pg-sesion";

suite("integridad transaccional de cotizaciones", () => {
  const db = nuevaConexion();
  let taller: string, quote: string, material: string;
  let dueno: Dueno;
  const totales = async () => (await db.query("select subtotal_centavos, descuento_centavos, iva_centavos, total_centavos from quotes where id=$1", [quote])).rows[0];
  const insertar = (ancho = 120, cantidad = 1) => db.query(`insert into quote_items
    (workshop_id,quote_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos,importe_centavos)
    values ($1,$2,$3,'Ventana','pieza',1,$4,150,$5,35000,1) returning id,precio_centavos,importe_centavos`,
    [taller,quote,material,ancho,cantidad]);
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    dueno = nuevoDueno();
    taller = await crearTallerCon(db, dueno, "Integridad");
    quote = (await crearCotizacion(db,taller,"Cliente")).id;
    material = (await db.query("select id from materials where workshop_id=$1 and clave='corrediza-2-6mm'",[taller])).rows[0].id;
    await comoUsuario(db,dueno);
  });
  afterEach(() => db.query("rollback"));
  it("precio, importe y total son autoritativos en una sola sentencia", async () => {
    expect((await insertar()).rows[0]).toMatchObject({precio_centavos:185000,importe_centavos:368000});
    expect((await totales()).total_centavos).toBe(368000);
  });
  it("no permite alterar totales a mano", async () => {
    await insertar();
    await db.query("update quotes set total_centavos=1,subtotal_centavos=1 where id=$1",[quote]);
    expect((await totales()).total_centavos).toBe(368000);
  });
  it("conserva foto y recalcula al cambiar medidas, no el precio enviado", async () => {
    const item = (await insertar()).rows[0].id;
    await db.query("update materials set precio_centavos=999999 where id=$1",[material]);
    await db.query("update quote_items set precio_centavos=1,ancho_cm=100 where id=$1",[item]);
    expect((await totales()).total_centavos).toBe(312500);
  });
  it("descuento e IVA son atómicos y con redondeo half-up", async () => {
    await insertar();
    await db.query("update quotes set descuento_pct=10,con_iva=true where id=$1",[quote]);
    expect(await totales()).toEqual({subtotal_centavos:368000,descuento_centavos:36800,iva_centavos:52992,total_centavos:384192});
  });
  it("quitar una partida recalcula dentro del delete", async () => {
    const item = (await insertar()).rows[0].id;
    await db.query("delete from quote_items where id=$1",[item]);
    expect((await totales()).total_centavos).toBe(0);
  });
  it("medidas cero fallan sin escritura parcial", async () => {
    const error = await codigoDeError(db,`insert into quote_items
      (workshop_id,quote_id,material_id,descripcion,unidad,precio_centavos,cantidad,mano_obra_centavos)
      values ($1,$2,$3,'Inválida','m2',1,1,0)`,[taller,quote,material]);
    expect(error).toBe("22023");
    expect((await totales()).total_centavos).toBe(0);
  });
  it("un desbordamiento revierte partida y total", async () => {
    await db.query("savepoint grande");
    await expect(insertar(100000,99)).rejects.toMatchObject({code:"22003"});
    await db.query("rollback to savepoint grande");
    expect((await totales()).total_centavos).toBe(0);
    expect((await db.query("select count(*)::int as n from quote_items where quote_id=$1",[quote])).rows[0].n).toBe(0);
  });

  it.each([
    ["m2",50,100,1,1,0,1],
    ["m2",120,150,2,185000,35000,736000],
    ["ml",120,150,1,9500,15000,66300],
    ["pieza",0,0,3,18000,25000,129000],
  ])("redondeo y unidades %s", async (unidad,ancho,alto,cantidad,precio,mano,esperado) => {
    await db.query("update materials set unidad=$2,precio_centavos=$3 where id=$1",[material,unidad,precio]);
    await db.query(`insert into quote_items
      (workshop_id,quote_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
      values ($1,$2,$3,'Prueba','pieza',0,$4,$5,$6,$7)`,[taller,quote,material,ancho,alto,cantidad,mano]);
    expect((await totales()).total_centavos).toBe(esperado);
  });

  async function concurrente() {
    const conexion = nuevaConexion();
    await conexion.connect();
    try {
      await conexion.query("begin");
      await comoUsuario(conexion,dueno);
      await conexion.query(`insert into quote_items
        (workshop_id,quote_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
        values ($1,$2,$3,'Concurrente','pieza',1,120,150,1,35000)`,[taller,quote,material]);
      await conexion.query("commit");
    } finally { await conexion.end(); }
  }

  it("dos partidas concurrentes conservan el total de ambas", async () => {
    await db.query("commit");
    try {
      await Promise.all([concurrente(),concurrente()]);
      expect((await totales()).total_centavos).toBe(736000);
    } finally {
      await db.query("delete from workshops where id=$1",[taller]);
      await db.query("delete from auth.users where id=$1",[dueno.id]);
    }
  });
});
