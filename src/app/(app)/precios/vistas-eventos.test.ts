import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { EntradaMaterial, MaterialGuardado } from "@/lib/catalogo/casos";
import { escribir, porId, porTexto, recorrer, tocar } from "@/test-utils/arbol-react";
import { FormularioNuevo, FormularioPrecio, Lista } from "./vistas";

const CORREDIZA: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };
const NUEVO: EntradaMaterial = { nombre: "Vidrio", linea: "Vidrios", unidad: "m2", precio: "100", piezaSingular: "", piezaPlural: "" };

describe("Lista (toques)", () => {
  const abrir = vi.fn();
  const abrirNuevo = vi.fn();
  const arbol = recorrer(createElement(Lista, { grupos: [{ linea: "Corredizas", materiales: [CORREDIZA] }], abrir, abrirNuevo }));

  it("tocar un material lo abre", () => {
    tocar(porId(arbol, "material-m1"));
    expect(abrir).toHaveBeenCalledWith(CORREDIZA);
  });

  it("tocar 'Agregar material' abre el formulario nuevo", () => {
    tocar(porId(arbol, "agregar-material"));
    expect(abrirNuevo).toHaveBeenCalledOnce();
  });
});

describe("FormularioPrecio (toques)", () => {
  const acciones = { cambiar: vi.fn(), quitar: vi.fn(), guardar: vi.fn(), cancelar: vi.fn() };
  const arbol = recorrer(createElement(FormularioPrecio, { material: CORREDIZA, precio: "2150.00", error: "", ocupado: false, progreso: "", ...acciones }));

  it("escribir el precio avisa el texto nuevo", () => {
    escribir(porId(arbol, "precio-editar"), "2300");
    expect(acciones.cambiar).toHaveBeenCalledWith("2300");
  });

  it.each([
    ["Quitar", "quitar"],
    ["Guardar", "guardar"],
    ["Cancelar", "cancelar"],
  ] as const)("el botón %s dispara %s", (texto, accion) => {
    tocar(porTexto(arbol, texto));
    expect(acciones[accion]).toHaveBeenCalledOnce();
  });
});

describe("FormularioNuevo (toques)", () => {
  const acciones = { cambiar: vi.fn(), guardar: vi.fn(), cancelar: vi.fn() };
  const montar = (entrada: EntradaMaterial) => recorrer(createElement(FormularioNuevo, { entrada, error: "", ocupado: false, progreso: "", ...acciones }));

  it.each([
    ["nombre-material", { nombre: "Filtrasol" }],
    ["linea-material", { linea: "Herrajes" }],
    ["precio-nuevo", { precio: "1480.50" }],
  ])("escribir en %s conserva lo demás y cambia solo ese campo", (id, cambio) => {
    escribir(porId(montar(NUEVO), id), Object.values(cambio)[0]!);
    expect(acciones.cambiar).toHaveBeenLastCalledWith({ ...NUEVO, ...cambio });
  });

  it.each([
    ["por m²", "m2"],
    ["por metro", "ml"],
    ["por pieza", "pieza"],
  ] as const)("elegir '%s' cambia la unidad a %s", (texto, unidad) => {
    tocar(porTexto(montar(NUEVO), texto));
    expect(acciones.cambiar).toHaveBeenLastCalledWith({ ...NUEVO, unidad });
  });

  it("por pieza, escribir singular y plural cambia solo esos campos", () => {
    const arbol = montar({ ...NUEVO, unidad: "pieza" });
    escribir(porId(arbol, "pieza-singular"), "jaladera");
    expect(acciones.cambiar).toHaveBeenLastCalledWith({ ...NUEVO, unidad: "pieza", piezaSingular: "jaladera" });
    escribir(porId(arbol, "pieza-plural"), "jaladeras");
    expect(acciones.cambiar).toHaveBeenLastCalledWith({ ...NUEVO, unidad: "pieza", piezaPlural: "jaladeras" });
  });

  it("Guardar y Cancelar disparan sus acciones", () => {
    const arbol = montar(NUEVO);
    tocar(porTexto(arbol, "Guardar"));
    tocar(porTexto(arbol, "Cancelar"));
    expect(acciones.guardar).toHaveBeenCalledOnce();
    expect(acciones.cancelar).toHaveBeenCalledOnce();
  });
});
