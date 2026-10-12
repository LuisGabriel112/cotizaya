import type { Cotizacion } from "@/lib/cotizaciones/tipos";

/** Borrador nuevo del prototipo: folio consecutivo y slug con el nombre del taller de ejemplo. */
export function nuevaCotizacionDemo(lista: readonly Cotizacion[], sufijo: string, ahora: string): Cotizacion {
  const folio = Math.max(0, ...lista.map((c) => c.folio)) + 1;
  return {
    id: `c${folio}-${sufijo}`,
    folio,
    slug: `faro-${String(folio).padStart(4, "0")}-${sufijo}`,
    cliente: "",
    partidas: [],
    descuentoPct: 0,
    conIva: false,
    acabado: "natural",
    garantiaSalitre: true,
    estado: "borrador",
    creadaEn: ahora,
  };
}
