import { describe, expect, it } from "vitest";
import type { Cotizacion, PartidaGuardada, Taller } from "@/lib/cotizaciones/tipos";
import { formatCentavos } from "@/lib/format";
import { calcularTotales } from "@/lib/quote";
import { armarDocumento } from "./documento";

const taller: Taller = { nombre: "Aluminios El Faro", ciudad: "Boca del Río", telefono: "522291234567", condiciones: "50% de anticipo.", plan: "gratis" };

const corrediza: PartidaGuardada = {
  id: "p1",
  plantillaId: "corrediza",
  descripcion: "Ventana corrediza 3\"",
  materialId: "m1",
  anchoCm: 120,
  altoCm: 150,
  cantidad: 2,
  manoObraCentavos: 35000,
  material: { unidad: "m2", precioCentavos: 85000 },
};

const felpa: PartidaGuardada = {
  id: "p2",
  plantillaId: "felpa",
  descripcion: "Felpa",
  materialId: "m2",
  anchoCm: 0,
  altoCm: 0,
  cantidad: 8,
  manoObraCentavos: 0,
  material: { unidad: "pieza", precioCentavos: 1500, pieza: ["pza", "pzas"] },
};

function cotizacion(cambios: Partial<Cotizacion> = {}): Cotizacion {
  return {
    id: "c1",
    folio: 42,
    slug: "0042-a1b2c3d4e5f6",
    cliente: "Sra. Lupita",
    partidas: [corrediza, felpa],
    descuentoPct: 0,
    conIva: false,
    acabado: "natural",
    garantiaSalitre: false,
    estado: "enviada",
    creadaEn: "2026-10-12T18:00:00.000Z",
    ...cambios,
  };
}

const armar = (c: Partial<Cotizacion> = {}, t: Partial<Taller> = {}) => armarDocumento({ cotizacion: cotizacion(c), taller: { ...taller, ...t } });

const entradas = [corrediza, felpa].map((p) => ({ anchoCm: p.anchoCm, altoCm: p.altoCm, cantidad: p.cantidad, material: p.material!, manoObraCentavos: p.manoObraCentavos }));

describe("armarDocumento", () => {
  it("encabezado con folio, cliente, fecha y vigencia de 15 días", () => {
    const d = armar();
    expect(d.folio).toBe("0042");
    expect(d.cliente).toBe("Sra. Lupita");
    expect(d.fecha).toBe("12 de octubre de 2026");
    expect(d.vigencia).toBe("Vigencia: 15 días, hasta el 27 de octubre de 2026");
  });

  it("datos del taller con teléfono legible y sin nada más", () => {
    expect(armar({}, { logoUrl: "https://x/l.png" }).taller).toEqual({ nombre: "Aluminios El Faro", ciudad: "Boca del Río", telefono: "229 123 4567", logoUrl: "https://x/l.png" });
    expect(armar().condiciones).toBe("50% de anticipo.");
  });

  it("renglón por superficie: medidas sin cantidad, cantidad aparte", () => {
    expect(armar().renglones[0]).toMatchObject({ descripcion: "Ventana corrediza 3\"", medidas: "1.20 × 1.50 m", cantidad: "2" });
  });

  it("renglón por pieza: sin medidas, cantidad con unidad", () => {
    expect(armar().renglones[1]).toMatchObject({ descripcion: "Felpa", medidas: "", cantidad: "8 pzas", importe: formatCentavos(12000) });
  });

  it("total igual al de calcularTotales", () => {
    const esperado = calcularTotales(entradas, { descuentoPct: 0, conIva: false });
    expect(armar().totales).toEqual({ subtotal: formatCentavos(esperado.subtotalCentavos), total: formatCentavos(esperado.totalCentavos) });
  });

  it("con descuento e IVA los muestra", () => {
    const esperado = calcularTotales(entradas, { descuentoPct: 10, conIva: true });
    expect(armar({ descuentoPct: 10, conIva: true }).totales).toEqual({
      subtotal: formatCentavos(esperado.subtotalCentavos),
      descuento: { etiqueta: "Descuento 10%", importe: `-${formatCentavos(esperado.descuentoCentavos)}` },
      iva: formatCentavos(esperado.ivaCentavos),
      total: formatCentavos(esperado.totalCentavos),
    });
  });

  it("acabado especial y garantía van al recuadro", () => {
    expect(armar({ acabado: "anodizado", garantiaSalitre: true }).extras).toEqual(["Acabado: Anodizado", "Garantía contra salitre"]);
  });

  it("acabado natural sin garantía no trae recuadro", () => {
    expect(armar().extras).toEqual([]);
  });

  it.each([
    ["gratis", true],
    ["fundador", false],
  ] as const)("plan %s: marca %s", (plan, conMarca) => {
    expect(armar({}, { plan }).conMarca).toBe(conMarca);
  });

  it("partida con error no aparece ni se cobra", () => {
    const rota = { ...felpa, id: "p3", material: { unidad: "pieza" as const, precioCentavos: Number.NaN } };
    const d = armar({ partidas: [corrediza, felpa, rota] });
    expect(d.renglones).toHaveLength(2);
    expect(d.totales.total).toBe(armar().totales.total);
  });
});
