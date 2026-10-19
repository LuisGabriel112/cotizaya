import { useLayoutEffect, useRef, type RefObject } from "react";
import { buscarObjetivo } from "./use-vistas";

const SIGUE = "#guia-siguiente";

function abrirDialogo(dialogo: HTMLDialogElement, tocado: RefObject<boolean>) {
  const anterior = document.activeElement;
  tocado.current = false;
  dialogo.show();
  return () => {
    dialogo.close();
    if (!tocado.current && anterior instanceof HTMLElement && anterior !== document.body && anterior.isConnected) anterior.focus({ preventScroll: true });
  };
}

const dentroDe = (nodo: EventTarget | null, contenedor: Element | null) => nodo instanceof Node && !!contenedor?.contains(nodo);

/**
 * Tocar el objetivo (o darle Enter) cierra la guía y deja pasar la acción. El diálogo no es modal para que el
 * toque llegue al objetivo, así que el foco se contiene a mano: lo que está bajo las tapas no se puede enfocar.
 */
function escucharCierre(dialogo: HTMLDialogElement, objetivo: string, tocado: RefObject<boolean>, cerrar: RefObject<() => void>) {
  const tocar = (evento: MouseEvent) => {
    if (!dentroDe(evento.target, buscarObjetivo(objetivo))) return;
    tocado.current = true;
    cerrar.current();
  };
  const tecla = (evento: KeyboardEvent) => { if (evento.key === "Escape") cerrar.current(); };
  const contener = (evento: FocusEvent) => {
    if (dentroDe(evento.target, dialogo) || dentroDe(evento.target, buscarObjetivo(objetivo))) return;
    dialogo.querySelector<HTMLElement>(SIGUE)?.focus({ preventScroll: true });
  };
  document.addEventListener("click", tocar, true);
  document.addEventListener("keydown", tecla);
  document.addEventListener("focusin", contener);
  return () => {
    document.removeEventListener("click", tocar, true);
    document.removeEventListener("keydown", tecla);
    document.removeEventListener("focusin", contener);
  };
}

export function useDialogo(ref: RefObject<HTMLDialogElement | null>, indice: number, objetivo: string, cerrar: () => void) {
  const tocado = useRef(false);
  const cerrarActual = useRef(cerrar);
  useLayoutEffect(() => { cerrarActual.current = cerrar; });
  useLayoutEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    return abrirDialogo(dialogo, tocado);
  }, [ref]);
  useLayoutEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>(SIGUE)?.focus({ preventScroll: true });
  }, [ref, indice]);
  useLayoutEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    return escucharCierre(dialogo, objetivo, tocado, cerrarActual);
  }, [ref, objetivo]);
}
