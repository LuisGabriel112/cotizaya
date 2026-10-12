import { describe, expect, it } from "vitest";
import { limpiarCifra, parsearCantidad, parsearCm, parsearDescuento } from "./entrada";

describe("limpiarCifra", () => {
  it("deja solo dígitos y corta al máximo de enteros", () => {
    expect(limpiarCifra("12a0 cm", { enteros: 4 })).toBe("120");
    expect(limpiarCifra("123456", { enteros: 4 })).toBe("1234");
  });

  it("sin decimal permitido descarta punto y coma", () => {
    expect(limpiarCifra("120,5", { enteros: 4 })).toBe("1205");
  });

  it("con decimal acepta un separador y una cifra, respetando punto o coma", () => {
    expect(limpiarCifra("120,5", { enteros: 4, decimal: true })).toBe("120,5");
    expect(limpiarCifra("120.55", { enteros: 4, decimal: true })).toBe("120.5");
    expect(limpiarCifra("120.", { enteros: 4, decimal: true })).toBe("120.");
    expect(limpiarCifra("1.2.3", { enteros: 4, decimal: true })).toBe("1.2");
  });
});

describe("parsearCm", () => {
  it("lee cm enteros", () => {
    expect(parsearCm("120")).toBe(120);
    expect(parsearCm(" 150 ")).toBe(150);
  });

  it("redondea half-up con punto o coma: 120,5 → 121; 150.4 → 150", () => {
    expect(parsearCm("120,5")).toBe(121);
    expect(parsearCm("120.5")).toBe(121);
    expect(parsearCm("150.4")).toBe(150);
    expect(parsearCm("150.49")).toBe(150);
    expect(parsearCm("120.")).toBe(120);
    expect(parsearCm(".6")).toBe(1);
  });

  it("vacío, cero, menos de medio cm o texto → null", () => {
    expect(parsearCm("")).toBeNull();
    expect(parsearCm("0")).toBeNull();
    expect(parsearCm("0.4")).toBeNull();
    expect(parsearCm(".")).toBeNull();
    expect(parsearCm("-10")).toBeNull();
    expect(parsearCm("1 20")).toBeNull();
    expect(parsearCm("abc")).toBeNull();
  });
});

describe("parsearCantidad", () => {
  it("acepta de 1 a 99", () => {
    expect(parsearCantidad("1")).toBe(1);
    expect(parsearCantidad("99")).toBe(99);
  });

  it("rechaza 0, más de 99, decimales y vacío", () => {
    expect(parsearCantidad("0")).toBeNull();
    expect(parsearCantidad("100")).toBeNull();
    expect(parsearCantidad("1.5")).toBeNull();
    expect(parsearCantidad("")).toBeNull();
  });
});

describe("parsearDescuento", () => {
  it("vacío es sin descuento", () => {
    expect(parsearDescuento("")).toBe(0);
  });

  it("entero de 0 a 100; lo que pasa de 100 se queda en 100", () => {
    expect(parsearDescuento("10")).toBe(10);
    expect(parsearDescuento("150")).toBe(100);
  });

  it("decimales o texto → null", () => {
    expect(parsearDescuento("7.5")).toBeNull();
    expect(parsearDescuento("diez")).toBeNull();
  });
});
