import { aGuardada, borradorDePlantilla, conBorrador, type Borrador } from "@/components/pantallas/captura/borrador";
import { resumir, type Resumen } from "@/lib/cotizaciones/resumen";
import type { Cotizacion, PartidaGuardada } from "@/lib/cotizaciones/tipos";
import { CATALOGO_LANDING, COTIZACION_HERO, TRABAJOS_HERO } from "@/lib/demo/landing";
import { limpiarCifra, parsearCm } from "@/lib/quote";

/** Hasta aquí llega la demostración: lo que sigue ya es tener cuenta. */
export const TOPE_PARTIDAS = 4;

export interface EstadoHero {
  cotizacion: Cotizacion;
  /** La partida que el visitante está midiendo. */
  borrador: Borrador;
  /** Si ya eligió trabajo o tecleó algo: antes de eso la hoja no muestra renglón en curso. */
  tocado: boolean;
}

export type AccionHero =
  | { tipo: "trabajo"; plantillaId: string }
  | { tipo: "medida"; lado: "ancho" | "alto"; texto: string }
  | { tipo: "agregar" }
  | { tipo: "reiniciar" };

export interface HojaHero extends Resumen {
  /** El renglón que se está midiendo, sin importe hasta que se agrega. */
  enCurso: PartidaGuardada | null;
}

function borradorNuevo(cotizacion: Cotizacion, plantillaId: string): Borrador {
  const plantilla = CATALOGO_LANDING.plantilla(plantillaId) ?? TRABAJOS_HERO[0]!;
  return borradorDePlantilla(plantilla, `hero-${cotizacion.partidas.length + 1}`);
}

export function estadoInicialHero(): EstadoHero {
  return { cotizacion: COTIZACION_HERO, borrador: borradorNuevo(COTIZACION_HERO, "corrediza"), tocado: false };
}

export function lleno(e: EstadoHero): boolean {
  return e.cotizacion.partidas.length >= TOPE_PARTIDAS;
}

export function puedeAgregar(e: EstadoHero): boolean {
  return !lleno(e) && parsearCm(e.borrador.ancho) !== null && parsearCm(e.borrador.alto) !== null;
}

/** El importe y el total solo se mueven al agregar: mientras se mide, el renglón va con raya. */
export function hojaHero(e: EstadoHero): HojaHero {
  return { ...resumir(e.cotizacion, CATALOGO_LANDING), enCurso: e.tocado && !lleno(e) ? aGuardada(e.borrador) : null };
}

export function reducirHero(e: EstadoHero, a: AccionHero): EstadoHero {
  if (a.tipo === "reiniciar") return estadoInicialHero();
  if (a.tipo === "trabajo") return { ...e, borrador: borradorNuevo(e.cotizacion, a.plantillaId), tocado: true };
  if (a.tipo === "medida") return { ...e, borrador: { ...e.borrador, [a.lado]: limpiarCifra(a.texto, { enteros: 3, decimal: true }) }, tocado: true };
  if (!puedeAgregar(e)) return e;
  const cotizacion = conBorrador(e.cotizacion, e.borrador);
  return { cotizacion, borrador: borradorNuevo(cotizacion, e.borrador.plantillaId), tocado: false };
}
