import { describe, expect, it } from "vitest";
import { calcularPartida, calcularTotales, type PartidaEntrada } from "./index";

const corrediza: PartidaEntrada = {
  anchoCm: 120,
  altoCm: 150,
  cantidad: 1,
  material: { unidad: "m2", precioCentavos: 185_000 }, // $1,850/m²
  manoObraCentavos: 35_000, // $350
};

const felpa: PartidaEntrada = {
  anchoCm: 0,
  altoCm: 0,
  cantidad: 4,
  material: { unidad: "pieza", precioCentavos: 18_000 }, // $180 por pieza
  manoObraCentavos: 20_000,
};

describe("calcularPartida", () => {
  it("ventana corrediza 120 × 150 por m²: 1.8 m² × $1,850 + $350", () => {
    expect(calcularPartida(corrediza)).toEqual({ ok: true, materialCentavos: 333_000, importeCentavos: 368_000 });
  });

  it("multiplica el material por cantidad; la mano de obra va una vez por partida", () => {
    const r = calcularPartida({ ...corrediza, cantidad: 2 });
    expect(r).toEqual({ ok: true, materialCentavos: 666_000, importeCentavos: 701_000 });
  });

  it("mosquitero 100 × 120 por metro lineal: perímetro 4.4 m × $95", () => {
    const r = calcularPartida({
      anchoCm: 100,
      altoCm: 120,
      cantidad: 1,
      material: { unidad: "ml", precioCentavos: 9_500 },
      manoObraCentavos: 0,
    });
    expect(r).toEqual({ ok: true, materialCentavos: 41_800, importeCentavos: 41_800 });
  });

  it("felpa y rodamientos por pieza no usa medidas", () => {
    expect(calcularPartida(felpa)).toEqual({ ok: true, materialCentavos: 72_000, importeCentavos: 92_000 });
  });

  it("redondea half-up al final de la partida", () => {
    const base = { cantidad: 1, manoObraCentavos: 0 };
    // 50 × 10 cm × 10 ¢ = 0.5 ¢ → 1 ¢
    expect(calcularPartida({ ...base, anchoCm: 50, altoCm: 10, material: { unidad: "m2", precioCentavos: 10 } })).toMatchObject({ materialCentavos: 1 });
    // 1 × 1 cm × 4 999 ¢ = 0.4999 ¢ → 0 ¢
    expect(calcularPartida({ ...base, anchoCm: 1, altoCm: 1, material: { unidad: "m2", precioCentavos: 4_999 } })).toMatchObject({ materialCentavos: 0 });
  });

  it("marca error con medida 0 o negativa y no calcula", () => {
    expect(calcularPartida({ ...corrediza, anchoCm: 0 })).toEqual({ ok: false, error: "medida-invalida" });
    expect(calcularPartida({ ...corrediza, altoCm: -10 })).toEqual({ ok: false, error: "medida-invalida" });
  });

  it("marca error con cantidad 0 o con decimales", () => {
    expect(calcularPartida({ ...corrediza, cantidad: 0 })).toEqual({ ok: false, error: "cantidad-invalida" });
    expect(calcularPartida({ ...corrediza, cantidad: 1.5 })).toEqual({ ok: false, error: "cantidad-invalida" });
  });

  it("marca error con precio o mano de obra no válidos", () => {
    expect(calcularPartida({ ...corrediza, manoObraCentavos: -1 })).toEqual({ ok: false, error: "precio-invalido" });
    expect(calcularPartida({ ...corrediza, material: { unidad: "m2", precioCentavos: 10.5 } })).toEqual({ ok: false, error: "precio-invalido" });
  });
});

describe("calcularTotales", () => {
  it("descuento antes del IVA y IVA de 16 %", () => {
    // 368 000 + 92 000 = 460 000; −10 % = 414 000; IVA 66 240
    expect(calcularTotales([corrediza, felpa], { descuentoPct: 10, conIva: true })).toEqual({
      subtotalCentavos: 460_000,
      descuentoCentavos: 46_000,
      baseCentavos: 414_000,
      ivaCentavos: 66_240,
      totalCentavos: 480_240,
      partidasConError: [],
    });
  });

  it("sin IVA el total es la base", () => {
    const t = calcularTotales([corrediza], { descuentoPct: 0, conIva: false });
    expect(t.ivaCentavos).toBe(0);
    expect(t.totalCentavos).toBe(368_000);
  });

  it("no suma partidas con error y dice cuáles son", () => {
    const t = calcularTotales([corrediza, { ...corrediza, anchoCm: 0 }], { descuentoPct: 0, conIva: false });
    expect(t.totalCentavos).toBe(368_000);
    expect(t.partidasConError).toEqual([1]);
  });

  it("redondea el descuento half-up", () => {
    const pieza = (precioCentavos: number): PartidaEntrada => ({
      anchoCm: 0,
      altoCm: 0,
      cantidad: 1,
      material: { unidad: "pieza", precioCentavos },
      manoObraCentavos: 0,
    });
    expect(calcularTotales([pieza(333)], { descuentoPct: 10, conIva: false }).descuentoCentavos).toBe(33);
    expect(calcularTotales([pieza(335)], { descuentoPct: 10, conIva: false }).descuentoCentavos).toBe(34);
  });

  it("limita el descuento entre 0 y 100 %", () => {
    expect(calcularTotales([corrediza], { descuentoPct: 150, conIva: true }).totalCentavos).toBe(0);
    expect(calcularTotales([corrediza], { descuentoPct: -5, conIva: false }).totalCentavos).toBe(368_000);
  });

  it("cotización vacía da cero", () => {
    expect(calcularTotales([], { descuentoPct: 0, conIva: true }).totalCentavos).toBe(0);
  });
});
