import { describe, expect, it } from "vitest";
import { calcularTotales, parsearCm, type OpcionesTotales, type PartidaEntrada, type Totales } from "./index";

// Casos de ejemplo con los precios del catálogo demo; no son de un taller real.
// Cuando haya cotizaciones reales, se reemplazan medidas, precios y totales aquí.
// Cada caso lleva el cálculo a mano, un paso por línea, en pesos.

const corrediza = { unidad: "m2", precioCentavos: 185_000 } as const; // $1,850/m²
const cancel = { unidad: "m2", precioCentavos: 240_000 } as const; // $2,400/m²
const abatible = { unidad: "m2", precioCentavos: 290_000 } as const; // $2,900/m²
const mosquitero = { unidad: "ml", precioCentavos: 9_500 } as const; // $95/m
const corrosion = { unidad: "ml", precioCentavos: 21_000 } as const; // $210/m
const felpa = { unidad: "pieza", precioCentavos: 18_000 } as const; // $180/hoja

const partida = (
  material: PartidaEntrada["material"],
  anchoCm: number,
  altoCm: number,
  cantidad: number,
  manoObraCentavos: number,
): PartidaEntrada => ({ material, anchoCm, altoCm, cantidad, manoObraCentavos });

const sinIva: OpcionesTotales = { descuentoPct: 0, conIva: false };
const conIva: OpcionesTotales = { descuentoPct: 0, conIva: true };

const montos = (t: Totales) => ({
  subtotal: t.subtotalCentavos,
  descuento: t.descuentoCentavos,
  iva: t.ivaCentavos,
  total: t.totalCentavos,
});

describe("casos de taller (ejemplo)", () => {
  it("1. corrediza 120 × 150, sin IVA", () => {
    // 1.20 × 1.50 = 1.80 m² × $1,850 = $3,330 + $350 = $3,680.00
    const t = calcularTotales([partida(corrediza, 120, 150, 1, 35_000)], sinIva);
    expect(montos(t)).toEqual({ subtotal: 368_000, descuento: 0, iva: 0, total: 368_000 });
  });

  it("2. dos corredizas 150 × 120 y cuatro mosquiteros 75 × 120, sin IVA", () => {
    // corrediza: 1.80 m² × $1,850 × 2 = $6,660 + $350 × 2 = $7,360
    // mosquitero: perímetro 2 × (0.75 + 1.20) = 3.90 m × $95 × 4 = $1,482 + $150 × 4 = $2,082
    // total: $9,442.00
    const t = calcularTotales([partida(corrediza, 150, 120, 2, 35_000), partida(mosquitero, 75, 120, 4, 15_000)], sinIva);
    expect(montos(t)).toEqual({ subtotal: 944_200, descuento: 0, iva: 0, total: 944_200 });
  });

  it("3. cancel de baño 120 × 190, sin IVA", () => {
    // 1.20 × 1.90 = 2.28 m² × $2,400 = $5,472 + $600 = $6,072.00
    const t = calcularTotales([partida(cancel, 120, 190, 1, 60_000)], sinIva);
    expect(montos(t)).toEqual({ subtotal: 607_200, descuento: 0, iva: 0, total: 607_200 });
  });

  it("4. el mismo cancel con IVA", () => {
    // $6,072 × 16 % = $971.52 → $7,043.52
    const t = calcularTotales([partida(cancel, 120, 190, 1, 60_000)], conIva);
    expect(montos(t)).toEqual({ subtotal: 607_200, descuento: 0, iva: 97_152, total: 704_352 });
  });

  it("5. puerta abatible 90 × 210, con IVA", () => {
    // 0.90 × 2.10 = 1.89 m² × $2,900 = $5,481 + $800 = $6,281
    // IVA $1,004.96 → $7,285.96
    const t = calcularTotales([partida(abatible, 90, 210, 1, 80_000)], conIva);
    expect(montos(t)).toEqual({ subtotal: 628_100, descuento: 0, iva: 100_496, total: 728_596 });
  });

  it("6. seis corredizas 180 × 150 y una abatible 90 × 210, 5 % de descuento, con IVA", () => {
    // corrediza: 2.70 m² × $1,850 = $4,995 × 6 = $29,970 + $350 × 6 = $32,070
    // abatible: $6,281 (caso 5) → subtotal $38,351
    // descuento 5 % = $1,917.55 → base $36,433.45
    // IVA 16 % = $5,829.352 → $5,829.35 → total $42,262.80
    const t = calcularTotales([partida(corrediza, 180, 150, 6, 35_000), partida(abatible, 90, 210, 1, 80_000)], {
      descuentoPct: 5,
      conIva: true,
    });
    expect(montos(t)).toEqual({ subtotal: 3_835_100, descuento: 191_755, iva: 582_935, total: 4_226_280 });
  });

  it("7. felpa y rodamientos en 8 hojas y perfil por corrosión 200 × 220, con IVA", () => {
    // felpa: 8 × $180 = $1,440 + 8 × $250 = $3,440
    // corrosión: perímetro 2 × (2.00 + 2.20) = 8.40 m × $210 = $1,764 + $400 = $2,164
    // subtotal $5,604; IVA $896.64 → $6,500.64
    const t = calcularTotales([partida(felpa, 0, 0, 8, 25_000), partida(corrosion, 200, 220, 1, 40_000)], conIva);
    expect(montos(t)).toEqual({ subtotal: 560_400, descuento: 0, iva: 89_664, total: 650_064 });
  });

  it("8. tres corredizas 100 × 120, 10 % de descuento, sin IVA", () => {
    // 1.20 m² × $1,850 = $2,220 × 3 = $6,660 + $350 × 3 = $7,710
    // descuento $771 → $6,939.00
    const t = calcularTotales([partida(corrediza, 100, 120, 3, 35_000)], { descuentoPct: 10, conIva: false });
    expect(montos(t)).toEqual({ subtotal: 771_000, descuento: 77_100, iva: 0, total: 693_900 });
  });

  it("9. medidas tecleadas con decimal: \"120,5\" × \"150.4\", sin IVA", () => {
    // 120,5 → 121 cm; 150.4 → 150 cm
    // 1.21 × 1.50 = 1.815 m² × $1,850 = $3,357.75 + $350 = $3,707.75
    const ancho = parsearCm("120,5");
    const alto = parsearCm("150.4");
    expect([ancho, alto]).toEqual([121, 150]);
    const t = calcularTotales([partida(corrediza, ancho!, alto!, 1, 35_000)], sinIva);
    expect(montos(t)).toEqual({ subtotal: 370_775, descuento: 0, iva: 0, total: 370_775 });
  });

  it("10. cancel 120 × 190 y una partida sin ancho, 15 % de descuento, con IVA", () => {
    // la corrediza sin ancho no se suma y se marca
    // cancel $6,072; descuento 15 % = $910.80 → base $5,161.20
    // IVA 16 % = $825.792 → $825.79 → total $5,986.99
    const t = calcularTotales([partida(cancel, 120, 190, 1, 60_000), partida(corrediza, 0, 150, 1, 35_000)], {
      descuentoPct: 15,
      conIva: true,
    });
    expect(montos(t)).toEqual({ subtotal: 607_200, descuento: 91_080, iva: 82_579, total: 598_699 });
    expect(t.partidasConError).toEqual([1]);
  });
});
