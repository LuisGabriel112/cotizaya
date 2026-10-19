import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { Paso } from "@/lib/guia/pasos";
import { agrandar, colocar, desplazamiento, recorte, type Colocacion, type Rect } from "@/lib/guia/recorrido";
import { buscarObjetivo } from "./use-vistas";

interface Medida { hueco: Rect; tapas: Rect[]; colocacion: Colocacion }
const INICIAL: Medida = {
  ...recorte({ top: 0, left: 0, width: 0, height: 0 }, { width: 0, height: 0 }, 0),
  colocacion: { lado: "abajo", bottom: 16 },
};
const MARGEN_HUECO = 8;
const MARGEN_HOJA = 16;
// Lo que mueve la página a mano: desde ahí la guía deja de acomodarla.
const GESTOS = ["pointerdown", "wheel", "keydown"] as const;

const altoDe = (hoja: HTMLElement | null) => hoja?.getBoundingClientRect().height || 260;
const pantallaActual = () => ({ width: window.innerWidth, height: window.innerHeight });

function medir(elemento: HTMLElement, hoja: HTMLElement | null): Medida {
  const pantalla = pantallaActual();
  const corte = recorte(elemento.getBoundingClientRect(), pantalla, MARGEN_HUECO);
  return { ...corte, colocacion: colocar(corte.hueco, pantalla, altoDe(hoja), MARGEN_HOJA) };
}

/** Sube o baja el elemento de una vez si con la hoja no cabe. Se mide sin recortar a la pantalla. */
function acomodar(elemento: HTMLElement, hoja: HTMLElement | null) {
  const hueco = agrandar(elemento.getBoundingClientRect(), MARGEN_HUECO);
  const distancia = desplazamiento(hueco, pantallaActual(), altoDe(hoja), MARGEN_HOJA);
  if (distancia !== 0) window.scrollBy(0, distancia);
}

const igual = (a: Medida, b: Medida) => JSON.stringify(a) === JSON.stringify(b);

/** Solo se pinta si algo cambió. Desde un cuadro de animación se pinta en ese mismo cuadro. */
function usePintor(setMedida: (m: Medida) => void) {
  const anterior = useRef(INICIAL);
  return (nueva: Medida, enCuadro: boolean) => {
    if (igual(anterior.current, nueva)) return;
    anterior.current = nueva;
    if (enCuadro) flushSync(() => setMedida(nueva));
    else setMedida(nueva);
  };
}

function escuchar(eventos: readonly string[], manejador: () => void, opciones: AddEventListenerOptions) {
  for (const evento of eventos) window.addEventListener(evento, manejador, opciones);
  return () => { for (const evento of eventos) window.removeEventListener(evento, manejador, opciones); };
}

type Pintar = (m: Medida, enCuadro: boolean) => void;

function medirAlAbrir(elemento: HTMLElement | null, hoja: RefObject<HTMLElement | null>, pintar: Pintar) {
  if (!elemento) return;
  elemento.scrollIntoView({ block: "center" });
  acomodar(elemento, hoja.current);
  pintar(medir(elemento, hoja.current), false);
}

/** Mide en cada scroll (un cuadro a la vez) y acomoda al detenerse o al girar, mientras no se haya movido a mano. */
function vigilar(objetivo: () => HTMLElement | null, hoja: RefObject<HTMLElement | null>, pintar: Pintar) {
  let cuadro = 0;
  let movidaAMano = false;
  const actualizar = () => {
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(() => { const el = objetivo(); if (el) pintar(medir(el, hoja.current), true); });
  };
  const alDetenerse = () => { const el = objetivo(); if (el && !movidaAMano) acomodar(el, hoja.current); actualizar(); };
  const quitar = [
    escuchar(["scroll"], actualizar, { passive: true, capture: true }),
    escuchar(["scrollend"], alDetenerse, { passive: true }),
    escuchar(["resize"], () => { movidaAMano = false; alDetenerse(); }, { passive: true }),
    escuchar(GESTOS, () => { movidaAMano = true; }, { passive: true, capture: true }),
  ];
  return () => { cancelAnimationFrame(cuadro); quitar.forEach((q) => q()); };
}

export function useMedida(paso: Paso) {
  const refHoja = useRef<HTMLElement>(null);
  const [medida, setMedida] = useState(INICIAL);
  const pintar = usePintor(setMedida);
  useLayoutEffect(() => {
    // El objetivo se busca en cada medición: la lista puede volver a montarlo.
    const objetivo = () => buscarObjetivo(paso.objetivo);
    medirAlAbrir(objetivo(), refHoja, pintar);
    return vigilar(objetivo, refHoja, pintar);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pintar solo escribe en un ref y en el estado
  }, [paso]);
  return { medida, refHoja };
}
