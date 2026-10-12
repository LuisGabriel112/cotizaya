import { describe, expect, it } from "vitest";
import { formatCentavos, formatFecha, formatFolio, formatMedidaParcial, formatMedidas, formatMetros } from "./index";

describe("formatFolio", () => {
  it("rellena a 4 dígitos", () => {
    expect(formatFolio(42)).toBe("0042");
    expect(formatFolio(12345)).toBe("12345");
  });
});

describe("formatMedidas", () => {
  it("ancho × alto en metros, con cantidad cuando es más de una", () => {
    expect(formatMedidas(120, 150, "m2", 1)).toBe("1.20 × 1.50 m");
    expect(formatMedidas(75, 120, "ml", 4)).toBe("0.75 × 1.20 m ×4");
  });

  it("por pieza solo dice cuántas", () => {
    expect(formatMedidas(0, 0, "pieza", 1)).toBe("1 pza");
    expect(formatMedidas(0, 0, "pieza", 8)).toBe("8 pzas");
    expect(formatMedidas(0, 0, "pieza", 4, ["hoja", "hojas"])).toBe("4 hojas");
  });
});

describe("formatMedidaParcial", () => {
  it("marca con ? el lado que falta", () => {
    expect(formatMedidaParcial(120, 0)).toBe("1.20 × ? m");
    expect(formatMedidaParcial(0, 0)).toBe("? × ? m");
    expect(formatMedidaParcial(1205, 150)).toBe("12.05 × 1.50 m");
  });
});

describe("formatFecha", () => {
  it("día y mes corto en hora de México", () => {
    expect(formatFecha("2026-10-11T09:42:00-06:00")).toBe("11 oct");
  });
});

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
