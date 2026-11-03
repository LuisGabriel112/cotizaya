import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { nuevaConexion, nuevoDueno, suiteDeBase as suite } from "./conexion";
import { codigoDeError, comoUsuario, crearTallerCon } from "./pg-sesion";

suite("cupo: escrituras directas", () => {
  const db = nuevaConexion();
  let taller: string;
  beforeAll(() => db.connect());
  afterAll(() => db.end());
  beforeEach(async () => {
    await db.query("begin");
    const dueno = nuevoDueno();
    taller = await crearTallerCon(db,dueno,"Cupo");
    await comoUsuario(db,dueno);
  });
  afterEach(() => db.query("rollback"));
  it("antedatar no evita el límite de cinco", async () => {
    const alta = "insert into quotes (workshop_id,created_at) values ($1,now()-interval '2 months')";
    for (let i=0;i<5;i++) await db.query(alta,[taller]);
    expect(await codigoDeError(db,alta,[taller])).toBe("CY429");
  });
  it("el dueño no borra cotizaciones para recuperar cupo", async () => {
    await db.query("insert into quotes (workshop_id) values ($1)",[taller]);
    expect(await codigoDeError(db,"delete from quotes where workshop_id=$1",[taller])).toBe("42501");
  });
  it("el cliente no elige estado ni apertura al crear", async () => {
    const {rows} = await db.query(`insert into quotes (workshop_id,status,viewed_at,aviso_pendiente)
      values ($1,'aceptada',now(),true) returning status,viewed_at,aviso_pendiente`,[taller]);
    expect(rows[0]).toEqual({status:"borrador",viewed_at:null,aviso_pendiente:false});
  });
});
