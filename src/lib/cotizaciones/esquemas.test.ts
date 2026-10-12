import { describe, expect, it } from "vitest";
import { esquemaCambios, esquemaId, esquemaPartida } from "./esquemas";

const PARTIDA = {
  id: "0b1c2d3e-4f50-4617-8829-3a4b5c6d7e8f",
  plantillaId: "corrediza",
  descripcion: "Ventana",
  materialId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  anchoCm: 120,
  altoCm: 150,
  cantidad: 1,
  manoObraCentavos: 35_000,
};

describe("esquemaPartida", () => {
  it("acepta una partida válida y tira la foto de material que mande el navegador", () => {
    const leida = esquemaPartida.parse({ ...PARTIDA, material: { unidad: "m2", precioCentavos: 1 } });
    expect(leida).toEqual(PARTIDA);
  });

  it.each([
    ["id no uuid", { id: "abc" }],
    ["medida negativa", { anchoCm: -1 }],
    ["medida con decimales", { altoCm: 1.5 }],
    ["cantidad cero", { cantidad: 0 }],
    ["cantidad de más", { cantidad: 100 }],
    ["descripción vacía", { descripcion: "  " }],
    ["mano de obra negativa", { manoObraCentavos: -5 }],
  ])("rechaza %s", (_, cambio) => {
    expect(esquemaPartida.safeParse({ ...PARTIDA, ...cambio }).success).toBe(false);
  });
});

describe("esquemaCambios", () => {
  it("acepta cambios parciales válidos", () => {
    expect(esquemaCambios.parse({ cliente: "Ramón", descuentoPct: 15 })).toEqual({ cliente: "Ramón", descuentoPct: 15 });
  });

  it.each([{ descuentoPct: 101 }, { acabado: "oro" }, { cliente: "x".repeat(121) }, { estado: "aceptada" }])("rechaza %j", (cambio) => {
    expect(esquemaCambios.safeParse(cambio).success).toBe(false);
  });
});

describe("esquemaId", () => {
  it("solo uuid", () => {
    expect(esquemaId.safeParse(PARTIDA.id).success).toBe(true);
    expect(esquemaId.safeParse("1 or 1=1").success).toBe(false);
  });
});
