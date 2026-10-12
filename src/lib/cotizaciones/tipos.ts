export type Estado = "borrador" | "enviada" | "vista" | "aceptada" | "rechazada";

export type Acabado = "natural" | "anodizado" | "electrostatica";

export interface PartidaGuardada {
  id: string;
  plantillaId: string;
  descripcion: string;
  materialId: string;
  anchoCm: number;
  altoCm: number;
  cantidad: number;
  manoObraCentavos: number;
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
}

export const ACABADOS: Record<Acabado, string> = {
  natural: "Natural",
  anodizado: "Anodizado",
  electrostatica: "Pintura electrostática",
};
