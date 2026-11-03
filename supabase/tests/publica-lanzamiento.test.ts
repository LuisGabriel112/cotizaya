import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { comoAnonimo, comoUsuario, crearCotizacion, crearTallerCon, type Dueno } from "./pg-sesion";

suite("privacidad de enlaces públicos", () => {
  const db = nuevaConexion();
  let dueno: Dueno, taller: string, quote: {id:string;public_slug:string}, material: string;
  const leer = async () => (await db.query("select public.cotizacion_publica($1) as vista",[quote.public_slug])).rows[0].vista;
  beforeAll(() => db.connect()); afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin"); dueno=nuevoDueno();
    taller=await crearTallerCon(db,dueno,"Público"); quote=await crearCotizacion(db,taller,"Cliente");
    material=(await db.query("select id from materials where workshop_id=$1 limit 1",[taller])).rows[0].id;
    await db.query(`insert into quote_items
      (quote_id,workshop_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
      values($1,$2,$3,'Ventana','m2',1,120,150,1,35000)`,[quote.id,taller,material]);
  });
  afterEach(() => db.query("rollback"));
  it("el borrador no se expone a quien solo tiene el enlace", async () => {
    await comoAnonimo(db); expect(await leer()).toBeNull();
    await comoUsuario(db,dueno); expect(await leer()).not.toBeNull();
  });
  it("emitida conserva contenido público y excluye UUID internos", async () => {
    await comoUsuario(db,dueno); await db.query("select public.emitir_cotizacion($1)",[quote.id]);
    await comoAnonimo(db); const vista=await leer(); const json=JSON.stringify(vista);
    expect(vista.items).toHaveLength(1); expect(vista.quote.cliente_nombre).toBe("Cliente");
    for(const id of [taller,quote.id,material,dueno.id]) expect(json).not.toContain(id);
    expect(vista.items[0]).not.toHaveProperty("material_id");
  });
});
