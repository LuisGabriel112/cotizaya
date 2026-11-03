import { createHmac, timingSafeEqual } from "node:crypto";

interface EntradaFirma { secreto: string; firma: string; requestId: string; dataId: string; ahora?: number }

function reciente(ts: string, ahora: number): boolean {
  if (!/^(\d{10}|\d{13})$/.test(ts) || !Number.isFinite(ahora)) return false;
  const milisegundos = Number(ts) * (ts.length === 10 ? 1000 : 1);
  return Math.abs(ahora - milisegundos) <= 5 * 60 * 1000;
}

export function verificarFirma({ secreto, firma, requestId, dataId, ahora = Date.now() }: EntradaFirma): boolean {
  if (!secreto || !firma || !requestId || !dataId) return false;
  const pares = firma.split(",").map((pieza) => pieza.trim().split("="));
  if (pares.length !== 2 || pares.some((par) => par.length !== 2)) return false;
  const { ts, v1 } = Object.fromEntries(pares);
  if (!ts || !v1 || !reciente(ts, ahora)) return false;
  const manifiesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const esperada = createHmac("sha256", secreto).update(manifiesto).digest();
  if (!/^[a-f\d]{64}$/i.test(v1)) return false;
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
