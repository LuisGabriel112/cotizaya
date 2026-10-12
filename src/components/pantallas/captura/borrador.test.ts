import { describe, expect, it } from "vitest";
import { crearCatalogo } from "@/lib/cotizaciones/catalogo";
import type { Cotizacion, PartidaGuardada, Plantilla } from "@/lib/cotizaciones/tipos";
import { aGuardada, borradorDePartida, borradorDePlantilla, conBorrador, listaParaGuardar, primerPaso, type Borrador } from "./borrador";

const CORREDIZA: Plantilla = { id: "corrediza", nombre: "Corrediza", descripcion: "Ventana corrediza", materialId: "m1", manoObraCentavos: 35_000, croquis: "corrediza" };
const FELPA: Plantilla = { id: "felpa", nombre: "Felpa", descripcion: "Felpa", materialId: "m2", manoObraCentavos: 25_000, croquis: "felpa" };
const catalogo = crearCatalogo(
  [
    { id: "m1", nombre: "Corrediza", unidad: "m2", precioCentavos: 185_000 },
    { id: "m2", nombre: "Felpa", unidad: "pieza", precioCentavos: 18_000 },
  ],
  [CORREDIZA, FELPA],
);

const GUARDADA: PartidaGuardada = {
  id: "p1",
  plantillaId: "corrediza",
  descripcion: "Ventana recámara",
  materialId: "m1",
  anchoCm: 120,
  altoCm: 150,
  cantidad: 2,
  manoObraCentavos: 35_000,
  material: { unidad: "m2", precioCentavos: 100_000 },
};

const COT = { id: "c1", partidas: [GUARDADA] } as Cotizacion;

describe("borrador de partida", () => {
  it("de plantilla: nueva, con medidas vacías y una pieza", () => {
    expect(borradorDePlantilla(CORREDIZA, "nuevo")).toEqual({
      partidaId: "nuevo",
      nueva: true,
      plantillaId: "corrediza",
      descripcion: "Ventana corrediza",
      materialId: "m1",
      manoObraCentavos: 35_000,
      ancho: "",
      alto: "",
      cantidad: "1",
    });
  });

  it("de partida guardada: conserva la foto del material", () => {
    const b = borradorDePartida(GUARDADA);
    expect(b).toMatchObject({ partidaId: "p1", nueva: false, ancho: "120", alto: "150", cantidad: "2" });
    expect(aGuardada(b)).toEqual(GUARDADA);
  });

  it("lo que aún no es medida válida queda en 0, nunca inventado", () => {
    const b: Borrador = { ...borradorDePlantilla(CORREDIZA, "n"), ancho: "12x", alto: "", cantidad: "" };
    expect(aGuardada(b)).toMatchObject({ anchoCm: 0, altoCm: 0, cantidad: 0 });
  });

  it("primer paso: piezas para material por pieza, ancho para lo demás", () => {
    expect(primerPaso(borradorDePlantilla(FELPA, "n"), catalogo)).toBe("piezas");
    expect(primerPaso(borradorDePlantilla(CORREDIZA, "n"), catalogo)).toBe("ancho");
  });

  it("lista para guardar según el paso", () => {
    const b = { ...borradorDePlantilla(CORREDIZA, "n"), ancho: "120", cantidad: "1" };
    expect(listaParaGuardar(b, "alto")).toBe(false);
    expect(listaParaGuardar({ ...b, alto: "150" }, "alto")).toBe(true);
    expect(listaParaGuardar({ ...b, cantidad: "0" }, "piezas")).toBe(false);
    expect(listaParaGuardar(b, "piezas")).toBe(true);
  });

  it("conBorrador agrega la nueva y reemplaza la que se corrige", () => {
    const nueva = { ...borradorDePlantilla(FELPA, "p2"), cantidad: "3" };
    expect(conBorrador(COT, nueva).partidas.map((p) => p.id)).toEqual(["p1", "p2"]);
    const corregida = { ...borradorDePartida(GUARDADA), ancho: "90" };
    expect(conBorrador(COT, corregida).partidas).toEqual([{ ...GUARDADA, anchoCm: 90 }]);
  });
});
