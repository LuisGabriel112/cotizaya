import type { Unidad } from "@/lib/quote";

/** Unidad en palabras, como la dice el taller. Módulo hoja: lo carga también el cliente. */
export function etiquetaUnidad(unidad: Unidad): string {
  return { m2: "por m²", ml: "por metro", pieza: "por pieza" }[unidad];
}
