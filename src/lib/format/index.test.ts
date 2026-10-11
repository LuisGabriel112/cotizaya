import { describe, expect, it } from "vitest";
import { formatCentavos, formatMetros } from "./index";

describe("formatCentavos", () => {
  it("formatea cero", () => {
    expect(formatCentavos(0)).toBe("$0.00");
  });

  it("pone separador de miles", () => {
    expect(formatCentavos(12345678)).toBe("$123,456.78");
    expect(formatCentavos(100000000)).toBe("$1,000,000.00");
  });

  it("formatea centavos sueltos", () => {
    expect(formatCentavos(5)).toBe("$0.05");
    expect(formatCentavos(250)).toBe("$2.50");
  });

  it("formatea negativos", () => {
    expect(formatCentavos(-150)).toBe("-$1.50");
  });

  it("rechaza montos que no son centavos enteros", () => {
    expect(() => formatCentavos(10.5)).toThrow(TypeError);
    expect(() => formatCentavos(Number.NaN)).toThrow(TypeError);
  });
});

describe("formatMetros", () => {
  it("convierte cm a m con 2 decimales", () => {
    expect(formatMetros(120)).toBe("1.20 m");
    expect(formatMetros(150)).toBe("1.50 m");
    expect(formatMetros(5)).toBe("0.05 m");
    expect(formatMetros(0)).toBe("0.00 m");
  });

  it("redondea medio centímetro", () => {
    expect(formatMetros(120.6)).toBe("1.21 m");
  });

  it("pone separador de miles en tramos largos", () => {
    expect(formatMetros(250000)).toBe("2,500.00 m");
  });

  it("rechaza medidas no numéricas", () => {
    expect(() => formatMetros(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});
