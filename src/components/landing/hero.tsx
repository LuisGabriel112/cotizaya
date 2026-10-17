"use client";

import { useEffect, useReducer, useRef } from "react";
import { estadoInicialHero, puedeAgregar, reducirHero, type AccionHero } from "./estado";
import { HeroVista } from "./hero-vistas";

/** Única isla de cliente de la landing: el resto se sirve desde el servidor. */
export function Hero() {
  const [estado, despachar] = useReducer(reducirHero, undefined, estadoInicialHero);
  const recienAgregada = useRef(false);

  // Al agregar, el botón deja de recibir toques y el navegador suelta el foco. Se devuelve ya pintada
  // la hoja (de ahí el efecto y no un rAF dentro del manejador): a la siguiente medida, o al cierre.
  useEffect(() => {
    if (!recienAgregada.current) return;
    recienAgregada.current = false;
    (document.getElementById("hero-ancho") ?? document.getElementById("hero-cierre"))?.focus();
  }, [estado]);

  const manejar = (accion: AccionHero) => {
    if (accion.tipo === "agregar" && puedeAgregar(estado)) recienAgregada.current = true;
    despachar(accion);
  };
  return <HeroVista estado={estado} despachar={manejar} />;
}
