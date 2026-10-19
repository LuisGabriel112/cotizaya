import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MaterialGuardado } from "@/lib/catalogo/casos";
import { SIN_SENAL } from "@/lib/catalogo/editor";
import { alerta, escribir, porId, porTexto, recorrer, tocar } from "@/test-utils/arbol-react";
import { EditorCatalogo } from "./editor-catalogo";

// Sin DOM: useReducer, useEffect y useRef se sustituyen por versiones mínimas para llamar al
// componente como función y revisar el cableado (acciones del servidor, refresco, confirmación).
const memoria = vi.hoisted(() => ({ estado: undefined as unknown, ref: undefined as { current: unknown } | undefined }));
const refrescar = vi.hoisted(() => vi.fn());
const acciones = vi.hoisted(() => ({ agregarMaterial: vi.fn(), cambiarPrecio: vi.fn(), quitarMaterial: vi.fn() }));

vi.mock("react", async (importarOriginal) => {
  const react = await importarOriginal<typeof import("react")>();
  type Reductor = (estado: unknown, accion: unknown) => unknown;
  return {
    ...react,
    useReducer: (reductor: Reductor, inicial: unknown) => {
      memoria.estado ??= inicial;
      return [memoria.estado, (accion: unknown) => { memoria.estado = reductor(memoria.estado, accion); }];
    },
    useEffect: (efecto: () => void) => efecto(),
    useRef: (valor: unknown) => (memoria.ref ??= { current: valor }),
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refrescar }) }));
vi.mock("./acciones", () => acciones);
vi.mock("@/components/guia/guia", () => ({ Guia: () => null }));

const CORREDIZA: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };
const GRUPOS = [{ linea: "Corredizas", materiales: [CORREDIZA] }];
const confirmar = vi.fn();
const enfocar = vi.fn();
const buscarElemento = vi.fn();

const pantalla = () => recorrer(EditorCatalogo({ grupos: GRUPOS }));
const abrirMaterial = () => tocar(porId(pantalla(), "material-m1"));
const enLista = () => porId(pantalla(), "agregar-material") !== undefined;
const valorDe = (id: string) => porId(pantalla(), id)!.props.value;

beforeEach(() => {
  memoria.estado = undefined;
  memoria.ref = undefined;
  vi.clearAllMocks();
  vi.stubGlobal("window", { confirm: confirmar });
  vi.stubGlobal("document", { getElementById: buscarElemento });
  confirmar.mockReturnValue(true);
  buscarElemento.mockReturnValue({ focus: enfocar });
});

describe("EditorCatalogo: foco al volver a la lista", () => {
  it("regresa al material que se abrió, una sola vez", () => {
    abrirMaterial();
    tocar(porTexto(pantalla(), "Cancelar"));
    pantalla();
    pantalla();
    expect(buscarElemento).toHaveBeenCalledWith("material-m1");
    expect(enfocar).toHaveBeenCalledOnce();
  });

  it("regresa al botón de agregar si de ahí se abrió el formulario", () => {
    tocar(porId(pantalla(), "agregar-material"));
    tocar(porTexto(pantalla(), "Cancelar"));
    pantalla();
    expect(buscarElemento).toHaveBeenCalledWith("agregar-material");
    expect(enfocar).toHaveBeenCalledOnce();
  });

  it("si el elemento ya no existe, no truena", () => {
    buscarElemento.mockReturnValue(null);
    abrirMaterial();
    tocar(porTexto(pantalla(), "Cancelar"));
    expect(() => pantalla()).not.toThrow();
    expect(enfocar).not.toHaveBeenCalled();
  });

  it("mientras hay un formulario abierto no se mueve el foco", () => {
    abrirMaterial();
    pantalla();
    expect(enfocar).not.toHaveBeenCalled();
  });
});

describe("EditorCatalogo: precio", () => {
  it("abrir un material muestra su precio listo para editar", () => {
    abrirMaterial();
    expect(valorDe("precio-editar")).toBe("2150.00");
    expect(enLista()).toBe(false);
  });

  it("guardar manda el precio a la acción, refresca y vuelve a la lista", async () => {
    acciones.cambiarPrecio.mockResolvedValue({ ok: true });
    abrirMaterial();
    escribir(porId(pantalla(), "precio-editar"), "2300");
    tocar(porTexto(pantalla(), "Guardar"));
    expect(porTexto(pantalla(), "Guardando…")).toBeDefined();
    await vi.waitFor(() => expect(refrescar).toHaveBeenCalledOnce());
    expect(acciones.cambiarPrecio).toHaveBeenCalledWith("m1", "2300");
    expect(enLista()).toBe(true);
  });

  it("si la acción dice que no, muestra su mensaje y conserva lo escrito", async () => {
    acciones.cambiarPrecio.mockResolvedValue({ ok: false, mensaje: "Escribe un precio mayor a cero." });
    abrirMaterial();
    escribir(porId(pantalla(), "precio-editar"), "abc");
    tocar(porTexto(pantalla(), "Guardar"));
    await vi.waitFor(() => expect(alerta(pantalla())).toBe("Escribe un precio mayor a cero."));
    expect(valorDe("precio-editar")).toBe("abc");
    expect(refrescar).not.toHaveBeenCalled();
  });

  it("sin red avisa que no hay señal y no refresca", async () => {
    acciones.cambiarPrecio.mockRejectedValue(new Error("Failed to fetch"));
    abrirMaterial();
    tocar(porTexto(pantalla(), "Guardar"));
    await vi.waitFor(() => expect(alerta(pantalla())).toBe(SIN_SENAL));
    expect(refrescar).not.toHaveBeenCalled();
  });

  it("cancelar vuelve a la lista", () => {
    abrirMaterial();
    tocar(porTexto(pantalla(), "Cancelar"));
    expect(enLista()).toBe(true);
  });
});

describe("EditorCatalogo: quitar", () => {
  it("si no se confirma, no se quita nada", () => {
    confirmar.mockReturnValue(false);
    abrirMaterial();
    tocar(porTexto(pantalla(), "Quitar"));
    expect(confirmar).toHaveBeenCalledWith("¿Quitar este material?");
    expect(acciones.quitarMaterial).not.toHaveBeenCalled();
  });

  it("si se confirma, se quita, se refresca y vuelve a la lista", async () => {
    acciones.quitarMaterial.mockResolvedValue({ ok: true });
    abrirMaterial();
    tocar(porTexto(pantalla(), "Quitar"));
    expect(porTexto(pantalla(), "Quitando…")).toBeDefined();
    await vi.waitFor(() => expect(refrescar).toHaveBeenCalledOnce());
    expect(acciones.quitarMaterial).toHaveBeenCalledWith("m1");
    expect(enLista()).toBe(true);
  });
});

describe("EditorCatalogo: agregar", () => {
  it("guarda lo escrito, refresca y vuelve a la lista", async () => {
    acciones.agregarMaterial.mockResolvedValue({ ok: true });
    tocar(porId(pantalla(), "agregar-material"));
    escribir(porId(pantalla(), "nombre-material"), "Vidrio");
    escribir(porId(pantalla(), "precio-nuevo"), "100");
    tocar(porTexto(pantalla(), "Guardar"));
    await vi.waitFor(() => expect(refrescar).toHaveBeenCalledOnce());
    expect(acciones.agregarMaterial).toHaveBeenCalledWith({ nombre: "Vidrio", linea: "", unidad: "m2", precio: "100", piezaSingular: "", piezaPlural: "" });
    expect(enLista()).toBe(true);
  });

  it("cancelar vuelve a la lista sin llamar a la acción", () => {
    tocar(porId(pantalla(), "agregar-material"));
    tocar(porTexto(pantalla(), "Cancelar"));
    expect(enLista()).toBe(true);
    expect(acciones.agregarMaterial).not.toHaveBeenCalled();
  });
});
