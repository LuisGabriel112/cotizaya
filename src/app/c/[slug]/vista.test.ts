import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VistaPublica as Datos } from "@/lib/server/supabase/publica";

const mocks = vi.hoisted(()=>({aceptar:vi.fn(),estado:vi.fn(),error:vi.fn(),ocupada:vi.fn()}));
vi.mock("./acciones",()=>({aceptarCotizacion:mocks.aceptar,registrarApertura:vi.fn()}));
vi.mock("react",async importar=>({...await importar<typeof import("react")>(),
  useCallback:(fn:unknown)=>fn,
  useState:(inicial:unknown)=>[inicial,typeof inicial==="boolean"?mocks.ocupada:typeof inicial==="string"?mocks.error:mocks.estado],
}));
import { VistaPublica } from "./vista";

const datos = {cotizacion:{id:"publica",estado:"enviada"},taller:{nombre:"Taller"}} as Datos;
const aceptar = () => (VistaPublica({slug:"0042-abcdef123456",vista:datos}) as ReactElement<{onAceptar:()=>Promise<void>}>).props.onAceptar();
beforeEach(()=>vi.clearAllMocks());
describe("confirmación de aceptación",()=>{
  it("no confirma aceptación hasta que el servidor termine",async()=>{
    let resolver!:()=>void;
    mocks.aceptar.mockReturnValue(new Promise<void>(res=>{resolver=res;}));
    const pendiente=aceptar();
    expect(mocks.estado).not.toHaveBeenCalled();
    resolver(); await pendiente;
    expect(mocks.estado).toHaveBeenCalledOnce();
  });
  it("un fallo o vencimiento no muestra aceptada y ofrece error",async()=>{
    mocks.aceptar.mockRejectedValue(new Error("cotizacion-no-vigente"));
    await aceptar();
    expect(mocks.estado).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenLastCalledWith(expect.stringMatching(/vencido|intenta/));
    expect(mocks.ocupada).toHaveBeenLastCalledWith(false);
  });
});
