import type { Material } from "@/lib/quote";

// Precios de ejemplo para el prototipo. No son precios reales de ningún taller.
export const CATALOGO: Material[] = [
  { id: "corrediza-2-6mm", nombre: 'Corrediza 2" natural, vidrio 6 mm', linea: '2"', unidad: "m2", precioCentavos: 185_000 },
  { id: "cancel-templado", nombre: "Cancel de baño, templado 6 mm", linea: "Cancel", unidad: "m2", precioCentavos: 240_000 },
  { id: "mosquitero-fibra", nombre: "Mosquitero de fibra de vidrio", linea: "Mosquitero", unidad: "ml", precioCentavos: 9_500 },
  { id: "abatible-1-34", nombre: 'Puerta abatible 1¾", vidrio 6 mm', linea: '1¾"', unidad: "m2", precioCentavos: 290_000 },
  { id: "felpa-rodamientos", nombre: "Felpa y rodamientos, por hoja", linea: "Mantenimiento", unidad: "pieza", precioCentavos: 18_000, pieza: ["hoja", "hojas"] },
  { id: "perfil-corrosion", nombre: "Perfil de reemplazo por corrosión", linea: "Reparación", unidad: "ml", precioCentavos: 21_000 },
];

export function materialPorId(id: string): Material | undefined {
  return CATALOGO.find((m) => m.id === id);
}
