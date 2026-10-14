import { describe, expect, it, vi } from "vitest";
import type { PagoMp } from "@/lib/pagos/planes";
import { procesarNotificacion, type DependenciasWebhook } from "./webhook";

const TALLER = "11111111-1111-4111-8111-111111111111";
const PAGO: PagoMp = {
  id: 123,
  status: "approved",
  transactionAmount: 99,
  currencyId: "MXN",
  paymentTypeId: "credit_card",
  externalReference: `${TALLER}:mes`,
};
const ENTRADA = { tipo: "payment", dataId: "123", firma: "ts=1,v1=x", requestId: "r" };

function preparar(cambios: Partial<DependenciasWebhook> = {}): DependenciasWebhook {
  return {
    firmaValida: vi.fn().mockReturnValue(true),
    obtenerPago: vi.fn().mockResolvedValue(PAGO),
    registrarPago: vi.fn().mockResolvedValue(undefined),
    ...cambios,
  };
}

describe("procesarNotificacion", () => {
  it("pago válido: lo consulta a la API, lo registra y responde 200", async () => {
    const deps = preparar();
    expect(await procesarNotificacion(ENTRADA, deps)).toBe(200);
    expect(deps.firmaValida).toHaveBeenCalledWith({ firma: "ts=1,v1=x", requestId: "r", dataId: "123" });
    expect(deps.obtenerPago).toHaveBeenCalledWith("123");
    expect(deps.registrarPago).toHaveBeenCalledWith({
      taller: TALLER,
      externalId: "123",
      metodo: "tarjeta",
      montoCentavos: 9900,
      periodo: "mes",
      status: "approved",
    });
  });

  it("firma inválida: 401 sin consultar ni registrar", async () => {
    const deps = preparar({ firmaValida: vi.fn().mockReturnValue(false) });
    expect(await procesarNotificacion(ENTRADA, deps)).toBe(401);
    expect(deps.obtenerPago).not.toHaveBeenCalled();
    expect(deps.registrarPago).not.toHaveBeenCalled();
  });

  it("sin data.id: 400 sin revisar nada más", async () => {
    const deps = preparar();
    expect(await procesarNotificacion({ ...ENTRADA, dataId: "" }, deps)).toBe(400);
    expect(deps.firmaValida).not.toHaveBeenCalled();
  });

  it("notificación que no es de pago: 200 sin consultar", async () => {
    const deps = preparar();
    expect(await procesarNotificacion({ ...ENTRADA, tipo: "merchant_order" }, deps)).toBe(200);
    expect(deps.obtenerPago).not.toHaveBeenCalled();
  });

  it("pago que no corresponde (monto): 200 para que no reintente, sin registrar", async () => {
    const deps = preparar({ obtenerPago: vi.fn().mockResolvedValue({ ...PAGO, transactionAmount: 50 }) });
    expect(await procesarNotificacion(ENTRADA, deps)).toBe(200);
    expect(deps.registrarPago).not.toHaveBeenCalled();
  });

  it("si la API o la base fallan: 500 para que Mercado Pago reintente", async () => {
    const sinApi = preparar({ obtenerPago: vi.fn().mockRejectedValue(new Error("caída")) });
    expect(await procesarNotificacion(ENTRADA, sinApi)).toBe(500);
    const sinBase = preparar({ registrarPago: vi.fn().mockRejectedValue(new Error("caída")) });
    expect(await procesarNotificacion(ENTRADA, sinBase)).toBe(500);
  });
});
