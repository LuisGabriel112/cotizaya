import { describe, expect, it } from "vitest";
import { crearRutas } from "./rutas";

describe("crearRutas", () => {
  it("la app real cuelga de la raíz", () => {
    const r = crearRutas("");
    expect([r.lista, r.nueva, r.editar("a1"), r.ver("a1"), r.publica("0042-ab")]).toEqual([
      "/cotizaciones",
      "/cotizaciones/nueva",
      "/cotizaciones/a1/editar",
      "/cotizaciones/a1",
      "/c/0042-ab",
    ]);
  });

  it("el prototipo cuelga de /demo, también su enlace público", () => {
    const r = crearRutas("/demo");
    expect([r.lista, r.editar("c42"), r.publica("faro-0042")]).toEqual(["/demo/cotizaciones", "/demo/cotizaciones/c42/editar", "/demo/c/faro-0042"]);
  });
});
