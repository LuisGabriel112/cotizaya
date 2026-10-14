import { z } from "zod";

export const PRECIOS = { mes: 9900, anio: 99000 } as const;
export type Periodo = keyof typeof PRECIOS;
export type Metodo = "tarjeta" | "oxxo" | "transferencia";

const esquemaReferencia = z.tuple([z.uuid(), z.enum(["mes", "anio"])]);

export interface PagoMp {
  id: number | string;
  status: string;
  transactionAmount: number;
  currencyId: string;
  paymentTypeId: string;
  externalReference: string | null;
}

export interface RegistroPago {
  taller: string;
  externalId: string;
  metodo: Metodo;
  montoCentavos: number;
  periodo: Periodo;
  status: string;
}

export function referenciaDe(taller: string, periodo: Periodo): string {
  return `${taller}:${periodo}`;
}

export function leerReferencia(referencia: string | null): { taller: string; periodo: Periodo } | null {
  const partes = esquemaReferencia.safeParse(referencia?.split(":") ?? []);
  return partes.success ? { taller: partes.data[0], periodo: partes.data[1] } : null;
}

export function tituloDe(periodo: Periodo): string {
  return `Cotiza Ya, plan fundador: 1 ${periodo === "mes" ? "mes" : "año"}`;
}

export function metodoDe(tipo: string): Metodo | null {
  if (["credit_card", "debit_card", "prepaid_card"].includes(tipo)) return "tarjeta";
  if (tipo === "ticket") return "oxxo";
  if (["bank_transfer", "atm", "account_money"].includes(tipo)) return "transferencia";
  return null;
}

export function interpretarPago(pago: PagoMp): { ok: true; registro: RegistroPago } | { ok: false; motivo: string } {
  const referencia = leerReferencia(pago.externalReference);
  if (!referencia) return { ok: false, motivo: "referencia-invalida" };
  if (pago.currencyId !== "MXN") return { ok: false, motivo: "moneda-incorrecta" };
  const montoCentavos = Math.round(pago.transactionAmount * 100);
  if (montoCentavos !== PRECIOS[referencia.periodo]) return { ok: false, motivo: "monto-incorrecto" };
  const metodo = metodoDe(pago.paymentTypeId);
  if (!metodo) return { ok: false, motivo: "metodo-desconocido" };
  return { ok: true, registro: { taller: referencia.taller, externalId: String(pago.id), metodo, montoCentavos, periodo: referencia.periodo, status: pago.status } };
}
