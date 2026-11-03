import { beforeEach,describe,expect,it,vi } from "vitest";
const mocks=vi.hoisted(()=>({rpc:vi.fn(),sesion:vi.fn(),porId:vi.fn()}));
vi.mock("@/lib/server/supabase/cliente",()=>({clienteServidor:async()=>({rpc:mocks.rpc})}));
vi.mock("@/lib/server/supabase/sesion",()=>({exigirTaller:mocks.sesion}));
vi.mock("@/lib/server/supabase/repositorio",async importar=>({
  ...await importar<typeof import("@/lib/server/supabase/repositorio")>(),
  RepositorioSupabase:class{porId=mocks.porId;},
}));
import { historialCotizacion,revisarCotizacion } from "./acciones";
const id="11111111-1111-4111-8111-111111111111",nuevo="22222222-2222-4222-8222-222222222222";
beforeEach(()=>{vi.clearAllMocks();mocks.sesion.mockResolvedValue({workshopId:"taller"});mocks.porId.mockResolvedValue({id:nuevo});});
describe("acciones de revisión autorizadas",()=>{
  it("crea mediante RPC y carga el borrador confirmado",async()=>{
    mocks.rpc.mockResolvedValue({data:nuevo,error:null});
    expect(await revisarCotizacion(id)).toEqual({id:nuevo});
    expect(mocks.rpc).toHaveBeenCalledWith("revisar_cotizacion",{p_id:id});
    expect(mocks.porId).toHaveBeenCalledWith(nuevo);
  });
  it("sin sesión no llama al RPC",async()=>{
    mocks.sesion.mockRejectedValue(new Error("sin-taller"));
    await expect(revisarCotizacion(id)).rejects.toThrow("sin-taller");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("no fabrica una revisión si la base rechaza el cupo",async()=>{
    mocks.rpc.mockResolvedValue({data:null,error:{code:"CY429",message:"cupo"}});
    await expect(revisarCotizacion(id)).rejects.toThrow();expect(mocks.porId).not.toHaveBeenCalled();
  });
  it("historial expone solo sus referencias de navegación",async()=>{
    mocks.rpc.mockResolvedValue({data:[{id,folio:1,status:"enviada",privado:"no-exponer"}],error:null});
    expect(await historialCotizacion(id)).toEqual([{id,folio:1,estado:"enviada"}]);
  });
});
