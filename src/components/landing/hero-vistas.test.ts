import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { escribir, porId, recorrer, tocar } from "@/test-utils/arbol-react";
import { estadoInicialHero, reducirHero, TOPE_PARTIDAS, type EstadoHero } from "./estado";
import { HeroVista } from "./hero-vistas";

const vista = (estado: EstadoHero, despachar = vi.fn()) => ({
  arbol: recorrer(createElement(HeroVista, { estado, despachar })),
  despachar,
});
const html = (estado: EstadoHero) => renderToStaticMarkup(createElement(HeroVista, { estado, despachar: vi.fn() }) as ReactElement);
const conMedidas = (ancho: string, alto: string) =>
  reducirHero(reducirHero(estadoInicialHero(), { tipo: "medida", lado: "ancho", texto: ancho }), { tipo: "medida", lado: "alto", texto: alto });
const lleno = () => {
  let estado = estadoInicialHero();
  for (let i = 0; i < TOPE_PARTIDAS; i++) estado = reducirHero(conMedidasDe(estado, "120", "150"), { tipo: "agregar" });
  return estado;
};
const conMedidasDe = (estado: EstadoHero, ancho: string, alto: string) =>
  reducirHero(reducirHero(estado, { tipo: "medida", lado: "ancho", texto: ancho }), { tipo: "medida", lado: "alto", texto: alto });

describe("hoja del hero", () => {
  it("muestra la partida de arranque con sus medidas y su importe", () => {
    const salida = html(estadoInicialHero());
    for (const texto of ["Ventana corrediza", "1.20 × 1.50 m", "$3,680.00", "$4,268.80"]) expect(salida).toContain(texto);
  });

  it("al abrir invita a probar, sin renglón vacío ni corrección por adelantado", () => {
    const salida = html(estadoInicialHero());
    expect(salida).toContain("Pruébalo: elige el trabajo y teclea las medidas.");
    expect(salida).not.toContain("? × ? m");
    expect(salida).not.toContain("Pon las dos medidas en centímetros.");
  });

  it("dice de dónde sale el importe del trabajo elegido", () => {
    expect(html(estadoInicialHero())).toContain("Precio de ejemplo: $1,850.00 por m²");
  });

  it("el renglón en curso deja la medida que falta como ? y pide las dos medidas", () => {
    const salida = html(conMedidas("90", ""));
    expect(salida).toContain("0.90 × ? m");
    expect(salida).toContain("Pon las dos medidas en centímetros.");
  });

  it("con las dos medidas el renglón sigue sin importe: lo mueve el botón", () => {
    const salida = html(conMedidas("120", "150"));
    expect(salida).toContain("1.20 × 1.50 m");
    expect(salida).toContain("$4,268.80");
    expect(salida).not.toContain("$663.00");
  });

  it("al llenarse cierra la hoja con una salida en sitio", () => {
    const salida = html(lleno());
    expect(salida).toContain("Ya viste cómo va. En tu cuenta van tus precios, tu logo y tus condiciones.");
    expect(salida).toContain('href="/entrar"');
    expect(salida).not.toContain("? × ? m");
  });

  it("no pinta ningún amarillo: el único es el de registrarse", () => {
    expect(html(estadoInicialHero())).not.toContain("amarillo");
  });
});

describe("controles del hero", () => {
  it("elegir un trabajo lo despacha", () => {
    const { arbol, despachar } = vista(estadoInicialHero());
    tocar(porId(arbol, "trabajo-mosquitero"));
    expect(despachar).toHaveBeenCalledWith({ tipo: "trabajo", plantillaId: "mosquitero" });
  });

  it("ofrece cuatro trabajos y marca el elegido", () => {
    const { arbol } = vista(estadoInicialHero());
    for (const id of ["corrediza", "mosquitero", "cancel", "abatible"]) expect(porId(arbol, `trabajo-${id}`)).toBeTruthy();
    expect(porId(arbol, "trabajo-corrediza")?.props["aria-pressed"]).toBe(true);
    expect(porId(arbol, "trabajo-mosquitero")?.props["aria-pressed"]).toBe(false);
  });

  it("teclear el ancho y el alto los despacha", () => {
    const { arbol, despachar } = vista(estadoInicialHero());
    escribir(porId(arbol, "hero-ancho"), "120");
    escribir(porId(arbol, "hero-alto"), "150");
    expect(despachar).toHaveBeenNthCalledWith(1, { tipo: "medida", lado: "ancho", texto: "120" });
    expect(despachar).toHaveBeenNthCalledWith(2, { tipo: "medida", lado: "alto", texto: "150" });
  });

  it("el botón de agregar queda sin efecto hasta tener las dos medidas, pero enfocable", () => {
    const sinMedidas = vista(estadoInicialHero());
    expect(porId(sinMedidas.arbol, "hero-agregar")?.props["aria-disabled"]).toBe(true);
    expect(porId(sinMedidas.arbol, "hero-agregar")?.props.disabled).toBeUndefined();
    tocar(porId(sinMedidas.arbol, "hero-agregar"));
    expect(sinMedidas.despachar).not.toHaveBeenCalled();
    expect(porId(vista(conMedidas("120", "150")).arbol, "hero-agregar")?.props["aria-disabled"]).toBe(false);
  });

  it("la ayuda está siempre presente, ligada a los dos campos, y dice en qué estado va", () => {
    const { arbol } = vista(conMedidas("120", ""));
    for (const id of ["hero-ancho", "hero-alto"]) expect(porId(arbol, id)?.props["aria-describedby"]).toBe("hero-ayuda");
    expect(porId(arbol, "hero-ayuda")?.props.role).toBe("status");
    expect(html(estadoInicialHero())).toContain("Elige el trabajo y pon las dos medidas en centímetros.");
    expect(html(conMedidas("120", ""))).toContain("Pon las dos medidas en centímetros.");
    expect(html(conMedidas("120", "150"))).toContain("Listo: toca Agregar partida.");
    expect(html(reducirHero(conMedidas("120", "150"), { tipo: "agregar" }))).toContain("Partida agregada. Total $8,537.60.");
  });

  it("el trabajo elegido se invierte a tinta: papel-2 no se ve bajo el sol", () => {
    const clases = porId(vista(estadoInicialHero()).arbol, "trabajo-corrediza")?.props.className as string;
    expect(clases).toContain("aria-[pressed=true]:bg-tinta");
    expect(clases).toContain("aria-[pressed=true]:text-papel");
  });

  it("la hoja lleva el sello del folio", () => {
    expect(html(estadoInicialHero())).toContain("0043");
  });

  it("agregar despacha la partida", () => {
    const { arbol, despachar } = vista(conMedidas("120", "150"));
    tocar(porId(arbol, "hero-agregar"));
    expect(despachar).toHaveBeenCalledWith({ tipo: "agregar" });
  });

  it("después de la segunda partida se puede empezar de nuevo", () => {
    const { arbol, despachar } = vista(reducirHero(conMedidas("120", "150"), { tipo: "agregar" }));
    const reiniciar = arbol.find((n) => n.type === "button" && n.props.onClick && n.props.className?.toString().includes("mt-2 block"));
    tocar(reiniciar);
    expect(despachar).toHaveBeenCalledWith({ tipo: "reiniciar" });
  });
});
