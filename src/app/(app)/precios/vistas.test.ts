import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { EntradaMaterial, MaterialGuardado } from "@/lib/catalogo/casos";
import { FormularioNuevo, FormularioPrecio, Lista } from "./vistas";

const CORREDIZA: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };
const VIDRIO: MaterialGuardado = { id: "m2", clave: "vidrio", nombre: "Vidrio claro", linea: "Vidrios", unidad: "ml", precioCentavos: 90000 };
const GRUPOS = [
  { linea: "Corredizas", materiales: [CORREDIZA] },
  { linea: "Vidrios", materiales: [VIDRIO] },
];
const NUEVO: EntradaMaterial = { nombre: "Vidrio filtrasol", linea: "", unidad: "m2", precio: "1480.50", piezaSingular: "", piezaPlural: "" };

const html = (elemento: ReactElement) => renderToStaticMarkup(elemento);
const veces = (texto: string, buscado: string) => texto.split(buscado).length - 1;
const acciones = () => ({ cambiar: vi.fn(), guardar: vi.fn(), cancelar: vi.fn() });

describe("Lista", () => {
  const pintar = (grupos = GRUPOS) => html(createElement(Lista, { grupos, abrir: vi.fn(), abrirNuevo: vi.fn() }));

  it("muestra cada línea con sus materiales, unidad en palabras y precio", () => {
    const salida = pintar();
    for (const texto of ["Corredizas", "Vidrios", "Corrediza 3 pulgadas", "por m²", "por metro", "$2,150.00", "$900.00"]) {
      expect(salida).toContain(texto);
    }
    expect(salida).toContain('id="material-m1"');
  });

  it("siempre ofrece agregar material", () => {
    expect(pintar()).toContain("Agregar material");
    expect(pintar([])).toContain("Agregar material");
  });

  it("sin materiales invita a agregar el primero", () => {
    expect(pintar([])).toContain("Aún no tienes materiales. Agrega el primero.");
    expect(pintar()).not.toContain("Aún no tienes materiales");
  });
});

describe("FormularioPrecio", () => {
  const pintar = (cambios: { error?: string; ocupado?: boolean; progreso?: string } = {}) =>
    html(createElement(FormularioPrecio, { material: CORREDIZA, precio: "2150.00", error: "", ocupado: false, progreso: "", quitar: vi.fn(), ...acciones(), ...cambios }));

  it("muestra el material, su unidad y el precio listo para editar", () => {
    const salida = pintar();
    for (const texto of ["Corrediza 3 pulgadas", "por m²", 'value="2150.00"', "Quitar", "Cancelar", "Guardar"]) {
      expect(salida).toContain(texto);
    }
  });

  it("sin error no hay alerta; con error se lee tal cual", () => {
    expect(pintar()).not.toContain('role="alert"');
    const salida = pintar({ error: "Escribe un precio mayor a cero." });
    expect(salida).toContain('role="alert"');
    expect(salida).toContain("Escribe un precio mayor a cero.");
  });

  it("mientras guarda muestra el progreso y bloquea los tres botones", () => {
    const salida = pintar({ ocupado: true, progreso: "Guardando…" });
    expect(salida).toContain("Guardando…");
    expect(veces(salida, 'disabled=""')).toBe(3);
    expect(veces(pintar(), 'disabled=""')).toBe(0);
  });
});

describe("FormularioNuevo", () => {
  const pintar = (entrada: EntradaMaterial = NUEVO, cambios: { error?: string; ocupado?: boolean; progreso?: string } = {}) =>
    html(createElement(FormularioNuevo, { entrada, error: "", ocupado: false, progreso: "", ...acciones(), ...cambios }));

  it("muestra lo escrito y las tres unidades con solo una marcada", () => {
    const salida = pintar();
    expect(salida).toContain('value="Vidrio filtrasol"');
    expect(salida).toContain('value="1480.50"');
    for (const unidad of ["por m²", "por metro", "por pieza"]) expect(salida).toContain(unidad);
    expect(veces(salida, 'aria-pressed="true"')).toBe(1);
    expect(salida).toMatch(/aria-pressed="true"[^>]*>por m²</);
  });

  it("solo 'por pieza' pregunta cómo se llama la pieza", () => {
    expect(pintar()).not.toContain("¿Cómo se llama la pieza?");
    const salida = pintar({ ...NUEVO, unidad: "pieza", piezaSingular: "jaladera", piezaPlural: "jaladeras" });
    for (const texto of ["¿Cómo se llama la pieza?", "Singular", "Plural", 'value="jaladera"', 'value="jaladeras"']) {
      expect(salida).toContain(texto);
    }
    expect(salida).toMatch(/aria-pressed="true"[^>]*>por pieza</);
  });

  it("muestra el error sin borrar lo escrito y bloquea mientras guarda", () => {
    const salida = pintar(NUEVO, { error: "Ya tienes un material con ese nombre.", ocupado: true, progreso: "Guardando…" });
    expect(salida).toContain("Ya tienes un material con ese nombre.");
    expect(salida).toContain('value="Vidrio filtrasol"');
    expect(salida).toContain("Guardando…");
    expect(veces(salida, 'disabled=""')).toBe(2);
  });
});
