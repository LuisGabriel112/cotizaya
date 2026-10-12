const dinero = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const metros = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12345678 → "$123,456.78". El dinero siempre viaja en centavos enteros. */
export function formatCentavos(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) {
    throw new TypeError(`Centavos debe ser entero: ${centavos}`);
  }
  return dinero.format(centavos / 100);
}

/** 42 → "0042". */
export function formatFolio(folio: number): string {
  return String(folio).padStart(4, "0");
}

const fechaCorta = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "America/Mexico_City" });
const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" });

/** ISO → "11 oct". */
export function formatFecha(iso: string): string {
  return fechaCorta.format(new Date(iso)).replace(".", "");
}

/** ISO → "9:42 a.m." */
export function formatHora(iso: string): string {
  return hora.format(new Date(iso));
}

/** Medidas de una partida según su unidad: "1.20 × 1.50 m ×2" o "8 pzas". */
export function formatMedidas(
  anchoCm: number,
  altoCm: number,
  unidad: "m2" | "ml" | "pieza",
  cantidad: number,
  pieza: readonly [string, string] = ["pza", "pzas"],
): string {
  if (unidad === "pieza") return `${cantidad} ${cantidad === 1 ? pieza[0] : pieza[1]}`;
  const medidas = `${metros.format(anchoCm / 100)} × ${metros.format(altoCm / 100)} m`;
  return cantidad > 1 ? `${medidas} ×${cantidad}` : medidas;
}

/** Medida que se está capturando: lo que falta sale como "?", p. ej. "1.20 × ? m". */
export function formatMedidaParcial(anchoCm: number, altoCm: number): string {
  const lado = (cm: number) => (cm > 0 ? metros.format(cm / 100) : "?");
  return `${lado(anchoCm)} × ${lado(altoCm)} m`;
}

/** 120 → "1.20 m". Las medidas se guardan en cm y se muestran en m. */
export function formatMetros(cm: number): string {
  if (!Number.isFinite(cm)) {
    throw new TypeError(`Medida inválida: ${cm}`);
  }
  return `${metros.format(cm / 100)} m`;
}
