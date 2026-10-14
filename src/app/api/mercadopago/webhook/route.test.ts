import { beforeEach, describe, expect, it, vi } from "vitest";

const { procesarNotificacion, deps } = vi.hoisted(() => ({
  procesarNotificacion: vi.fn(),
  deps: { firmaValida: vi.fn(), obtenerPago: vi.fn(), registrarPago: vi.fn() },
}));

vi.mock("@/lib/server/pagos/webhook", () => ({ procesarNotificacion }));
vi.mock("@/lib/server/pagos/dependencias", () => ({ dependenciasWebhook: () => deps }));

import { POST } from "./route";

const encabezados = { "x-signature": "ts=1,v1=x", "x-request-id": "req-1", "content-type": "application/json" };

beforeEach(() => {
  vi.clearAllMocks();
  procesarNotificacion.mockResolvedValue(200);
});

describe("POST /api/mercadopago/webhook", () => {
  it("toma data.id y type de la URL, que es lo que Mercado Pago firma", async () => {
    const req = new Request("https://x/api/mercadopago/webhook?data.id=123&type=payment", {
      method: "POST",
      headers: encabezados,
      body: JSON.stringify({ type: "payment", data: { id: "999" } }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(procesarNotificacion).toHaveBeenCalledWith({ tipo: "payment", dataId: "123", firma: "ts=1,v1=x", requestId: "req-1" }, deps);
  });

  it("si la URL no los trae, los toma del cuerpo", async () => {
    const req = new Request("https://x/api/mercadopago/webhook", {
      method: "POST",
      headers: encabezados,
      body: JSON.stringify({ type: "payment", data: { id: 456 } }),
    });
    await POST(req);
    expect(procesarNotificacion).toHaveBeenCalledWith(expect.objectContaining({ tipo: "payment", dataId: "456" }), deps);
  });

  it("un cuerpo que no es JSON no rompe la ruta", async () => {
    procesarNotificacion.mockResolvedValue(400);
    const req = new Request("https://x/api/mercadopago/webhook", { method: "POST", body: "basura" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(procesarNotificacion).toHaveBeenCalledWith({ tipo: "", dataId: "", firma: "", requestId: "" }, deps);
  });
});
