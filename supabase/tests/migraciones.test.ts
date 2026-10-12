import { describe, expect, it } from "vitest";
import { opcionesSsl, pendientes, versionDe } from "../scripts/migraciones";

describe("migraciones", () => {
  it("la versión es el prefijo numérico del archivo", () => {
    expect(versionDe("0003_funciones.sql")).toBe("0003");
  });

  it("solo las .sql que faltan, en orden", () => {
    const archivos = ["0002_rls.sql", "0001_modelo.sql", ".gitkeep", "0004_semilla.sql", "0003_funciones.sql"];
    expect(pendientes(archivos, new Set(["0001", "0002"]))).toEqual(["0003_funciones.sql", "0004_semilla.sql"]);
  });

  it("nada pendiente si todo está aplicado", () => {
    expect(pendientes(["0001_modelo.sql"], new Set(["0001"]))).toEqual([]);
  });

  it("SSL solo fuera de la máquina local", () => {
    expect(opcionesSsl("postgres://postgres@localhost:54329/x")).toBe(false);
    expect(opcionesSsl("postgres://postgres@127.0.0.1/x")).toBe(false);
    expect(opcionesSsl("postgresql://postgres.abc:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres")).toEqual({ rejectUnauthorized: false });
  });
});
