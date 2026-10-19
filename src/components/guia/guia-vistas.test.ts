import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { porId, recorrer, tocar } from "@/test-utils/arbol-react";
import type { Paso } from "@/lib/guia/pasos";
import { recorte } from "@/lib/guia/recorrido";
import { GuiaVista, type PropsGuiaVista } from "./guia-vistas";

const PASO: Paso = { objetivo: "nueva", titulo: "Nueva cotización", texto: "Aquí empiezas una cotización en la obra." };
const { hueco, tapas } = recorte({ top: 660, left: 16, width: 328, height: 56 }, { width: 360, height: 740 }, 8);

const props = (cambios: Partial<PropsGuiaVista> = {}): PropsGuiaVista => ({
  paso: PASO, indice: 0, total: 2, hueco, tapas, colocacion: { lado: "encima", bottom: 92 },
  onSiguiente: vi.fn(), onAtras: vi.fn(), onSaltar: vi.fn(), ...cambios,
});
const arbol = (p: PropsGuiaVista) => recorrer(createElement(GuiaVista, p));
const html = (p: PropsGuiaVista) => renderToStaticMarkup(createElement(GuiaVista, p) as ReactElement);

describe("hoja de la guía", () => {
  it("muestra el rótulo, la explicación y en qué paso va", () => {
    const salida = html(props());
    for (const texto of ["Nueva cotización", "Aquí empiezas una cotización en la obra.", "1 de 2"]) expect(salida).toContain(texto);
  });

  it("el rótulo y la explicación nombran el diálogo", () => {
    const nodos = arbol(props());
    expect(porId(nodos, "guia-titulo")).toBeDefined();
    expect(porId(nodos, "guia-texto")).toBeDefined();
  });

  it("en el primer paso no hay Atrás", () => {
    expect(porId(arbol(props()), "guia-atras")).toBeUndefined();
  });

  it("avanza con Sigue, para no chocar con el Siguiente de la app", () => {
    const salida = html(props());
    expect(salida).toContain(">Sigue<");
    expect(salida).not.toContain("Siguiente");
  });

  it("en el último paso el botón dice Entendido y ya no ofrece saltar", () => {
    const nodos = arbol(props({ indice: 1 }));
    expect(html(props({ indice: 1 }))).toContain("Entendido");
    expect(porId(nodos, "guia-saltar")).toBeUndefined();
  });

  it("cada botón llama a lo suyo", () => {
    const p = props({ indice: 1, total: 3 });
    const nodos = arbol(p);
    tocar(porId(nodos, "guia-siguiente"));
    tocar(porId(nodos, "guia-atras"));
    tocar(porId(nodos, "guia-saltar"));
    expect(p.onSiguiente).toHaveBeenCalledOnce();
    expect(p.onAtras).toHaveBeenCalledOnce();
    expect(p.onSaltar).toHaveBeenCalledOnce();
  });

  it("los botones son de pulgar y Siguiente no es amarillo: el amarillo es lo que se señala", () => {
    const nodos = arbol(props());
    for (const id of ["guia-siguiente", "guia-saltar"]) expect(String(porId(nodos, id)!.props.className)).toContain("min-h-14");
    expect(String(porId(nodos, "guia-siguiente")!.props.className)).not.toContain("bg-amarillo");
  });
});

describe("oscurecido y recorte", () => {
  it("pinta cuatro tapas en las posiciones del recorte", () => {
    const tapasPintadas = arbol(props()).filter((n) => n.props["data-guia-tapa"] !== undefined);
    expect(tapasPintadas.map((n) => n.props.style)).toEqual(tapas.map((t) => ({ top: t.top, left: t.left, width: t.width, height: t.height })));
  });

  it("el marco cae justo sobre el hueco y deja pasar el toque", () => {
    const marco = porId(arbol(props()), "guia-marco");
    expect(marco!.props.style).toEqual({ top: hueco.top, left: hueco.left, width: hueco.width, height: hueco.height });
    expect(String(marco!.props.className)).toContain("pointer-events-none");
  });

  it("el marco lleva amarillo por fuera y tinta por dentro: se ve también sobre un botón amarillo", () => {
    const marco = porId(arbol(props()), "guia-marco")!;
    const interior = recorrer(marco.props.children as ReactElement);
    expect(String(marco.props.className)).toMatch(/border-amarillo/);
    expect(interior.some((n) => /border-tinta/.test(String(n.props.className)))).toBe(true);
  });

  it("las tapas sí detienen el toque: solo el hueco responde", () => {
    for (const tapa of arbol(props()).filter((n) => n.props["data-guia-tapa"] !== undefined)) {
      expect(String(tapa.props.className)).toContain("pointer-events-auto");
    }
  });

  it("la hoja siempre se ancla abajo, a la distancia que se le indica", () => {
    const hoja = porId(arbol(props({ colocacion: { lado: "encima", bottom: 92 } })), "guia-hoja")!;
    expect(hoja.props["data-lado"]).toBe("encima");
    expect(hoja.props.style).toEqual({ bottom: 92 });
    const pegada = porId(arbol(props({ colocacion: { lado: "abajo", bottom: 16 } })), "guia-hoja")!;
    expect(pegada.props["data-lado"]).toBe("abajo");
    expect(pegada.props.style).toEqual({ bottom: 16 });
  });

  it("sin sombras ni esquinas grandes", () => {
    const salida = html(props());
    expect(salida).not.toMatch(/shadow|rounded-(lg|xl|2xl|3xl|full)/);
  });
});
