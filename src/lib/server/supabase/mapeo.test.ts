import { describe, expect, it } from "vitest";
import type { PartidaConFoto } from "@/lib/cotizaciones/puerto";
import {
  aCambiosFila,
  aCotizacion,
  aFilaPartida,
  aMaterial,
  aPlantillas,
  aTaller,
  aVistaPublica,
  type FilaItem,
  type FilaMaterial,
  type FilaPlantilla,
  type FilaQuote,
} from "./mapeo";

const ITEM: FilaItem = {
  id: "i1",
  orden: 0,
  plantilla_clave: "felpa",
  descripcion: "Felpa",
  material_id: "m2",
  unidad: "pieza",
  precio_centavos: 18_000,
  pieza_singular: "hoja",
  pieza_plural: "hojas",
  ancho_cm: 0,
  alto_cm: 0,
  cantidad: 4,
  mano_obra_centavos: 25_000,
  importe_centavos: 172_000,
};

const QUOTE: FilaQuote = {
  id: "q1",
  folio: 42,
  cliente_nombre: "Leticia",
  status: "vista",
  descuento_pct: 10,
  con_iva: true,
  acabado: "anodizado",
  garantia_salitre: false,
  public_slug: "0042-abc",
  viewed_at: "2026-10-12T18:00:00+00:00",
  aviso_pendiente: true,
  created_at: "2026-10-11T15:00:00+00:00",
  quote_items: [{ ...ITEM, id: "i2", orden: 1 }, ITEM],
};

const MATERIAL: FilaMaterial = {
  id: "m1",
  clave: "corrediza-2-6mm",
  nombre: "Corrediza",
  linea: '2"',
  unidad: "m2",
  precio_centavos: 185_000,
  pieza_singular: null,
  pieza_plural: null,
};

const plantilla = (cambios: Partial<FilaPlantilla>): FilaPlantilla => ({
  workshop_id: null,
  clave: "corrediza",
  nombre: "Corrediza",
  descripcion: "Ventana corrediza",
  material_clave: "corrediza-2-6mm",
  mano_obra_centavos: 35_000,
  croquis: "corrediza",
  orden: 1,
  ...cambios,
});

describe("aCotizacion", () => {
  it("convierte la fila con sus partidas ordenadas y la foto del material", () => {
    const c = aCotizacion(QUOTE);
    expect(c).toMatchObject({
      id: "q1",
      folio: 42,
      slug: "0042-abc",
      cliente: "Leticia",
      estado: "vista",
      descuentoPct: 10,
      conIva: true,
      acabado: "anodizado",
      garantiaSalitre: false,
      creadaEn: "2026-10-11T15:00:00+00:00",
      vistaEn: "2026-10-12T18:00:00+00:00",
      avisoPendiente: true,
    });
    expect(c.partidas.map((p) => p.id)).toEqual(["i1", "i2"]);
    expect(c.partidas[0]).toEqual({
      id: "i1",
      plantillaId: "felpa",
      descripcion: "Felpa",
      materialId: "m2",
      anchoCm: 0,
      altoCm: 0,
      cantidad: 4,
      manoObraCentavos: 25_000,
      material: { unidad: "pieza", precioCentavos: 18_000, pieza: ["hoja", "hojas"] },
    });
  });

  it("sin apertura, sin aviso y con material borrado del catálogo", () => {
    const c = aCotizacion({ ...QUOTE, viewed_at: null, aviso_pendiente: undefined, quote_items: [{ ...ITEM, material_id: null, pieza_plural: null }] });
    expect(c.vistaEn).toBeUndefined();
    expect(c.avisoPendiente).toBe(false);
    expect(c.partidas[0]!.materialId).toBe("");
    expect(c.partidas[0]!.material).toEqual({ unidad: "pieza", precioCentavos: 18_000 });
  });
});

describe("aFilaPartida", () => {
  it("guarda medidas, foto e importe con el orden dado", () => {
    const [partida] = aCotizacion({ ...QUOTE, quote_items: [ITEM] }).partidas;
    expect(aFilaPartida(partida as PartidaConFoto, 0, 172_000)).toEqual({
      orden: 0,
      plantilla_clave: "felpa",
      descripcion: "Felpa",
      material_id: "m2",
      unidad: "pieza",
      precio_centavos: 18_000,
      pieza_singular: "hoja",
      pieza_plural: "hojas",
      ancho_cm: 0,
      alto_cm: 0,
      cantidad: 4,
      mano_obra_centavos: 25_000,
      importe_centavos: 172_000,
    });
  });
});

describe("catálogo", () => {
  it("aMaterial arma la pieza solo si vienen singular y plural", () => {
    expect(aMaterial(MATERIAL)).toEqual({ id: "m1", nombre: "Corrediza", linea: '2"', unidad: "m2", precioCentavos: 185_000 });
    expect(aMaterial({ ...MATERIAL, pieza_singular: "hoja", pieza_plural: "hojas" }).pieza).toEqual(["hoja", "hojas"]);
  });

  it("aPlantillas liga material por clave, prefiere la del taller y omite las que no tienen material", () => {
    const materiales = [aMaterial(MATERIAL)];
    const filas = [
      plantilla({ clave: "cancel", material_clave: "no-existe", orden: 2 }),
      plantilla({}),
      plantilla({ workshop_id: "w1", nombre: "Corrediza del taller", mano_obra_centavos: 40_000 }),
    ];
    expect(aPlantillas(filas, [MATERIAL])).toEqual([
      {
        id: "corrediza",
        nombre: "Corrediza del taller",
        descripcion: "Ventana corrediza",
        materialId: "m1",
        manoObraCentavos: 40_000,
        croquis: "corrediza",
      },
    ]);
    expect(materiales).toHaveLength(1);
  });
});

describe("aTaller y aCambiosFila", () => {
  it("aTaller deja fuera el logo vacío", () => {
    const fila = { nombre: "El Faro", ciudad: "Boca del Río", telefono: "2290000001", condiciones: "50 %", plan: "gratis" as const, logo_url: null };
    expect(aTaller(fila)).toEqual({ nombre: "El Faro", ciudad: "Boca del Río", telefono: "2290000001", condiciones: "50 %", plan: "gratis" });
    expect(aTaller({ ...fila, logo_url: "https://x/logo.png" }).logoUrl).toBe("https://x/logo.png");
  });

  it("aCambiosFila traduce solo lo que viene", () => {
    expect(aCambiosFila({ cliente: "Ramón", conIva: false })).toEqual({ cliente_nombre: "Ramón", con_iva: false });
    expect(aCambiosFila({ descuentoPct: 5, acabado: "natural", garantiaSalitre: true })).toEqual({
      descuento_pct: 5,
      acabado: "natural",
      garantia_salitre: true,
    });
  });
});

describe("aVistaPublica", () => {
  it("arma cotización y taller desde el JSON de cotizacion_publica", () => {
    const { quote_items: items, ...quote } = QUOTE;
    const taller = { nombre: "El Faro", ciudad: "", telefono: "2290000001", condiciones: "", plan: "fundador" as const, logo_url: null };
    const vista = aVistaPublica({ quote, items: items!, taller });
    expect(vista.cotizacion.partidas).toHaveLength(2);
    expect(vista.taller.plan).toBe("fundador");
  });
});
