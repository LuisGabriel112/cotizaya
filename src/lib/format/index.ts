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

/** 120 → "1.20 m". Las medidas se guardan en cm y se muestran en m. */
export function formatMetros(cm: number): string {
  if (!Number.isFinite(cm)) {
    throw new TypeError(`Medida inválida: ${cm}`);
  }
  return `${metros.format(cm / 100)} m`;
}
