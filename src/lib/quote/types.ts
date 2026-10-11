export type Unidad = "m2" | "ml" | "pieza";

export interface Material {
  id: string;
  nombre: string;
  linea?: string;
  unidad: Unidad;
  precioCentavos: number;
  /** Para unidad "pieza": cómo se llama la pieza en singular y plural. */
  pieza?: readonly [string, string];
}

export interface PartidaEntrada {
  anchoCm: number;
  altoCm: number;
  cantidad: number;
  material: Pick<Material, "unidad" | "precioCentavos">;
  manoObraCentavos: number;
}

export type ErrorPartida = "medida-invalida" | "cantidad-invalida" | "precio-invalido";

export type ResultadoPartida =
  | { ok: true; materialCentavos: number; importeCentavos: number }
  | { ok: false; error: ErrorPartida };

export interface OpcionesTotales {
  /** Porcentaje entero de 0 a 100. Se aplica antes del IVA. */
  descuentoPct: number;
  conIva: boolean;
}

export interface Totales {
  subtotalCentavos: number;
  descuentoCentavos: number;
  baseCentavos: number;
  ivaCentavos: number;
  totalCentavos: number;
  /** Índices de las partidas que no se sumaron por tener error. */
  partidasConError: number[];
}
