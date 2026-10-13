import { catalogoSoloCroquis } from "@/lib/cotizaciones/catalogo";
import { resumir, type Resumen } from "@/lib/cotizaciones/resumen";
import { ACABADOS, type Cotizacion, type PartidaGuardada } from "@/lib/cotizaciones/tipos";
import { formatCentavos, formatFolio, formatMedidas } from "@/lib/format";
import type { VistaPublica } from "@/lib/server/supabase/publica";
import { formatTelefono } from "@/lib/telefono";
import type { DocumentoPdf, RenglonPdf, TotalesPdf } from "./tipos";

// Fuentes estándar del PDF (WinAnsi): sin "−" tipográfico; el descuento usa "-".
const fechaLarga = new Intl.DateTimeFormat("es-MX", {
  day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City",
});

function vigencia(creadaEn: string): string {
  const fecha = new Date(creadaEn);
  fecha.setUTCDate(fecha.getUTCDate() + 15);
  return `Vigencia: 15 días, hasta el ${fechaLarga.format(fecha)}`;
}

function extrasDe(cotizacion: Cotizacion): string[] {
  const extras: string[] = [];
  if (cotizacion.acabado !== "natural") extras.push(`Acabado: ${ACABADOS[cotizacion.acabado]}`);
  if (cotizacion.garantiaSalitre) extras.push("Garantía contra salitre");
  return extras;
}

function renglonDe(partida: PartidaGuardada, importeCentavos: number): RenglonPdf {
  const material = partida.material!;
  const porPieza = material.unidad === "pieza";
  return {
    descripcion: partida.descripcion,
    medidas: porPieza ? "" : formatMedidas(partida.anchoCm, partida.altoCm, material.unidad, 1),
    cantidad: porPieza ? formatMedidas(0, 0, "pieza", partida.cantidad, material.pieza) : String(partida.cantidad),
    importe: formatCentavos(importeCentavos),
  };
}

function totalesDe(resumen: Resumen, cotizacion: Cotizacion): TotalesPdf {
  const { subtotalCentavos, descuentoCentavos, ivaCentavos, totalCentavos } = resumen.totales;
  return {
    subtotal: formatCentavos(subtotalCentavos),
    ...(cotizacion.descuentoPct > 0 && { descuento: {
      etiqueta: `Descuento ${cotizacion.descuentoPct}%`, importe: `-${formatCentavos(descuentoCentavos)}`,
    } }),
    ...(cotizacion.conIva && { iva: formatCentavos(ivaCentavos) }),
    total: formatCentavos(totalCentavos),
  };
}

export function armarDocumento({ cotizacion, taller }: VistaPublica): DocumentoPdf {
  const resumen = resumir(cotizacion, catalogoSoloCroquis());
  const renglones = resumen.renglones.flatMap(({ partida, resultado }) =>
    resultado.ok ? [renglonDe(partida, resultado.importeCentavos)] : []);
  return {
    folio: formatFolio(cotizacion.folio), fecha: fechaLarga.format(new Date(cotizacion.creadaEn)),
    vigencia: vigencia(cotizacion.creadaEn), cliente: cotizacion.cliente,
    taller: { nombre: taller.nombre, ciudad: taller.ciudad, telefono: formatTelefono(taller.telefono),
      ...(taller.logoUrl && { logoUrl: taller.logoUrl }) },
    renglones, extras: extrasDe(cotizacion), totales: totalesDe(resumen, cotizacion),
    condiciones: taller.condiciones, conMarca: taller.plan === "gratis",
  };
}
