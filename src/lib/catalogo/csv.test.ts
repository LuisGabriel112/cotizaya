import { describe, expect, it } from "vitest";
import { parsearCatalogoCsv, parsearPrecioCentavos } from "./csv";

describe("parsearPrecioCentavos", () => {
  it.each([
    ["1850", 185_000],
    ["2,150.00", 215_000],
    ["$1,850", 185_000],
    ["95.5", 9_550],
    [" 0 ", 0],
  ])("%j → %d centavos", (texto, centavos) => {
    expect(parsearPrecioCentavos(texto)).toBe(centavos);
  });

  it.each(["", "abc", "-10", "1.234", "1,85", "1..2"])("%j no es precio", (texto) => {
    expect(parsearPrecioCentavos(texto)).toBeNull();
  });
});

const CABECERA = "clave,nombre,linea,unidad,precio";

describe("parsearCatalogoCsv", () => {
  it("lee materiales con comillas, comas y unidades escritas a mano", () => {
    const csv = [
      CABECERA,
      'corrediza-3,"Corrediza 3"" natural",3",m²,"2,150.00"',
      "felpa,Felpa por hoja,Mantenimiento,Pieza,180",
      "mosquitero,Mosquitero,Mosquitero,ML,95",
    ].join("\n");

    const { materiales, errores } = parsearCatalogoCsv(csv);

    expect(errores).toEqual([]);
    expect(materiales).toEqual([
      { clave: "corrediza-3", nombre: 'Corrediza 3" natural', linea: '3"', unidad: "m2", precioCentavos: 215_000 },
      { clave: "felpa", nombre: "Felpa por hoja", linea: "Mantenimiento", unidad: "pieza", precioCentavos: 18_000 },
      { clave: "mosquitero", nombre: "Mosquitero", linea: "Mosquitero", unidad: "ml", precioCentavos: 9_500 },
    ]);
  });

  it("reporta cada fila mala con su número de línea y sigue con las demás", () => {
    const csv = [CABECERA, "ok,Bien,,m2,100", "felpa,Felpa,Mant,pieza,abc", "x,,L,m2,1", "y,Y,L,kg,1"].join("\r\n");

    const { materiales, errores } = parsearCatalogoCsv(csv);

    expect(materiales.map((m) => m.clave)).toEqual(["ok"]);
    expect(errores).toEqual([
      "Línea 3: precio no es un número",
      "Línea 4: falta el nombre",
      "Línea 5: unidad debe ser m2, ml o pieza",
    ]);
  });

  it("ignora renglones vacíos y acepta columnas de pieza opcionales", () => {
    const csv = `${CABECERA},pieza_singular,pieza_plural\n\nfelpa,Felpa,M,pieza,180,hoja,hojas\n`;

    const { materiales } = parsearCatalogoCsv(csv);

    expect(materiales).toEqual([
      { clave: "felpa", nombre: "Felpa", linea: "M", unidad: "pieza", precioCentavos: 18_000, pieza: ["hoja", "hojas"] },
    ]);
  });

  it("una clave repetida en el mismo archivo es error", () => {
    const { materiales, errores } = parsearCatalogoCsv(`${CABECERA}\na,A,,m2,1\na,B,,m2,2`);
    expect(materiales).toHaveLength(1);
    expect(errores).toEqual(["Línea 3: la clave a ya viene arriba"]);
  });

  it("sin las columnas obligatorias no lee nada", () => {
    const { materiales, errores } = parsearCatalogoCsv("nombre,precio\nA,1");
    expect(materiales).toEqual([]);
    expect(errores).toEqual(["Faltan columnas: clave, linea, unidad"]);
  });
});
