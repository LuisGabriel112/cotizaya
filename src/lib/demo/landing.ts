import { crearCatalogo } from "@/lib/cotizaciones/catalogo";
import type { Cotizacion, Plantilla } from "@/lib/cotizaciones/tipos";
import { CATALOGO } from "./catalogo";
import { PLANTILLAS } from "./plantillas";

/** Catálogo de ejemplo de la landing: el mismo del prototipo, sin localStorage ni red. */
export const CATALOGO_LANDING = crearCatalogo(CATALOGO, PLANTILLAS);

/** Cuatro trabajos de todos los días en la costa: llenan la rejilla de dos columnas de 360 px. */
export const TRABAJOS_HERO: Plantilla[] = ["corrediza", "mosquitero", "cancel", "abatible"].map((id) => CATALOGO_LANDING.plantilla(id)!);

/** La hoja arranca con una partida hecha: se ve llena desde el servidor, sin salto de layout. */
export const COTIZACION_HERO: Cotizacion = {
  id: "hero",
  folio: 43,
  slug: "hero",
  cliente: "Sra. Leticia Cruz",
  partidas: [
    { id: "hero-1", plantillaId: "corrediza", descripcion: "Ventana corrediza", materialId: "corrediza-2-6mm", anchoCm: 120, altoCm: 150, cantidad: 1, manoObraCentavos: 35_000 },
  ],
  descuentoPct: 0,
  conIva: true,
  acabado: "natural",
  garantiaSalitre: false,
  estado: "borrador",
  creadaEn: "2026-10-16T09:00:00-06:00",
};
