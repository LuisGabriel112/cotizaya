import type { CambiosCotizacion } from "./estado";
import { crearConfirmaciones } from "./confirmaciones";

type Enviar = (id: string, cambios: CambiosCotizacion) => void|Promise<void>;

/**
 * El nombre del cliente cambia con cada tecla; en obra la señal es mala, así que se
 * manda una sola vez cuando el maestro deja de teclear.
 */
export function crearAgrupador(esperaMs: number, enviar: Enviar) {
  const pendientes = new Map<string, { cambios: CambiosCotizacion; reloj: ReturnType<typeof setTimeout> }>();
  const confirmaciones=crearConfirmaciones();

  const mandar = (id: string) => {
    const p = pendientes.get(id);
    if (!p) return;
    clearTimeout(p.reloj);
    pendientes.delete(id);
    try{confirmaciones.agregar(id,enviar(id,p.cambios));}
    catch{confirmaciones.agregar(id,Promise.reject(new Error("edicion-fallida")));}
  };

  return {
    agregar(id: string, cambios: CambiosCotizacion) {
      const previo = pendientes.get(id);
      if (previo) clearTimeout(previo.reloj);
      pendientes.set(id, { cambios: { ...previo?.cambios, ...cambios }, reloj: setTimeout(() => mandar(id), esperaMs) });
    },
    async vaciar(id?:string) {
      for (const clave of [...pendientes.keys()]) if(!id||clave===id)mandar(clave);
      if(id)await confirmaciones.confirmar(id);
      else await confirmaciones.confirmarTodas();
    },
  };
}
