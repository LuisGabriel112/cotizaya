// Lo que el PDF muestra, ya formateado. La plantilla solo pinta: no calcula ni formatea.

export interface RenglonPdf {
  descripcion: string;
  /** "1.20 × 1.50 m"; vacío cuando el material se cobra por pieza. */
  medidas: string;
  /** "2" o "8 pzas". */
  cantidad: string;
  importe: string;
}

export interface TotalesPdf {
  subtotal: string;
  /** Solo si hay descuento: "Descuento 10%". */
  descuento?: { etiqueta: string; importe: string };
  /** Solo si lleva IVA. */
  iva?: string;
  total: string;
}

export interface DocumentoPdf {
  folio: string;
  fecha: string;
  vigencia: string;
  cliente: string;
  taller: { nombre: string; ciudad: string; telefono: string; logoUrl?: string };
  renglones: RenglonPdf[];
  /** Recuadro antes del total; vacío si no hay acabado especial ni garantía. */
  extras: string[];
  totales: TotalesPdf;
  condiciones: string;
  /** "Hecho con Cotiza Ya": solo plan gratis. */
  conMarca: boolean;
}
