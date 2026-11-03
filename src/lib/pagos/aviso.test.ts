import { describe, expect, it } from "vitest";
import { avisoDePago } from "./aviso";

describe("aviso de retorno de Checkout", () => {
  it("aprobado no afirma que el plan esté activo sin leer su estado", () => {
    expect(avisoDePago("aprobado")).toMatch(/estado de tu plan/);
    expect(avisoDePago("aprobado")).not.toMatch(/ya está activo|pago aprobado/i);
  });
  it.each(["pendiente", "rechazado"])("ofrece orientación para %s", (estado) => {
    expect(avisoDePago(estado)).toBeTruthy();
  });
  it.each([undefined, "inventado", "__proto__", "constructor"])("ignora retorno no reconocido %s", (estado) => {
    expect(avisoDePago(estado)).toBeNull();
  });
});
