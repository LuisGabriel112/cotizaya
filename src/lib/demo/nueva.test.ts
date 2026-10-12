import { describe, expect, it } from "vitest";
import { COTIZACIONES_SEMILLA } from "./semilla";
import { nuevaCotizacionDemo } from "./nueva";

describe("nuevaCotizacionDemo", () => {
  it("toma el folio siguiente al mayor y arma el slug del taller de ejemplo", () => {
    const mayor = Math.max(...COTIZACIONES_SEMILLA.map((c) => c.folio));
    const c = nuevaCotizacionDemo(COTIZACIONES_SEMILLA, "k7m2", "2026-10-12T18:00:00.000Z");
    expect(c).toMatchObject({
      folio: mayor + 1,
      id: `c${mayor + 1}-k7m2`,
      slug: `faro-${String(mayor + 1).padStart(4, "0")}-k7m2`,
      estado: "borrador",
      partidas: [],
      garantiaSalitre: true,
      creadaEn: "2026-10-12T18:00:00.000Z",
    });
  });

  it("sin cotizaciones empieza en 1", () => {
    expect(nuevaCotizacionDemo([], "x", "2026-10-12T18:00:00.000Z").folio).toBe(1);
  });
});
