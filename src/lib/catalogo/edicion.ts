import type { Material, Unidad } from "@/lib/quote";
import { parsearPrecioCentavos } from "./csv";

export function etiquetaUnidad(unidad: Unidad): string {
  return { m2: "por m²", ml: "por metro", pieza: "por pieza" }[unidad];
}

export function agruparPorLinea<T extends Material>(materiales: readonly T[]): { linea: string; materiales: T[] }[] {
  const lineas = new Map<string, T[]>();
  for (const material of materiales) {
    const linea = material.linea?.trim() || "Otros";
    lineas.set(linea, [...(lineas.get(linea) ?? []), material]);
  }
  return [...lineas].sort(([a], [b]) => a === "Otros" ? 1 : b === "Otros" ? -1 : a.localeCompare(b, "es"))
    .map(([linea, grupo]) => ({ linea, materiales: grupo.sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) }));
}

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function claveDesdeNombre(nombre: string, existentes: readonly string[]): string {
  const base = normalizar(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "material";
  let clave = base;
  let numero = 2;
  while (existentes.includes(clave)) clave = `${base}-${numero++}`;
  return clave;
}

export function nombreRepetido(nombre: string, existentes: readonly string[]): boolean {
  const buscado = normalizar(nombre).replace(/\s+/g, " ");
  return existentes.some((actual) => normalizar(actual).replace(/\s+/g, " ") === buscado);
}

export function validarPrecio(texto: string): { ok: true; centavos: number } | { ok: false; mensaje: string } {
  const centavos = parsearPrecioCentavos(texto);
  return centavos !== null && centavos > 0
    ? { ok: true, centavos }
    : { ok: false, mensaje: "Escribe un precio mayor a cero." };
}

export function precioParaEdicion(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
