import { calcularPartida, calcularTotales, type PartidaEntrada, type ResultadoPartida, type Totales } from "@/lib/quote";
import { materialPorId } from "./catalogo";
import type { Cotizacion, PartidaGuardada } from "./tipos";

export function aPartidaEntrada(p: Pick<PartidaGuardada, "materialId" | "anchoCm" | "altoCm" | "cantidad" | "manoObraCentavos">): PartidaEntrada {
  const material = materialPorId(p.materialId);
  return {
    anchoCm: p.anchoCm,
    altoCm: p.altoCm,
    cantidad: p.cantidad,
    // Un material que ya no existe en el catálogo deja la partida en error, no en cero.
    material: material ?? { unidad: "pieza", precioCentavos: Number.NaN },
    manoObraCentavos: p.manoObraCentavos,
  };
}

export interface Resumen {
  renglones: { partida: PartidaGuardada; resultado: ResultadoPartida }[];
  totales: Totales;
}

export function resumir(c: Cotizacion): Resumen {
  const entradas = c.partidas.map(aPartidaEntrada);
  return {
    renglones: c.partidas.map((partida, i) => ({ partida, resultado: calcularPartida(entradas[i]!) })),
    totales: calcularTotales(entradas, { descuentoPct: c.descuentoPct, conIva: c.conIva }),
  };
}
