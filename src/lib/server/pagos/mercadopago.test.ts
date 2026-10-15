import { beforeEach, describe, expect, it, vi } from "vitest";

const { crearPreferencia, obtener, Config } = vi.hoisted(() => ({
  crearPreferencia: vi.fn(),
  obtener: vi.fn(),
  Config: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: Config,
  Preference: vi.fn(() => ({ create: crearPreferencia })),
  Payment: vi.fn(() => ({ get: obtener })),
}));

import { crearPasarela } from "./mercadopago";

const TALLER = "11111111-1111-4111-8111-111111111111";
const pasarela = () => crearPasarela({ accessToken: "APP_USR-x", urlApp: "https://cotizaya.mx" });

beforeEach(() => vi.clearAllMocks());

describe("pasarela de Mercado Pago", () => {
  it("usa el access token del entorno", () => {
    pasarela();
    expect(Config).toHaveBeenCalledWith({ accessToken: "APP_USR-x" });
  });

  it("la preferencia cobra el precio del periodo en MXN y avisa al webhook", async () => {
    crearPreferencia.mockResolvedValue({ init_point: "https://mp/checkout" });
    expect(await pasarela().crearPreferencia({ taller: TALLER, periodo: "anio" })).toBe("https://mp/checkout");
    const { body } = crearPreferencia.mock.calls[0]![0];
    expect(body).toMatchObject({
      items: [{ id: "anio", title: "Cotiza Ya, plan fundador: 1 año", quantity: 1, unit_price: 990, currency_id: "MXN" }],
      external_reference: `${TALLER}:anio`,
      notification_url: "https://cotizaya.mx/api/mercadopago/webhook",
      back_urls: {
        success: "https://cotizaya.mx/plan?pago=aprobado",
        pending: "https://cotizaya.mx/plan?pago=pendiente",
        failure: "https://cotizaya.mx/plan?pago=rechazado",
      },
      auto_return: "approved",
    });
  });

  it("sin init_point es error", async () => {
    crearPreferencia.mockResolvedValue({});
    await expect(pasarela().crearPreferencia({ taller: TALLER, periodo: "mes" })).rejects.toThrow();
  });

  it("obtenerPago traduce la respuesta de la API y no arrastra datos del pagador", async () => {
    obtener.mockResolvedValue({
      id: 123,
      status: "approved",
      transaction_amount: 99,
      currency_id: "MXN",
      payment_type_id: "ticket",
      external_reference: `${TALLER}:mes`,
      payer: { email: "no-debe-pasar@x.com" },
    });
    expect(await pasarela().obtenerPago("123")).toEqual({
      id: 123,
      status: "approved",
      transactionAmount: 99,
      currencyId: "MXN",
      paymentTypeId: "ticket",
      externalReference: `${TALLER}:mes`,
    });
    expect(obtener).toHaveBeenCalledWith({ id: "123" });
  });

  it("obtenerPago sin referencia la deja en null", async () => {
    obtener.mockResolvedValue({ id: 1, status: "approved", transaction_amount: 99, currency_id: "MXN", payment_type_id: "ticket" });
    expect((await pasarela().obtenerPago("1"))?.externalReference).toBeNull();
  });

  it("obtenerPago devuelve null si Mercado Pago responde 404", async () => {
    obtener.mockRejectedValue({ status: 404, message: "Payment not found" });
    expect(await pasarela().obtenerPago("123456")).toBeNull();
  });

  it("obtenerPago propaga cualquier otro error para que el webhook pida reintento", async () => {
    obtener.mockRejectedValue({ status: 500, message: "caída" });
    await expect(pasarela().obtenerPago("1")).rejects.toMatchObject({ status: 500 });
  });
});
