import type { Catalogo } from "@/lib/cotizaciones/catalogo";
import type { Cotizacion, FotoMaterial, PartidaGuardada, Plantilla } from "@/lib/cotizaciones/tipos";
import { parsearCantidad, parsearCm } from "@/lib/quote";

/** Partida mientras se contesta: lo tecleado aún como texto. */
export interface Borrador {
  partidaId: string;
  nueva: boolean;
  plantillaId: string;
  descripcion: string;
  materialId: string;
  manoObraCentavos: number;
  ancho: string;
  alto: string;
  cantidad: string;
  material?: FotoMaterial;
}

export type PasoMedida = "ancho" | "alto" | "piezas";

export function borradorDePlantilla(pl: Plantilla, partidaId: string): Borrador {
  return {
    partidaId,
    nueva: true,
    plantillaId: pl.id,
    descripcion: pl.descripcion,
    materialId: pl.materialId,
    manoObraCentavos: pl.manoObraCentavos,
    ancho: "",
    alto: "",
    cantidad: "1",
  };
}

export function borradorDePartida(p: PartidaGuardada): Borrador {
  const { id, anchoCm, altoCm, cantidad, ...resto } = p;
  return {
    ...resto,
    partidaId: id,
    nueva: false,
    ancho: anchoCm ? String(anchoCm) : "",
    alto: altoCm ? String(altoCm) : "",
    cantidad: String(cantidad),
  };
}

export function aGuardada(b: Borrador): PartidaGuardada {
  const { partidaId, ancho, alto, cantidad, plantillaId, descripcion, materialId, manoObraCentavos, material } = b;
  return {
    id: partidaId,
    plantillaId,
    descripcion,
    materialId,
    manoObraCentavos,
    ...(material ? { material } : {}),
    // Lo que aún no es medida válida queda en 0: la partida sale en error, nunca con un monto inventado.
    anchoCm: parsearCm(ancho) ?? 0,
    altoCm: parsearCm(alto) ?? 0,
    cantidad: parsearCantidad(cantidad) ?? 0,
  };
}

export function conBorrador(c: Cotizacion, b: Borrador): Cotizacion {
  const p = aGuardada(b);
  const partidas = b.nueva ? [...c.partidas, p] : c.partidas.map((x) => (x.id === p.id ? p : x));
  return { ...c, partidas };
}

export function primerPaso(b: Borrador, catalogo: Catalogo): "ancho" | "piezas" {
  return catalogo.materialDe(b)?.unidad === "pieza" ? "piezas" : "ancho";
}

export function listaParaGuardar(b: Borrador, paso: "alto" | "piezas"): boolean {
  const cantidad = parsearCantidad(b.cantidad) !== null;
  return paso === "piezas" ? cantidad : cantidad && parsearCm(b.ancho) !== null && parsearCm(b.alto) !== null;
}
