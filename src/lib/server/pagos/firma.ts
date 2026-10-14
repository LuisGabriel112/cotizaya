import { createHmac, timingSafeEqual } from "node:crypto";

interface EntradaFirma { secreto: string; firma: string; requestId: string; dataId: string }

export function verificarFirma({ secreto, firma, requestId, dataId }: EntradaFirma): boolean {
  if (!secreto || !firma || !requestId || !dataId) return false;
  const piezas = Object.fromEntries(firma.split(",").map((pieza) => pieza.trim().split("=")));
  const { ts, v1 } = piezas;
  if (!ts || !v1) return false;
  const manifiesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const esperada = createHmac("sha256", secreto).update(manifiesto).digest();
  if (!/^[a-f\d]{64}$/i.test(v1)) return false;
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
