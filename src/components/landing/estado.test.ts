import { describe, expect, it } from "vitest";
import { estadoInicialHero, hojaHero, lleno, puedeAgregar, reducirHero, TOPE_PARTIDAS, type EstadoHero } from "./estado";

const medir = (e: EstadoHero, ancho: string, alto: string) =>
  reducirHero(reducirHero(e, { tipo: "medida", lado: "ancho", texto: ancho }), { tipo: "medida", lado: "alto", texto: alto });

const agregar = (e: EstadoHero, plantillaId: string, ancho: string, alto: string) =>
  reducirHero(medir(reducirHero(e, { tipo: "trabajo", plantillaId }), ancho, alto), { tipo: "agregar" });

const lleno4 = () => {
  let e = estadoInicialHero();
  for (let i = 0; i < TOPE_PARTIDAS; i++) e = agregar(e, "mosquitero", "120", "150");
  return e;
};

describe("hero de la landing", () => {
  it("abre con una corrediza de 1.20 × 1.50 m ya cotizada y sin renglón en curso", () => {
    const hoja = hojaHero(estadoInicialHero());
    expect(hoja.renglones).toHaveLength(1);
    expect(hoja.enCurso).toBeNull();
    expect(hoja.totales.totalCentavos).toBe(426_880);
  });

  it("mientras se mide, el total no se mueve", () => {
    const hoja = hojaHero(medir(reducirHero(estadoInicialHero(), { tipo: "trabajo", plantillaId: "mosquitero" }), "120", "150"));
    expect(hoja.totales.totalCentavos).toBe(426_880);
    expect(hoja.enCurso).toMatchObject({ descripcion: "Mosquitero", anchoCm: 120, altoCm: 150 });
  });

  it("agregar es lo que mueve el total, al centavo", () => {
    const hoja = hojaHero(agregar(estadoInicialHero(), "mosquitero", "120", "150"));
    expect(hoja.renglones).toHaveLength(2);
    expect(hoja.renglones[1]!.resultado).toMatchObject({ ok: true, importeCentavos: 66_300 });
    expect(hoja.totales.totalCentavos).toBe(503_788);
    expect(hoja.enCurso).toBeNull();
  });

  it("deja los campos vacíos para la siguiente partida", () => {
    const e = agregar(estadoInicialHero(), "mosquitero", "120", "150");
    expect(e.borrador).toMatchObject({ plantillaId: "mosquitero", ancho: "", alto: "" });
    expect(e.borrador.partidaId).not.toBe(estadoInicialHero().borrador.partidaId);
  });

  it("sin las dos medidas no se puede agregar", () => {
    const e = estadoInicialHero();
    expect(puedeAgregar(e)).toBe(false);
    expect(puedeAgregar(medir(e, "120", ""))).toBe(false);
    expect(puedeAgregar(medir(e, "120", "0"))).toBe(false);
    expect(puedeAgregar(medir(e, "120", "150"))).toBe(true);
  });

  it("agregar sin medidas no cambia nada", () => {
    const e = estadoInicialHero();
    expect(reducirHero(e, { tipo: "agregar" })).toBe(e);
  });

  it("la medida con coma se redondea al centímetro", () => {
    const e = agregar(estadoInicialHero(), "mosquitero", "120,5", "150");
    expect(e.cotizacion.partidas[1]).toMatchObject({ anchoCm: 121, altoCm: 150 });
  });

  it("solo deja teclear tres enteros y un decimal", () => {
    const e = medir(estadoInicialHero(), "12345,678", "150");
    expect(e.borrador.ancho).toBe("123,6");
  });

  it("cambiar de trabajo limpia lo tecleado", () => {
    const e = reducirHero(medir(estadoInicialHero(), "120", "150"), { tipo: "trabajo", plantillaId: "cancel" });
    expect(e.borrador).toMatchObject({ plantillaId: "cancel", descripcion: "Cancel de baño", ancho: "", alto: "" });
    expect(hojaHero(e).enCurso).toMatchObject({ descripcion: "Cancel de baño", anchoCm: 0, altoCm: 0 });
  });

  it("la partida en curso sale en la hoja sin importe inventado", () => {
    const hoja = hojaHero(reducirHero(estadoInicialHero(), { tipo: "medida", lado: "ancho", texto: "90" }));
    expect(hoja.renglones).toHaveLength(1);
    expect(hoja.enCurso).toMatchObject({ anchoCm: 90, altoCm: 0 });
    expect(hoja.totales.totalCentavos).toBe(426_880);
  });

  it("la demostración se detiene en cuatro partidas y cierra la hoja", () => {
    const e = lleno4();
    expect(e.cotizacion.partidas).toHaveLength(TOPE_PARTIDAS);
    expect(lleno(e)).toBe(true);
    expect(puedeAgregar(medir(e, "120", "150"))).toBe(false);
    expect(hojaHero(e).enCurso).toBeNull();
  });

  it("se puede empezar de nuevo", () => {
    expect(reducirHero(lleno4(), { tipo: "reiniciar" })).toEqual(estadoInicialHero());
  });
});
