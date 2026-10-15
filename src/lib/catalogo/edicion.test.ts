import { describe, expect, it } from "vitest";
import type { Material } from "@/lib/quote";
import { agruparPorLinea, claveDesdeNombre, etiquetaUnidad, nombreRepetido, validarPrecio } from "./edicion";

const material = (nombre: string, linea?: string): Material => ({
  id: nombre,
  nombre,
  unidad: "m2",
  precioCentavos: 100,
  ...(linea === undefined ? {} : { linea }),
});

describe("etiquetaUnidad", () => {
  it.each([
    ["m2", "por m²"],
    ["ml", "por metro"],
    ["pieza", "por pieza"],
  ] as const)("%s se dice %s", (unidad, texto) => {
    expect(etiquetaUnidad(unidad)).toBe(texto);
  });
});

describe("agruparPorLinea", () => {
  it("agrupa por línea en orden alfabético y ordena los materiales por nombre", () => {
    const grupos = agruparPorLinea([material("Riel", "Herrajes"), material("Vidrio", "Vidrios"), material("Jaladera", "Herrajes"), material("Corrediza", "Corredizas")]);
    expect(grupos.map((g) => g.linea)).toEqual(["Corredizas", "Herrajes", "Vidrios"]);
    expect(grupos[1]!.materiales.map((m) => m.nombre)).toEqual(["Jaladera", "Riel"]);
  });

  it("los materiales sin línea van al final bajo 'Otros'", () => {
    const grupos = agruparPorLinea([material("Silicón"), material("Vidrio", "Vidrios"), material("Cinta", "")]);
    expect(grupos.map((g) => g.linea)).toEqual(["Vidrios", "Otros"]);
    expect(grupos[1]!.materiales.map((m) => m.nombre)).toEqual(["Cinta", "Silicón"]);
  });

  it("sin materiales no hay grupos", () => {
    expect(agruparPorLinea([])).toEqual([]);
  });
});

describe("claveDesdeNombre", () => {
  it("minúsculas, sin acentos y con guiones", () => {
    expect(claveDesdeNombre("Vidrio filtrasol 6 mm", [])).toBe("vidrio-filtrasol-6-mm");
    expect(claveDesdeNombre("  Corrediza 3\" Ñandú  ", [])).toBe("corrediza-3-nandu");
  });

  it("si la clave ya existe agrega -2, -3…", () => {
    expect(claveDesdeNombre("Vidrio", ["vidrio"])).toBe("vidrio-2");
    expect(claveDesdeNombre("Vidrio", ["vidrio", "vidrio-2"])).toBe("vidrio-3");
  });

  it("un nombre sin letras ni números cae en 'material'", () => {
    expect(claveDesdeNombre("***", [])).toBe("material");
  });
});

describe("nombreRepetido", () => {
  const existentes = ["Corrediza 3 pulgadas", "Vidrio claro 6 mm"];

  it("ignora mayúsculas, acentos y espacios de más", () => {
    expect(nombreRepetido("  corrediza   3 PULGADAS ", existentes)).toBe(true);
    expect(nombreRepetido("Vídrio claro 6 mm", existentes)).toBe(true);
  });

  it("un nombre distinto no cuenta como repetido", () => {
    expect(nombreRepetido("Corrediza 2 pulgadas", existentes)).toBe(false);
  });
});

describe("validarPrecio", () => {
  it.each([
    ["2,300", 230000],
    ["$1,480.50", 148050],
    ["  99 ", 9900],
    ["0.5", 50],
  ])("%s → %i centavos", (texto, centavos) => {
    expect(validarPrecio(texto)).toEqual({ ok: true, centavos });
  });

  it.each(["", "   ", "0", "0.00", "$0", "abc", "-5", "12.345", "1,2"])("%j no es un precio válido", (texto) => {
    expect(validarPrecio(texto)).toEqual({ ok: false, mensaje: "Escribe un precio mayor a cero." });
  });
});
