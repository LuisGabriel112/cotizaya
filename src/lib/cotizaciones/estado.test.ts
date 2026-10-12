import { describe, expect, it } from "vitest";
import { reducir, type EstadoLista } from "./estado";
import type { Cotizacion, PartidaGuardada } from "./tipos";

const AHORA = "2026-10-12T18:00:00.000Z";

function cot(id: string, cambios: Partial<Cotizacion> = {}): Cotizacion {
  return {
    id,
    folio: 1,
    slug: `s-${id}`,
    cliente: "",
    partidas: [],
    descuentoPct: 0,
    conIva: false,
    acabado: "natural",
    garantiaSalitre: true,
    estado: "borrador",
    creadaEn: AHORA,
    ...cambios,
  };
}

const P1: PartidaGuardada = {
  id: "p1",
  plantillaId: "corrediza",
  descripcion: "Ventana",
  materialId: "m1",
  anchoCm: 120,
  altoCm: 150,
  cantidad: 1,
  manoObraCentavos: 35_000,
};

function con(...cotizaciones: Cotizacion[]): EstadoLista {
  return { listo: true, cotizaciones };
}

const unica = (e: EstadoLista) => e.cotizaciones[0]!;

describe("reducir", () => {
  it("cargar marca la lista como lista", () => {
    expect(reducir({ listo: false, cotizaciones: [] }, { tipo: "cargar", cotizaciones: [cot("a")] })).toEqual(con(cot("a")));
  });

  it("crear pone la nueva arriba", () => {
    const e = reducir(con(cot("a")), { tipo: "crear", cotizacion: cot("b") });
    expect(e.cotizaciones.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("guardarPartida agrega la nueva y reemplaza la existente", () => {
    const conUna = reducir(con(cot("a")), { tipo: "guardarPartida", id: "a", partida: P1 });
    const cambiada = reducir(conUna, { tipo: "guardarPartida", id: "a", partida: { ...P1, anchoCm: 90 } });
    expect(unica(conUna).partidas).toEqual([P1]);
    expect(unica(cambiada).partidas).toEqual([{ ...P1, anchoCm: 90 }]);
  });

  it("quitarPartida la saca solo de esa cotización", () => {
    const e = reducir(con(cot("a", { partidas: [P1] }), cot("b", { partidas: [P1] })), { tipo: "quitarPartida", id: "a", partidaId: "p1" });
    expect(e.cotizaciones.map((c) => c.partidas.length)).toEqual([0, 1]);
  });

  it("editar aplica los cambios", () => {
    const e = reducir(con(cot("a")), { tipo: "editar", id: "a", cambios: { cliente: "Leticia", conIva: true } });
    expect(unica(e)).toMatchObject({ cliente: "Leticia", conIva: true });
  });

  it("enviada solo avanza desde borrador", () => {
    const desdeBorrador = reducir(con(cot("a")), { tipo: "enviada", id: "a" });
    const desdeAceptada = reducir(con(cot("a", { estado: "aceptada" })), { tipo: "enviada", id: "a" });
    expect(unica(desdeBorrador).estado).toBe("enviada");
    expect(unica(desdeAceptada).estado).toBe("aceptada");
  });

  it("abierta deja vista con aviso, sin retroceder una aceptada", () => {
    const enviada = reducir(con(cot("a", { estado: "enviada" })), { tipo: "abierta", slug: "s-a", en: AHORA });
    const aceptada = reducir(con(cot("a", { estado: "aceptada" })), { tipo: "abierta", slug: "s-a", en: AHORA });
    expect(unica(enviada)).toMatchObject({ estado: "vista", vistaEn: AHORA, avisoPendiente: true });
    expect(unica(aceptada).estado).toBe("aceptada");
  });

  it("avisoVisto apaga el aviso", () => {
    const e = reducir(con(cot("a", { avisoPendiente: true })), { tipo: "avisoVisto", id: "a" });
    expect(unica(e).avisoPendiente).toBe(false);
  });

  it("aceptada marca la cotización y avisa", () => {
    const e = reducir(con(cot("a", { estado: "vista" })), { tipo: "aceptada", slug: "s-a" });
    expect(unica(e)).toMatchObject({ estado: "aceptada", avisoPendiente: true });
  });
});
