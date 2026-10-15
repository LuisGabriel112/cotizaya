import { describe, expect, it } from "vitest";
import type { EntradaMaterial, MaterialGuardado } from "./casos";
import { ejecutarOperacion, ESTADO_INICIAL, reducirEditor, SIN_SENAL, type EstadoEditor } from "./editor";

const MATERIAL: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };
const NUEVO_VACIO: EntradaMaterial = { nombre: "", linea: "", unidad: "m2", precio: "", piezaSingular: "", piezaPlural: "" };

const editandoPrecio = (precio = "2150.00"): EstadoEditor => ({ pantalla: { tipo: "precio", material: MATERIAL, precio }, error: "", operacion: "" });
const agregando = (cambios: Partial<EntradaMaterial> = {}): EstadoEditor => ({ pantalla: { tipo: "nuevo", entrada: { ...NUEVO_VACIO, ...cambios } }, error: "", operacion: "" });

describe("reducirEditor", () => {
  it("arranca en la lista, sin error y sin operación", () => {
    expect(ESTADO_INICIAL).toEqual({ pantalla: { tipo: "lista" }, error: "", operacion: "" });
  });

  it("abrir un material muestra su precio listo para editar y borra el error anterior", () => {
    const antes: EstadoEditor = { ...ESTADO_INICIAL, error: "viejo" };
    expect(reducirEditor(antes, { tipo: "abrir-precio", material: MATERIAL })).toEqual(editandoPrecio("2150.00"));
  });

  it("abrir 'agregar' empieza con el formulario vacío, por m², y borra el error", () => {
    const antes: EstadoEditor = { ...ESTADO_INICIAL, error: "viejo" };
    expect(reducirEditor(antes, { tipo: "abrir-nuevo" })).toEqual(agregando());
  });

  it("cambiar el precio solo aplica mientras se edita un precio", () => {
    expect(reducirEditor(editandoPrecio(), { tipo: "cambiar-precio", precio: "2300" })).toEqual(editandoPrecio("2300"));
    expect(reducirEditor(ESTADO_INICIAL, { tipo: "cambiar-precio", precio: "2300" })).toBe(ESTADO_INICIAL);
    expect(reducirEditor(agregando(), { tipo: "cambiar-precio", precio: "2300" })).toEqual(agregando());
  });

  it("cambiar la entrada mezcla los cambios con lo ya escrito, solo en el formulario nuevo", () => {
    const escrito = reducirEditor(agregando({ nombre: "Vidrio" }), { tipo: "cambiar-entrada", cambios: { unidad: "pieza" } });
    expect(escrito).toEqual(agregando({ nombre: "Vidrio", unidad: "pieza" }));
    expect(reducirEditor(ESTADO_INICIAL, { tipo: "cambiar-entrada", cambios: { nombre: "x" } })).toBe(ESTADO_INICIAL);
    const enPrecio = editandoPrecio();
    expect(reducirEditor(enPrecio, { tipo: "cambiar-entrada", cambios: { nombre: "x" } })).toBe(enPrecio);
  });

  it("cancelar regresa a la lista y borra el error", () => {
    const conError: EstadoEditor = { ...agregando({ nombre: "Vidrio" }), error: "Ponle un nombre al material." };
    expect(reducirEditor(conError, { tipo: "cancelar" })).toEqual(ESTADO_INICIAL);
  });

  it("empezar marca la operación en curso y limpia el error, sin tocar lo escrito", () => {
    const conError: EstadoEditor = { ...editandoPrecio("99"), error: "viejo" };
    expect(reducirEditor(conError, { tipo: "empezar", texto: "Guardando…" })).toEqual({ ...editandoPrecio("99"), operacion: "Guardando…" });
  });

  it("fallar muestra el mensaje, libera la operación y conserva lo escrito", () => {
    const enCurso: EstadoEditor = { ...agregando({ nombre: "Vidrio", precio: "abc" }), operacion: "Guardando…" };
    expect(reducirEditor(enCurso, { tipo: "fallar", mensaje: "Escribe un precio mayor a cero." })).toEqual({
      ...agregando({ nombre: "Vidrio", precio: "abc" }),
      error: "Escribe un precio mayor a cero.",
    });
  });

  it("terminar bien regresa a la lista, libre y sin error", () => {
    const enCurso: EstadoEditor = { ...editandoPrecio(), operacion: "Guardando…" };
    expect(reducirEditor(enCurso, { tipo: "terminar" })).toEqual(ESTADO_INICIAL);
  });
});

describe("ejecutarOperacion", () => {
  it("regresa ok cuando la acción sale bien", async () => {
    expect(await ejecutarOperacion(async () => ({ ok: true }))).toEqual({ ok: true });
  });

  it("regresa el mensaje de la acción cuando no sale bien", async () => {
    expect(await ejecutarOperacion(async () => ({ ok: false, mensaje: "Ya tienes un material con ese nombre." }))).toEqual({
      ok: false,
      mensaje: "Ya tienes un material con ese nombre.",
    });
  });

  it("si la acción truena (sin red), avisa que no hay señal", async () => {
    expect(await ejecutarOperacion(() => Promise.reject(new Error("Failed to fetch")))).toEqual({ ok: false, mensaje: SIN_SENAL });
    expect(SIN_SENAL).toBe("Sin señal. Tu cambio no se guardó, inténtalo cuando tengas internet.");
  });
});
