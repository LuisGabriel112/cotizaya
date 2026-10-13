import type { Material } from "@/lib/quote";

export type Estado = "borrador" | "enviada" | "vista" | "aceptada" | "rechazada";

export type Acabado = "natural" | "anodizado" | "electrostatica";

/** Lo que la partida guarda del material al cotizar: si el catálogo cambia, la cotización no. */
export type FotoMaterial = Pick<Material, "unidad" | "precioCentavos" | "pieza">;

export interface PartidaGuardada {
  id: string;
  plantillaId: string;
  descripcion: string;
  materialId: string;
  anchoCm: number;
  altoCm: number;
  cantidad: number;
  manoObraCentavos: number;
  /** Ausente en el prototipo: ahí manda el catálogo de ejemplo. */
  material?: FotoMaterial;
}

export interface Cotizacion {
  id: string;
  folio: number;
  slug: string;
  cliente: string;
  partidas: PartidaGuardada[];
  descuentoPct: number;
  conIva: boolean;
  acabado: Acabado;
  garantiaSalitre: boolean;
  estado: Estado;
  /** ISO. */
  creadaEn: string;
  /** ISO de la última apertura del enlace público. */
  vistaEn?: string;
  /** El cliente abrió el enlace y el maestro aún no entra a verla. */
  avisoPendiente?: boolean;
}

export interface Taller {
  nombre: string;
  ciudad: string;
  telefono: string;
  condiciones: string;
  plan: "gratis" | "fundador";
  planHasta?: string;
  logoUrl?: string;
}

export type Croquis = "corrediza" | "cancel" | "mosquitero" | "abatible" | "felpa" | "corrosion";

export interface Plantilla {
  id: string;
  /** Nombre corto para la ficha de un toque. */
  nombre: string;
  /** Descripción que queda en la partida. */
  descripcion: string;
  materialId: string;
  manoObraCentavos: number;
  croquis: Croquis;
}

export const ACABADOS: Record<Acabado, string> = {
  natural: "Natural",
  anodizado: "Anodizado",
  electrostatica: "Pintura electrostática",
};
