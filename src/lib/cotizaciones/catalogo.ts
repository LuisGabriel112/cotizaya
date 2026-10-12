import type { Material } from "@/lib/quote";
import type { Croquis, FotoMaterial, PartidaGuardada, Plantilla } from "./tipos";

/** Catálogo del taller (o el de ejemplo en /demo), con búsquedas por id. */
export interface Catalogo {
  materiales: readonly Material[];
  plantillas: readonly Plantilla[];
  material: (id: string) => Material | undefined;
  plantilla: (id: string) => Plantilla | undefined;
  /** Material con el que se cobra la partida: su foto si la tiene, si no el catálogo. */
  materialDe: (p: Pick<PartidaGuardada, "materialId" | "material">) => FotoMaterial | undefined;
}

export function crearCatalogo(materiales: readonly Material[], plantillas: readonly Plantilla[]): Catalogo {
  const material = (id: string) => materiales.find((m) => m.id === id);
  return {
    materiales,
    plantillas,
    material,
    plantilla: (id) => plantillas.find((p) => p.id === id),
    materialDe: (p) => p.material ?? material(p.materialId),
  };
}

const CROQUIS: readonly Croquis[] = ["corrediza", "cancel", "mosquitero", "abatible", "felpa", "corrosion"];

/**
 * Para la vista pública: las partidas traen su foto de material y solo falta el croquis,
 * que sale de la clave de la plantilla.
 */
export function catalogoSoloCroquis(): Catalogo {
  const plantillas = CROQUIS.map((croquis) => ({ id: croquis, nombre: "", descripcion: "", materialId: "", manoObraCentavos: 0, croquis }));
  return crearCatalogo([], plantillas);
}
