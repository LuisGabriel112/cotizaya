import { describe, expect, it } from "vitest";
import type { Material } from "@/lib/quote";
import { catalogoSoloCroquis, crearCatalogo } from "./catalogo";
import { resumir } from "./resumen";
import type { Cotizacion, PartidaGuardada, Plantilla } from "./tipos";

const CORREDIZA: Material = { id: "m1", nombre: "Corrediza", unidad: "m2", precioCentavos: 185_000 };
const FELPA: Material = { id: "m2", nombre: "Felpa", unidad: "pieza", precioCentavos: 18_000, pieza: ["hoja", "hojas"] };
const PLANTILLA: Plantilla = {
  id: "corrediza",
  nombre: "Corrediza",
  descripcion: "Ventana corrediza",
  materialId: "m1",
  manoObraCentavos: 35_000,
  croquis: "corrediza",
};
const catalogo = crearCatalogo([CORREDIZA, FELPA], [PLANTILLA]);

function partida(cambios: Partial<PartidaGuardada> = {}): PartidaGuardada {
  return {
    id: "p1",
    plantillaId: "corrediza",
    descripcion: "Ventana",
    materialId: "m1",
    anchoCm: 120,
    altoCm: 150,
    cantidad: 1,
    manoObraCentavos: 35_000,
    ...cambios,
  };
}

function cotizacion(partidas: PartidaGuardada[]): Cotizacion {
  return {
    id: "c1",
    folio: 1,
    slug: "0001-x",
    cliente: "",
    partidas,
    descuentoPct: 0,
    conIva: false,
    acabado: "natural",
    garantiaSalitre: true,
    estado: "borrador",
    creadaEn: "2026-10-12T12:00:00.000Z",
  };
}

describe("crearCatalogo", () => {
  it("busca material y plantilla por id", () => {
    expect(catalogo.material("m2")).toBe(FELPA);
    expect(catalogo.plantilla("corrediza")).toBe(PLANTILLA);
    expect(catalogo.material("nada")).toBeUndefined();
    expect(catalogo.plantillas).toEqual([PLANTILLA]);
  });

  it("la foto de la partida manda sobre el catálogo", () => {
    const foto = { unidad: "ml" as const, precioCentavos: 1 };
    expect(catalogo.materialDe(partida({ material: foto }))).toBe(foto);
    expect(catalogo.materialDe(partida())).toBe(CORREDIZA);
  });
});

describe("catalogoSoloCroquis", () => {
  it("da el croquis por clave de plantilla y nada de materiales", () => {
    const c = catalogoSoloCroquis();
    expect(c.plantilla("cancel")?.croquis).toBe("cancel");
    expect(c.plantilla("hecha-por-el-taller")).toBeUndefined();
    expect(c.materiales).toEqual([]);
  });
});

describe("resumir", () => {
  it("corrediza 120 × 150 con el catálogo: $3,680.00", () => {
    const { totales, renglones } = resumir(cotizacion([partida()]), catalogo);
    expect(totales.totalCentavos).toBe(368_000);
    expect(renglones[0]!.resultado).toMatchObject({ ok: true, importeCentavos: 368_000 });
  });

  it("usa el precio guardado en la partida aunque el catálogo haya cambiado", () => {
    const vieja = partida({ material: { unidad: "m2", precioCentavos: 100_000 } });
    // 1.8 m² × $1,000 + $350
    expect(resumir(cotizacion([vieja]), catalogo).totales.totalCentavos).toBe(215_000);
  });

  it("un material que ya no existe deja la partida en error, no en cero", () => {
    const { renglones, totales } = resumir(cotizacion([partida({ materialId: "borrado" })]), catalogo);
    expect(renglones[0]!.resultado.ok).toBe(false);
    expect(totales.partidasConError).toEqual([0]);
  });
});
