import type { OpcionesTotales, PartidaEntrada, ResultadoPartida, Totales } from "./types";

export type * from "./types";
export { limpiarCifra, parsearCantidad, parsearCm, parsearDescuento } from "./entrada";

export const TASA_IVA_PCT = 16;

const esEnteroPositivo = (n: number) => Number.isSafeInteger(n) && n > 0;

/** Divide enteros no negativos y redondea half-up. */
function dividirRedondeando(numerador: number, divisor: number): number {
  return Math.floor((numerador * 2 + divisor) / (divisor * 2));
}

/** Medidas absurdas pueden desbordar la precisión entera; mejor error que un monto corrupto. */
const desborda = (...ns: number[]) => ns.some((n) => !Number.isSafeInteger(n * 2));

/**
 * Importe de una partida: material según su unidad + mano de obra por pieza.
 * Redondea una sola vez, al final del material.
 */
export function calcularPartida(p: PartidaEntrada): ResultadoPartida {
  const { anchoCm, altoCm, cantidad, material, manoObraCentavos } = p;

  if (!esEnteroPositivo(cantidad)) return { ok: false, error: "cantidad-invalida" };
  if (!Number.isSafeInteger(material.precioCentavos) || material.precioCentavos < 0) {
    return { ok: false, error: "precio-invalido" };
  }
  if (!Number.isSafeInteger(manoObraCentavos) || manoObraCentavos < 0) {
    return { ok: false, error: "precio-invalido" };
  }

  let materialCentavos: number;
  switch (material.unidad) {
    case "m2": {
      if (!esEnteroPositivo(anchoCm) || !esEnteroPositivo(altoCm)) {
        return { ok: false, error: "medida-invalida" };
      }
      // cm × cm / 10 000 = m²
      const numerador = anchoCm * altoCm * material.precioCentavos * cantidad;
      if (desborda(numerador)) return { ok: false, error: "medida-invalida" };
      materialCentavos = dividirRedondeando(numerador, 10_000);
      break;
    }
    case "ml": {
      if (!esEnteroPositivo(anchoCm) || !esEnteroPositivo(altoCm)) {
        return { ok: false, error: "medida-invalida" };
      }
      // perímetro en cm / 100 = m
      const numerador = 2 * (anchoCm + altoCm) * material.precioCentavos * cantidad;
      if (desborda(numerador)) return { ok: false, error: "medida-invalida" };
      materialCentavos = dividirRedondeando(numerador, 100);
      break;
    }
    case "pieza":
      materialCentavos = material.precioCentavos * cantidad;
      break;
  }

  const manoObraTotal = manoObraCentavos * cantidad;
  const importeCentavos = materialCentavos + manoObraTotal;
  if (desborda(importeCentavos)) return { ok: false, error: "medida-invalida" };

  return { ok: true, materialCentavos, manoObraCentavos: manoObraTotal, importeCentavos };
}

/** Subtotal, descuento (antes de IVA), IVA opcional y total. */
export function calcularTotales(partidas: readonly PartidaEntrada[], opciones: OpcionesTotales): Totales {
  const descuentoPct = Math.min(100, Math.max(0, Math.trunc(opciones.descuentoPct)));
  const partidasConError: number[] = [];
  let subtotalCentavos = 0;

  partidas.forEach((p, i) => {
    const r = calcularPartida(p);
    if (r.ok) subtotalCentavos += r.importeCentavos;
    else partidasConError.push(i);
  });

  const descuentoCentavos = dividirRedondeando(subtotalCentavos * descuentoPct, 100);
  const baseCentavos = subtotalCentavos - descuentoCentavos;
  const ivaCentavos = opciones.conIva ? dividirRedondeando(baseCentavos * TASA_IVA_PCT, 100) : 0;

  return {
    subtotalCentavos,
    descuentoCentavos,
    baseCentavos,
    ivaCentavos,
    totalCentavos: baseCentavos + ivaCentavos,
    partidasConError,
  };
}
