"use client";

import { createContext, use, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { COTIZACIONES_SEMILLA } from "./semilla";
import type { Cotizacion, PartidaGuardada } from "./tipos";

const CLAVE = "cotizaya-demo-v1";

type Accion =
  | { tipo: "cargar"; cotizaciones: Cotizacion[] }
  | { tipo: "crear"; cotizacion: Cotizacion }
  | { tipo: "guardarPartida"; id: string; partida: PartidaGuardada }
  | { tipo: "quitarPartida"; id: string; partidaId: string }
  | { tipo: "editar"; id: string; cambios: Partial<Pick<Cotizacion, "cliente" | "descuentoPct" | "conIva" | "acabado" | "garantiaSalitre">> }
  | { tipo: "enviada"; id: string }
  | { tipo: "abierta"; slug: string; en: string }
  | { tipo: "avisoVisto"; id: string }
  | { tipo: "aceptada"; slug: string }
  | { tipo: "reiniciar" };

interface Estado {
  listo: boolean;
  cotizaciones: Cotizacion[];
}

function cambiar(lista: Cotizacion[], id: string, f: (c: Cotizacion) => Cotizacion) {
  return lista.map((c) => (c.id === id ? f(c) : c));
}

function reducir(estado: Estado, a: Accion): Estado {
  const lista = estado.cotizaciones;
  switch (a.tipo) {
    case "cargar":
      return { listo: true, cotizaciones: a.cotizaciones };
    case "crear":
      return { ...estado, cotizaciones: [a.cotizacion, ...lista] };
    case "guardarPartida":
      return {
        ...estado,
        cotizaciones: cambiar(lista, a.id, (c) => {
          const existe = c.partidas.some((p) => p.id === a.partida.id);
          const partidas = existe ? c.partidas.map((p) => (p.id === a.partida.id ? a.partida : p)) : [...c.partidas, a.partida];
          return { ...c, partidas };
        }),
      };
    case "quitarPartida":
      return { ...estado, cotizaciones: cambiar(lista, a.id, (c) => ({ ...c, partidas: c.partidas.filter((p) => p.id !== a.partidaId) })) };
    case "editar":
      return { ...estado, cotizaciones: cambiar(lista, a.id, (c) => ({ ...c, ...a.cambios })) };
    case "enviada":
      return { ...estado, cotizaciones: cambiar(lista, a.id, (c) => (c.estado === "borrador" ? { ...c, estado: "enviada" } : c)) };
    case "abierta":
      return {
        ...estado,
        cotizaciones: lista.map((c) =>
          c.slug === a.slug
            ? { ...c, vistaEn: a.en, avisoPendiente: true, estado: c.estado === "enviada" || c.estado === "borrador" ? "vista" : c.estado }
            : c,
        ),
      };
    case "avisoVisto":
      return { ...estado, cotizaciones: cambiar(lista, a.id, (c) => ({ ...c, avisoPendiente: false })) };
    case "aceptada":
      return { ...estado, cotizaciones: lista.map((c) => (c.slug === a.slug ? { ...c, estado: "aceptada", avisoPendiente: true } : c)) };
    case "reiniciar":
      return { listo: true, cotizaciones: COTIZACIONES_SEMILLA };
  }
}

interface Api {
  listo: boolean;
  cotizaciones: Cotizacion[];
  porId: (id: string) => Cotizacion | undefined;
  porSlug: (slug: string) => Cotizacion | undefined;
  crear: () => Cotizacion;
  guardarPartida: (id: string, partida: PartidaGuardada) => void;
  quitarPartida: (id: string, partidaId: string) => void;
  editar: (id: string, cambios: Extract<Accion, { tipo: "editar" }>["cambios"]) => void;
  marcarEnviada: (id: string) => void;
  marcarAbierta: (slug: string) => void;
  avisoVisto: (id: string) => void;
  aceptar: (slug: string) => void;
  reiniciar: () => void;
}

const Contexto = createContext<Api | null>(null);

function nuevoId() {
  return Math.random().toString(36).slice(2, 8);
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducir, { listo: false, cotizaciones: COTIZACIONES_SEMILLA });

  useEffect(() => {
    let guardadas: Cotizacion[] = COTIZACIONES_SEMILLA;
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (crudo) guardadas = JSON.parse(crudo) as Cotizacion[];
    } catch {
      // Almacenamiento bloqueado o dañado: se sigue con la semilla.
    }
    despachar({ tipo: "cargar", cotizaciones: guardadas });

    // Otra pestaña (la vista pública) cambió el estado.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE && e.newValue) despachar({ tipo: "cargar", cotizaciones: JSON.parse(e.newValue) as Cotizacion[] });
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  useEffect(() => {
    if (!estado.listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado.cotizaciones));
    } catch {
      // Sin espacio o sin permiso: el prototipo sigue en memoria.
    }
  }, [estado]);

  const api = useMemo<Api>(() => {
    const { cotizaciones } = estado;
    return {
      listo: estado.listo,
      cotizaciones,
      porId: (id) => cotizaciones.find((c) => c.id === id),
      porSlug: (slug) => cotizaciones.find((c) => c.slug === slug),
      crear: () => {
        const folio = Math.max(0, ...cotizaciones.map((c) => c.folio)) + 1;
        const id = `c${folio}-${nuevoId()}`;
        const cotizacion: Cotizacion = {
          id,
          folio,
          slug: `faro-${String(folio).padStart(4, "0")}-${nuevoId()}`,
          cliente: "",
          partidas: [],
          descuentoPct: 0,
          conIva: false,
          acabado: "natural",
          garantiaSalitre: true,
          estado: "borrador",
          creadaEn: new Date().toISOString(),
        };
        despachar({ tipo: "crear", cotizacion });
        return cotizacion;
      },
      guardarPartida: (id, partida) => despachar({ tipo: "guardarPartida", id, partida }),
      quitarPartida: (id, partidaId) => despachar({ tipo: "quitarPartida", id, partidaId }),
      editar: (id, cambios) => despachar({ tipo: "editar", id, cambios }),
      marcarEnviada: (id) => despachar({ tipo: "enviada", id }),
      marcarAbierta: (slug) => despachar({ tipo: "abierta", slug, en: new Date().toISOString() }),
      avisoVisto: (id) => despachar({ tipo: "avisoVisto", id }),
      aceptar: (slug) => despachar({ tipo: "aceptada", slug }),
      reiniciar: () => despachar({ tipo: "reiniciar" }),
    };
  }, [estado]);

  return <Contexto value={api}>{children}</Contexto>;
}

export function useDemo(): Api {
  const api = use(Contexto);
  if (!api) throw new Error("useDemo fuera de DemoProvider");
  return api;
}


export { nuevoId };
