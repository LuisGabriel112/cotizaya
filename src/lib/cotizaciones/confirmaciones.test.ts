import { describe,expect,it,vi } from "vitest";
import { crearConfirmaciones } from "./confirmaciones";
import { compartirConfirmado } from "./compartir";
describe("confirmación previa al envío",()=>{
  it("espera escrituras en vuelo y conserva su error",async()=>{
    const cola=crearConfirmaciones();let resolver!:(v:void)=>void;
    cola.agregar("a",new Promise<void>(r=>{resolver=r;}));
    const listo=vi.fn();const espera=cola.confirmar("a").then(listo);
    expect(listo).not.toHaveBeenCalled();resolver();await espera;expect(listo).toHaveBeenCalledOnce();
    cola.agregar("a",Promise.reject(new Error("fallo")));
    await expect(cola.confirmar("a")).rejects.toThrow("cambios-sin-confirmar");
  });
  it("no navega a WhatsApp hasta confirmar y cierra si falla",async()=>{
    const ventana={opener:{},location:{href:"about:blank"},close:vi.fn()};
    let resolver!:(v:void)=>void;const emitir=()=>new Promise<void>(r=>{resolver=r;});
    const p=compartirConfirmado(()=>ventana,emitir,"https://wa.me/test");
    expect(ventana.location.href).toBe("about:blank");resolver();await p;
    expect(ventana.location.href).toBe("https://wa.me/test");expect(ventana.opener).toBeNull();
    await expect(compartirConfirmado(()=>ventana,()=>Promise.reject(new Error("fallo")),"destino")).rejects.toThrow();
    expect(ventana.close).toHaveBeenCalledOnce();
  });
});
