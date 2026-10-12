import type { CambiosCotizacion } from "./estado";

type Enviar = (id: string, cambios: CambiosCotizacion) => void;

/**
 * El nombre del cliente cambia con cada tecla; en obra la señal es mala, así que se
 * manda una sola vez cuando el maestro deja de teclear.
 */
export function crearAgrupador(esperaMs: number, enviar: Enviar) {
  const pendientes = new Map<string, { cambios: CambiosCotizacion; reloj: ReturnType<typeof setTimeout> }>();

  const mandar = (id: string) => {
    const p = pendientes.get(id);
    if (!p) return;
    clearTimeout(p.reloj);
    pendientes.delete(id);
    enviar(id, p.cambios);
  };

  return {
    agregar(id: string, cambios: CambiosCotizacion) {
      const previo = pendientes.get(id);
      if (previo) clearTimeout(previo.reloj);
      pendientes.set(id, { cambios: { ...previo?.cambios, ...cambios }, reloj: setTimeout(() => mandar(id), esperaMs) });
    },
    vaciar() {
      for (const id of [...pendientes.keys()]) mandar(id);
    },
  };
}
