import type { Plantilla } from "@/lib/cotizaciones/tipos";

// Plantillas de costa. Mano de obra de ejemplo.
export const PLANTILLAS: Plantilla[] = [
  { id: "corrediza", nombre: "Corrediza", descripcion: "Ventana corrediza", materialId: "corrediza-2-6mm", manoObraCentavos: 35_000, croquis: "corrediza" },
  { id: "cancel", nombre: "Cancel de baño", descripcion: "Cancel de baño", materialId: "cancel-templado", manoObraCentavos: 60_000, croquis: "cancel" },
  { id: "mosquitero", nombre: "Mosquitero", descripcion: "Mosquitero", materialId: "mosquitero-fibra", manoObraCentavos: 15_000, croquis: "mosquitero" },
  { id: "abatible", nombre: "Puerta abatible", descripcion: "Puerta abatible", materialId: "abatible-1-34", manoObraCentavos: 80_000, croquis: "abatible" },
  { id: "felpa", nombre: "Felpa y rodamientos", descripcion: "Cambio de felpa y rodamientos", materialId: "felpa-rodamientos", manoObraCentavos: 25_000, croquis: "felpa" },
  { id: "corrosion", nombre: "Corrosión", descripcion: "Reemplazo de perfil por corrosión", materialId: "perfil-corrosion", manoObraCentavos: 40_000, croquis: "corrosion" },
];
