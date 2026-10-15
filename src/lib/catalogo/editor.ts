import type { EntradaMaterial, MaterialGuardado, ResultadoCatalogo } from "./casos";
import { precioParaEdicion } from "./edicion";

export const SIN_SENAL = "Sin señal. Tu cambio no se guardó, inténtalo cuando tengas internet.";

type PantallaEditor =
  | { tipo: "lista" }
  | { tipo: "precio"; material: MaterialGuardado; precio: string }
  | { tipo: "nuevo"; entrada: EntradaMaterial };

export type EstadoEditor = { pantalla: PantallaEditor; error: string; operacion: string };
export type AccionEditor =
  | { tipo: "abrir-precio"; material: MaterialGuardado }
  | { tipo: "abrir-nuevo" }
  | { tipo: "cambiar-precio"; precio: string }
  | { tipo: "cambiar-entrada"; cambios: Partial<EntradaMaterial> }
  | { tipo: "cancelar" }
  | { tipo: "empezar"; texto: string }
  | { tipo: "fallar"; mensaje: string }
  | { tipo: "terminar" };

const ENTRADA_VACIA: EntradaMaterial = {
  nombre: "", linea: "", unidad: "m2", precio: "", piezaSingular: "", piezaPlural: "",
};

export const ESTADO_INICIAL: EstadoEditor = { pantalla: { tipo: "lista" }, error: "", operacion: "" };

function reducirLista(estado: EstadoEditor, accion: AccionEditor): EstadoEditor {
  if (accion.tipo === "abrir-precio") {
    return { pantalla: { tipo: "precio", material: accion.material, precio: precioParaEdicion(accion.material.precioCentavos) }, error: "", operacion: "" };
  }
  if (accion.tipo === "abrir-nuevo") {
    return { pantalla: { tipo: "nuevo", entrada: { ...ENTRADA_VACIA } }, error: "", operacion: "" };
  }
  return estado;
}

function cambiarFormulario(estado: EstadoEditor, accion: AccionEditor): EstadoEditor {
  if (accion.tipo === "cambiar-precio" && estado.pantalla.tipo === "precio") {
    return { ...estado, pantalla: { ...estado.pantalla, precio: accion.precio } };
  }
  if (accion.tipo === "cambiar-entrada" && estado.pantalla.tipo === "nuevo") {
    return { ...estado, pantalla: { ...estado.pantalla, entrada: { ...estado.pantalla.entrada, ...accion.cambios } } };
  }
  return estado;
}

export function reducirEditor(estado: EstadoEditor, accion: AccionEditor): EstadoEditor {
  if (estado.pantalla.tipo === "lista") return reducirLista(estado, accion);
  if (accion.tipo === "empezar") return { ...estado, error: "", operacion: accion.texto };
  if (accion.tipo === "fallar") return { ...estado, error: accion.mensaje, operacion: "" };
  if (accion.tipo === "cancelar" || accion.tipo === "terminar") return ESTADO_INICIAL;
  return cambiarFormulario(estado, accion);
}

export async function ejecutarOperacion(accion: () => Promise<ResultadoCatalogo>): Promise<ResultadoCatalogo> {
  try {
    return await accion();
  } catch {
    return { ok: false, mensaje: SIN_SENAL };
  }
}
