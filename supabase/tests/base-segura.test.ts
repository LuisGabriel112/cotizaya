import { describe, expect, it } from "vitest";
import { validarBaseDePruebas } from "./base-segura.ts";

describe("frontera de la base local de pruebas", () => {
  it("acepta PostgreSQL loopback con nombre dedicado", () => {
    expect(() => validarBaseDePruebas("postgres://test:fake@127.0.0.1:55439/cotizaya_test")).not.toThrow();
  });
  it.each([
    "postgres://test:privado@example.supabase.co:5432/postgres",
    "postgres://test:privado@localhost:5432/postgres",
    "https://localhost/cotizaya_test", "invalida",
  ])("rechaza conexiones ajenas al entorno desechable sin revelar secretos", (url) => {
    expect(() => validarBaseDePruebas(url)).toThrow("Base de pruebas no autorizada");
    try { validarBaseDePruebas(url); } catch (error) { expect(String(error)).not.toContain("privado"); }
  });
});
