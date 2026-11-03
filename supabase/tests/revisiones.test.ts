import { afterAll,afterEach,beforeAll,beforeEach,expect,it } from "vitest";
import { nuevaConexion,nuevoDueno,suiteDeBase as suite } from "./conexion";
import { codigoDeError,comoUsuario,crearCotizacion,crearTallerCon,type Dueno } from "./pg-sesion";

suite("revisiones e historial inmutable",()=>{
  const db=nuevaConexion();
  let dueno:Dueno,taller:string,quote:{id:string;public_slug:string};
  const publica=async()=>(await db.query("select public.cotizacion_publica($1) as v",[quote.public_slug])).rows[0].v;
  const revisar=async()=>(await db.query("select public.revisar_cotizacion($1) as id",[quote.id])).rows[0].id;
  beforeAll(()=>db.connect());afterAll(()=>db.end());
  beforeEach(async()=>{
    await db.query("begin");dueno=nuevoDueno();taller=await crearTallerCon(db,dueno,"El Faro");
    quote=await crearCotizacion(db,taller,"Cliente");
    await db.query(`insert into quote_items(quote_id,workshop_id,material_id,descripcion,unidad,precio_centavos,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
      select $1,$2,id,'Ventana',unidad,precio_centavos,120,150,1,35000 from materials where workshop_id=$2 and clave='corrediza-2-6mm'`,[quote.id,taller]);
    await comoUsuario(db,dueno);await db.query("select public.emitir_cotizacion($1)",[quote.id]);
  });
  afterEach(()=>db.query("rollback"));
  it("crear revisión conserva padre, raíz y oferta anterior",async()=>{
    const previa=await publica();const id=await revisar();
    const {rows}=await db.query("select status,revision_of_id,revision_root_id,public_slug,total_centavos,sent_at from quotes where id=$1",[id]);
    expect(rows[0]).toMatchObject({status:"borrador",revision_of_id:quote.id,revision_root_id:quote.id,total_centavos:368000,sent_at:null});
    expect(rows[0].public_slug).not.toBe(quote.public_slug);expect(await publica()).toEqual(previa);
  });
  it("perfil y catálogo posteriores no alteran el documento emitido",async()=>{
    const previa=await publica();
    await db.query("update workshops set nombre='Nuevo nombre',condiciones='Nuevas condiciones' where id=$1",[taller]);
    await db.query("update materials set precio_centavos=999999 where workshop_id=$1",[taller]);
    expect(await publica()).toEqual(previa);
  });
  it("no permite editar partidas ni encabezado emitidos",async()=>{
    expect(await codigoDeError(db,"update quotes set cliente_nombre='Otro' where id=$1",[quote.id])).toBe("42501");
    expect(await codigoDeError(db,"update quote_items set ancho_cm=100 where quote_id=$1",[quote.id])).toBe("42501");
    expect(await codigoDeError(db,"delete from quote_items where quote_id=$1",[quote.id])).toBe("42501");
  });
  it("la revisión toma precios actuales y la anterior conserva el suyo",async()=>{
    await db.query("update materials set precio_centavos=200000 where workshop_id=$1",[taller]);
    const id=await revisar();
    expect((await db.query("select total_centavos from quotes where id=$1",[id])).rows[0].total_centavos).toBe(395000);
    expect((await publica()).items[0].precio_centavos).toBe(185000);
  });
  it("un taller ajeno no puede revisar la oferta",async()=>{
    await comoUsuario(db,nuevoDueno());
    expect(await codigoDeError(db,"select public.revisar_cotizacion($1)",[quote.id])).toBe("42501");
  });
  it("no deja borrador parcial cuando falta un material",async()=>{
    await db.query("delete from materials where workshop_id=$1",[taller]);
    expect(await codigoDeError(db,"select public.revisar_cotizacion($1)",[quote.id])).toBe("22023");
    expect((await db.query("select count(*)::int as n from quotes where workshop_id=$1",[taller])).rows[0].n).toBe(1);
  });
  it("repetir crear revisión reutiliza el mismo borrador",async()=>{
    const id=await revisar();expect(await revisar()).toBe(id);
  });
  it("solo al emitir la revisión deja de aceptarse la anterior",async()=>{
    const id=await revisar();
    await db.query("select public.emitir_cotizacion($1)",[id]);
    expect(await codigoDeError(db,"select public.aceptar_cotizacion($1)",[quote.public_slug])).toBe("22023");
    expect((await publica()).quote.superseded_at).toBeTruthy();
    const {rows}=await db.query("select * from public.historial_cotizacion($1)",[id]);
    expect(rows.map(r=>r.id)).toEqual([id,quote.id]);
  });
});
