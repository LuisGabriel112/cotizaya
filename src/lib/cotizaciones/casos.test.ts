import { beforeEach, describe, expect, it } from "vitest";
import type { Material, Totales } from "@/lib/quote";
import { crearCasos, ErrorDeCaso } from "./casos";
import type { PartidaConFoto, RepositorioCotizaciones } from "./puerto";
import type { Cotizacion, PartidaGuardada } from "./tipos";

const ID_COT = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const ID_PARTIDA = "0b1c2d3e-4f50-4617-8829-3a4b5c6d7e8f";
const ID_MATERIAL = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

const CORREDIZA: Material = { id: ID_MATERIAL, nombre: "Corrediza", unidad: "m2", precioCentavos: 185_000 };

const PARTIDA: PartidaGuardada = {
  id: ID_PARTIDA,
  plantillaId: "corrediza",
  descripcion: "Ventana",
  materialId: ID_MATERIAL,
  anchoCm: 120,
  altoCm: 150,
  cantidad: 1,
  manoObraCentavos: 35_000,
};

/** Repositorio en memoria: guarda lo que le piden y deja ver qué se escribió. */
class RepoFalso implements RepositorioCotizaciones {
  cotizaciones = new Map<string, Cotizacion>();
  materiales = new Map<string, Material>([[ID_MATERIAL, CORREDIZA]]);
  totales = new Map<string, Totales>();
  importes = new Map<string, number>();
  llamadas: string[] = [];

  async crear() {
    const c = vacia();
    this.cotizaciones.set(c.id, c);
    return c;
  }
  async porId(id: string) {
    return this.cotizaciones.get(id) ?? null;
  }
  async material(id: string) {
    return this.materiales.get(id) ?? null;
  }
  async guardarPartida(quoteId: string, p: PartidaConFoto, orden: number, importe: number, nueva: boolean) {
    const c = this.cotizaciones.get(quoteId)!;
    const partidas = nueva ? [...c.partidas, p] : c.partidas.map((x) => (x.id === p.id ? p : x));
    this.cotizaciones.set(quoteId, { ...c, partidas });
    this.importes.set(p.id, importe);
    this.llamadas.push(`guardarPartida:${orden}:${nueva}`);
  }
  async quitarPartida(quoteId: string, partidaId: string) {
    const c = this.cotizaciones.get(quoteId)!;
    this.cotizaciones.set(quoteId, { ...c, partidas: c.partidas.filter((p) => p.id !== partidaId) });
  }
  async editar(id: string, cambios: object) {
    this.cotizaciones.set(id, { ...this.cotizaciones.get(id)!, ...cambios });
  }
  async guardarTotales(id: string, t: Totales) {
    this.totales.set(id, t);
  }
  async marcarEnviada(id: string) {
    this.llamadas.push(`enviada:${id}`);
  }
  async apagarAviso(id: string) {
    this.llamadas.push(`aviso:${id}`);
  }
}

function vacia(): Cotizacion {
  return {
    id: ID_COT,
    folio: 1,
    slug: "0001-x",
    cliente: "",
    partidas: [],
    descuentoPct: 0,
    conIva: false,
    acabado: "natural",
    garantiaSalitre: true,
    estado: "borrador",
    creadaEn: "2026-10-12T18:00:00.000Z",
  };
}

let repo: RepoFalso;
let casos: ReturnType<typeof crearCasos>;

beforeEach(async () => {
  repo = new RepoFalso();
  casos = crearCasos(repo);
  await casos.crear();
});

describe("guardarPartida", () => {
  it("nueva: toma la foto del catálogo, guarda su importe y recalcula el total", async () => {
    const guardada = await casos.guardarPartida(ID_COT, PARTIDA);

    expect(guardada.material).toEqual({ unidad: "m2", precioCentavos: 185_000 });
    expect(repo.importes.get(ID_PARTIDA)).toBe(368_000);
    expect(repo.llamadas).toContain("guardarPartida:0:true");
    expect(repo.totales.get(ID_COT)?.totalCentavos).toBe(368_000);
  });

  it("corregida: conserva el precio con que se cotizó aunque el catálogo haya subido", async () => {
    await casos.guardarPartida(ID_COT, PARTIDA);
    repo.materiales.set(ID_MATERIAL, { ...CORREDIZA, precioCentavos: 999_999 });

    const corregida = await casos.guardarPartida(ID_COT, { ...PARTIDA, anchoCm: 100 });

    expect(corregida.material?.precioCentavos).toBe(185_000);
    expect(repo.llamadas).toContain("guardarPartida:0:false");
    // 1.00 × 1.50 = 1.5 m² × $1,850 + $350
    expect(repo.totales.get(ID_COT)?.totalCentavos).toBe(312_500);
  });

  it("ignora el precio que mande el navegador", async () => {
    const tramposa = { ...PARTIDA, material: { unidad: "m2" as const, precioCentavos: 1 } };
    expect((await casos.guardarPartida(ID_COT, tramposa)).material?.precioCentavos).toBe(185_000);
  });

  it("material que no es del taller: error, nada se guarda", async () => {
    await expect(casos.guardarPartida(ID_COT, { ...PARTIDA, materialId: "otro" })).rejects.toEqual(new ErrorDeCaso("material-inexistente"));
    expect(repo.importes.size).toBe(0);
  });

  it("cotización que no es del taller: error", async () => {
    await expect(casos.guardarPartida("otra", PARTIDA)).rejects.toEqual(new ErrorDeCaso("cotizacion-inexistente"));
  });
});

describe("quitar, editar y avisos", () => {
  it("quitarPartida recalcula el total", async () => {
    await casos.guardarPartida(ID_COT, PARTIDA);
    await casos.quitarPartida(ID_COT, ID_PARTIDA);
    expect(repo.totales.get(ID_COT)?.totalCentavos).toBe(0);
  });

  it("editar con descuento e IVA recalcula el total", async () => {
    await casos.guardarPartida(ID_COT, PARTIDA);
    await casos.editar(ID_COT, { descuentoPct: 10, conIva: true });
    // $3,680 − 10 % = $3,312 + 16 % = $3,841.92
    expect(repo.totales.get(ID_COT)?.totalCentavos).toBe(384_192);
  });

  it("marcarEnviada y avisoVisto pasan al repositorio", async () => {
    await casos.marcarEnviada(ID_COT);
    await casos.avisoVisto(ID_COT);
    expect(repo.llamadas).toEqual([`enviada:${ID_COT}`, `aviso:${ID_COT}`]);
  });
});
