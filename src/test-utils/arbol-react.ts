import { isValidElement, type ReactElement, type ReactNode } from "react";

// Pruebas de componentes sin DOM: se recorre el árbol de elementos de React, expandiendo los
// componentes de función (deben ser puros, sin hooks), y se disparan a mano los manejadores.

export type Nodo = ReactElement<Record<string, unknown>>;
type Manejador = (evento?: unknown) => void;

export function recorrer(nodo: ReactNode): Nodo[] {
  if (Array.isArray(nodo)) return nodo.flatMap(recorrer);
  if (!isValidElement<Record<string, unknown>>(nodo)) return [];
  const hijos = typeof nodo.type === "function" ? (nodo.type as (props: unknown) => ReactNode)(nodo.props) : (nodo.props.children as ReactNode);
  return [nodo, ...recorrer(hijos)];
}

export function textoDe(nodo: ReactNode): string {
  if (Array.isArray(nodo)) return nodo.map(textoDe).join("");
  if (typeof nodo === "string" || typeof nodo === "number") return String(nodo);
  return isValidElement<{ children?: ReactNode }>(nodo) ? textoDe(nodo.props.children) : "";
}

export const porId = (arbol: Nodo[], id: string) => arbol.find((n) => typeof n.type === "string" && n.props.id === id);
export const porTexto = (arbol: Nodo[], texto: string) => arbol.find((n) => n.type === "button" && textoDe(n.props.children as ReactNode) === texto);
export const alerta = (arbol: Nodo[]) => textoDe(arbol.find((n) => n.props.role === "alert")?.props.children as ReactNode);

export const tocar = (nodo: Nodo | undefined) => (nodo!.props.onClick as Manejador)();
export const escribir = (nodo: Nodo | undefined, valor: string) => (nodo!.props.onChange as Manejador)({ target: { value: valor } });
