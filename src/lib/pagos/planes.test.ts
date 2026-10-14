import { describe, expect, it } from "vitest";
import { interpretarPago, leerReferencia, metodoDe, PRECIOS, referenciaDe, tituloDe, type PagoMp } from "./planes";

const TALLER = "11111111-1111-4111-8111-111111111111";

const pago = (cambios: Partial<PagoMp> = {}): PagoMp => ({
  id: 123,
  status: "approved",
  transactionAmount: 99,
  currencyId: "MXN",
  paymentTypeId: "credit_card",
  externalReference: `${TALLER}:mes`,
  ...cambios,
});

describe("precios y referencia", () => {
  it("fundador cuesta $99 al mes o $990 al año, en centavos", () => {
    expect(PRECIOS).toEqual({ mes: 9900, anio: 99000 });
  });

  it("la referencia lleva taller y periodo, y se lee de vuelta", () => {
    expect(referenciaDe(TALLER, "anio")).toBe(`${TALLER}:anio`);
    expect(leerReferencia(`${TALLER}:anio`)).toEqual({ taller: TALLER, periodo: "anio" });
  });

  it.each(["", "x:mes", `${TALLER}:semana`, `${TALLER}:mes:extra`, TALLER])("referencia inválida %j", (ref) => {
    expect(leerReferencia(ref)).toBeNull();
  });

  it("el título dice qué se compra", () => {
    expect(tituloDe("mes")).toBe("Cotiza Ya, plan fundador: 1 mes");
    expect(tituloDe("anio")).toBe("Cotiza Ya, plan fundador: 1 año");
  });
});

describe("metodoDe", () => {
  it.each([
    ["credit_card", "tarjeta"],
    ["debit_card", "tarjeta"],
    ["prepaid_card", "tarjeta"],
    ["ticket", "oxxo"],
    ["bank_transfer", "transferencia"],
    ["atm", "transferencia"],
    ["account_money", "transferencia"],
  ] as const)("%s es %s", (tipo, metodo) => {
    expect(metodoDe(tipo)).toBe(metodo);
  });

  it("un tipo desconocido no se adivina", () => {
    expect(metodoDe("crypto")).toBeNull();
  });
});

describe("interpretarPago", () => {
  it("un pago correcto se vuelve registro para la base", () => {
    expect(interpretarPago(pago())).toEqual({
      ok: true,
      registro: { taller: TALLER, externalId: "123", metodo: "tarjeta", montoCentavos: 9900, periodo: "mes", status: "approved" },
    });
  });

  it("un OXXO anual pendiente también se registra", () => {
    const r = interpretarPago(pago({ status: "pending", paymentTypeId: "ticket", transactionAmount: 990, externalReference: `${TALLER}:anio` }));
    expect(r).toMatchObject({ ok: true, registro: { metodo: "oxxo", montoCentavos: 99000, periodo: "anio", status: "pending" } });
  });

  it("los centavos se redondean sin errores de flotante", () => {
    expect(interpretarPago(pago({ transactionAmount: 98.999999999 }))).toMatchObject({ ok: true });
  });

  it.each([
    ["monto-incorrecto", { transactionAmount: 50 }],
    ["moneda-incorrecta", { currencyId: "USD" }],
    ["referencia-invalida", { externalReference: "otra-cosa" }],
    ["referencia-invalida", { externalReference: null }],
    ["metodo-desconocido", { paymentTypeId: "crypto" }],
  ] as const)("se rechaza por %s", (motivo, cambios) => {
    expect(interpretarPago(pago(cambios))).toEqual({ ok: false, motivo });
  });
});
