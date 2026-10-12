import { calcularPartida, calcularTotales, type PartidaEntrada, type ResultadoPartida, type Totales } from "@/lib/quote";
import type { Catalogo } from "./catalogo";
import type { Cotizacion, PartidaGuardada } from "./tipos";

type DatosPartida = Pick<PartidaGuardada, "materialId" | "material" | "anchoCm" | "altoCm" | "cantidad" | "manoObraCentavos">;

export function aPartidaEntrada(p: DatosPartida, catalogo: Catalogo): PartidaEntrada {
  return {
    anchoCm: p.anchoCm,
    altoCm: p.altoCm,
    cantidad: p.cantidad,
    // Un material que ya no existe en el catálogo deja la partida en error, no en cero.
    material: catalogo.materialDe(p) ?? { unidad: "pieza", precioCentavos: Number.NaN },
    manoObraCentavos: p.manoObraCentavos,
  };
}

export interface Resumen {
  renglones: { partida: PartidaGuardada; resultado: ResultadoPartida }[];
  totales: Totales;
}

export function resumir(c: Cotizacion, catalogo: Catalogo): Resumen {
  const entradas = c.partidas.map((p) => aPartidaEntrada(p, catalogo));
  return {
    renglones: c.partidas.map((partida, i) => ({ partida, resultado: calcularPartida(entradas[i]!) })),
    totales: calcularTotales(entradas, { descuentoPct: c.descuentoPct, conIva: c.conIva }),
  };
}
