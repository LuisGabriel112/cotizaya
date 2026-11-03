import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { codigoDeError, comoAnonimo, comoPostgres, comoUsuario, crearCotizacion, crearTallerCon, type Dueno } from "./pg-sesion";

suite("primer envío y vigencia", () => {
  const db = nuevaConexion();
  let dueno: Dueno, taller: string, quote: {id:string;public_slug:string};
  const emitir = () => db.query("select public.emitir_cotizacion($1)",[quote.id]);
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    dueno = nuevoDueno();
    taller = await crearTallerCon(db,dueno,"Emisión");
    quote = await crearCotizacion(db,taller,"Cliente");
    await db.query(`insert into quote_items
      (quote_id,workshop_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
      select $1,$2,id,'Ventana',unidad,precio_centavos,120,150,1,35000 from materials
      where workshop_id=$2 and clave='corrediza-2-6mm'`,[quote.id,taller]);
    await comoUsuario(db,dueno);
  });
  afterEach(() => db.query("rollback"));
  it("emite con quince días exactos y un evento incluso al repetir", async () => {
    await emitir(); await emitir();
    const {rows} = await db.query("select status,expires_at-sent_at as plazo from quotes where id=$1",[quote.id]);
    expect(rows[0]).toMatchObject({status:"enviada",plazo:{days:15}});
    expect((await db.query("select count(*)::int as n from quote_events where quote_id=$1 and tipo='enviada'",[quote.id])).rows[0].n).toBe(1);
  });
  it("no permite cambiar estado directamente aunque sea dueño", async () => {
    expect(await codigoDeError(db,"update quotes set status='aceptada' where id=$1",[quote.id])).toBe("42501");
  });
  it("borradores no se aceptan desde un enlace público", async () => {
    await comoAnonimo(db);
    expect(await codigoDeError(db,"select public.aceptar_cotizacion($1)",[quote.public_slug])).toBe("22023");
  });
  it("repetir aceptación/apertura no duplica eventos", async () => {
    await emitir(); await comoAnonimo(db);
    for(let n=0;n<2;n++) await db.query("select public.registrar_apertura($1)",[quote.public_slug]);
    for(let n=0;n<2;n++) await db.query("select public.aceptar_cotizacion($1)",[quote.public_slug]);
    await comoPostgres(db);
    const {rows}=await db.query("select tipo,count(*)::int as n from quote_events where quote_id=$1 group by tipo order by tipo",[quote.id]);
    expect(rows).toEqual([{tipo:"abierta",n:1},{tipo:"aceptada",n:1},{tipo:"enviada",n:1}]);
  });
  it("una cotización vencida no se acepta", async () => {
    await emitir(); await comoPostgres(db);
    await db.query("update quotes set sent_at=now()-interval '16 days',expires_at=now()-interval '1 day' where id=$1",[quote.id]);
    await comoAnonimo(db);
    expect(await codigoDeError(db,"select public.aceptar_cotizacion($1)",[quote.public_slug])).toBe("22023");
  });
});
