import { useEffect, useState } from "react";
import { CLAVE_GUIA, GUIAS, type IdGuia, type Paso } from "@/lib/guia/pasos";
import { avanzar, leerVistas, marcarVista, pasosPresentes, retroceder, serializarVistas } from "@/lib/guia/recorrido";

export const EVENTO_GUIAS = "cotizaya:guias";
interface Recorrido { pasos: Paso[]; indice: number }

export function buscarObjetivo(objetivo: string): HTMLElement | null {
  const selector = `[data-guia="${objetivo}"]`;
  return document.querySelector<HTMLElement>(selector);
}

function iniciar(id: IdGuia): Recorrido | null {
  try {
    const vistas = leerVistas(localStorage.getItem(CLAVE_GUIA));
    if (vistas.includes(id)) return null;
    const pasos = pasosPresentes(GUIAS[id], existeObjetivo);
    return pasos.length ? { pasos, indice: 0 } : null;
  } catch {
    return null;
  }
}

function existeObjetivo(objetivo: string): boolean {
  const elemento = buscarObjetivo(objetivo);
  return !!elemento && !elemento.matches(":disabled") && elemento.getAttribute("aria-disabled") !== "true";
}

function guardarVista(id: IdGuia): void {
  try {
    const vistas = leerVistas(localStorage.getItem(CLAVE_GUIA));
    localStorage.setItem(CLAVE_GUIA, serializarVistas(marcarVista(vistas, id)));
  } catch {
    // Cerrar la ayuda debe funcionar aunque el navegador no permita guardar.
  }
}

export function useVistas(id: IdGuia, listo: boolean) {
  const [recorrido, setRecorrido] = useState<Recorrido | null>(null);
  useEffect(() => {
    if (!listo) return;
    const arrancar = () => setRecorrido(iniciar(id));
    const frame = requestAnimationFrame(arrancar);
    window.addEventListener(EVENTO_GUIAS, arrancar);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(EVENTO_GUIAS, arrancar); };
  }, [id, listo]);
  const cerrar = () => { guardarVista(id); setRecorrido(null); };
  const siguiente = () => {
    if (!recorrido) return;
    const indice = avanzar(recorrido.indice, recorrido.pasos.length);
    if (indice === "fin") return cerrar();
    setRecorrido({ ...recorrido, indice });
  };
  const atras = () => setRecorrido((actual) => actual && { ...actual, indice: retroceder(actual.indice) });
  return { recorrido, siguiente, atras, cerrar };
}
