import { interpretarPago, type PagoMp, type RegistroPago } from "@/lib/pagos/planes";

interface EntradaWebhook { tipo: string; dataId: string; firma: string; requestId: string }
export interface DependenciasWebhook {
  firmaValida: (entrada: Pick<EntradaWebhook, "firma" | "requestId" | "dataId">) => boolean;
  obtenerPago: (id: string) => Promise<PagoMp>;
  registrarPago: (registro: RegistroPago) => Promise<void>;
}

export async function procesarNotificacion(entrada: EntradaWebhook, deps: DependenciasWebhook): Promise<number> {
  if (!entrada.dataId) return 400;
  if (!deps.firmaValida({ firma: entrada.firma, requestId: entrada.requestId, dataId: entrada.dataId })) return 401;
  if (entrada.tipo !== "payment") return 200;
  try {
    const resultado = interpretarPago(await deps.obtenerPago(entrada.dataId));
    if (!resultado.ok) {
      console.warn(resultado.motivo);
      return 200;
    }
    await deps.registrarPago(resultado.registro);
    return 200;
  } catch {
    return 500;
  }
}
