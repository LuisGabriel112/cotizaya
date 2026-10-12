import { describe, expect, it } from "vitest";
import { formatTelefono, normalizarTelefono } from ".";

describe("normalizarTelefono", () => {
  it.each([
    ["229 000 0001", "522290000001"],
    ["+52 229-000-0001", "522290000001"],
    ["52 2290000001", "522290000001"],
    ["(229) 000 00 01", "522290000001"],
    // Formato viejo de celular con 1 después del 52.
    ["+52 1 229 000 0001", "522290000001"],
  ])("%s → %s", (escrito, esperado) => {
    expect(normalizarTelefono(escrito)).toBe(esperado);
  });

  it.each(["", "22900", "229 000 00011", "+1 555 000 0000 1", "abc"])("%j no es válido", (escrito) => {
    expect(normalizarTelefono(escrito)).toBeNull();
  });
});

describe("formatTelefono", () => {
  it("muestra los 10 dígitos en grupos de 3-3-4", () => {
    expect(formatTelefono("522290000001")).toBe("229 000 0001");
  });

  it("deja igual lo que no reconoce", () => {
    expect(formatTelefono("123")).toBe("123");
  });
});
