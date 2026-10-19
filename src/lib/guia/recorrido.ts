import { IDS_GUIA, type IdGuia, type Paso } from "./pasos";

export interface Rect { top: number; left: number; width: number; height: number }
export interface Pantalla { width: number; height: number }
export type Colocacion = { lado: "abajo" | "encima"; bottom: number };

export function pasosPresentes(pasos: readonly Paso[], existe: (objetivo: string) => boolean): Paso[] {
  const presente = (paso: Paso) => existe(paso.objetivo);
  return pasos.filter(presente);
}

export function avanzar(indice: number, total: number): number | "fin" {
  const siguiente = indice + 1;
  return siguiente < total ? siguiente : "fin";
}

export function retroceder(indice: number): number {
  const anterior = indice - 1;
  return Math.max(0, anterior);
}

export function rotuloPaso(indice: number, total: number): string {
  const numero = indice + 1;
  return `${numero} de ${total}`;
}

export function recorte(rect: Rect, pantalla: Pantalla, margen: number): { hueco: Rect; tapas: Rect[] } {
  const left = Math.min(pantalla.width, Math.max(0, rect.left - margen));
  const top = Math.min(pantalla.height, Math.max(0, rect.top - margen));
  const derecha = Math.min(pantalla.width, Math.max(left, rect.left + rect.width + margen));
  const abajo = Math.min(pantalla.height, Math.max(top, rect.top + rect.height + margen));
  const hueco = { top, left, width: derecha - left, height: abajo - top };
  const tapas = [
    { top: 0, left: 0, width: pantalla.width, height: top },
    { top: abajo, left: 0, width: pantalla.width, height: pantalla.height - abajo },
    { top, left: 0, width: left, height: hueco.height },
    { top, left: derecha, width: pantalla.width - derecha, height: hueco.height },
  ];
  return { hueco, tapas };
}

const cabeAbajo = (hueco: Rect, pantalla: Pantalla, altoHoja: number, margen: number) =>
  hueco.top + hueco.height + margen + altoHoja + margen <= pantalla.height;
const cabeEncima = (hueco: Rect, altoHoja: number, margen: number) => hueco.top >= altoHoja + 2 * margen;

export function colocar(hueco: Rect, pantalla: Pantalla, altoHoja: number, margen: number): Colocacion {
  // Si no cabe de ningún lado, la hoja se queda abajo: tapar un poco es mejor que salirse de la pantalla.
  if (cabeAbajo(hueco, pantalla, altoHoja, margen) || !cabeEncima(hueco, altoHoja, margen)) return { lado: "abajo", bottom: margen };
  return { lado: "encima", bottom: pantalla.height - hueco.top + margen };
}

const fueraDePantalla = (hueco: Rect, pantalla: Pantalla) => hueco.top < 0 || hueco.top + hueco.height > pantalla.height;

/** Recibe el hueco SIN recortar a la pantalla: con uno recortado, lo que asoma por arriba se acomodaría de 16 en 16 px. */
export function desplazamiento(hueco: Rect, pantalla: Pantalla, altoHoja: number, margen: number): number {
  if (fueraDePantalla(hueco, pantalla)) return hueco.top - margen;
  if (cabeAbajo(hueco, pantalla, altoHoja, margen) || cabeEncima(hueco, altoHoja, margen)) return 0;
  return hueco.top - margen;
}

export function agrandar(rect: Rect, margen: number): Rect {
  return { top: rect.top - margen, left: rect.left - margen, width: rect.width + 2 * margen, height: rect.height + 2 * margen };
}

export function leerVistas(crudo: string | null): IdGuia[] {
  try {
    const ids: unknown = JSON.parse(crudo ?? "[]");
    return Array.isArray(ids) ? ids.filter((id): id is IdGuia => IDS_GUIA.includes(id)) : [];
  } catch {
    return [];
  }
}

export function marcarVista(vistas: readonly IdGuia[], id: IdGuia): IdGuia[] {
  const unicas = new Set([...vistas, id]);
  return [...unicas];
}

export function serializarVistas(vistas: readonly IdGuia[]): string {
  const ids = [...vistas];
  return JSON.stringify(ids);
}
