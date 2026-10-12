"use client";

import { createContext, use, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { crearCatalogo } from "@/lib/cotizaciones/catalogo";
import { reducir, type Accion, type EstadoLista } from "@/lib/cotizaciones/estado";
import { ProveedorFuente, type Fuente } from "@/lib/cotizaciones/fuente";
import { crearRutas } from "@/lib/cotizaciones/rutas";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import { CATALOGO } from "./catalogo";
import { nuevaCotizacionDemo } from "./nueva";
import { PLANTILLAS } from "./plantillas";
import { COTIZACIONES_SEMILLA, TALLER } from "./semilla";

// Prototipo para video y videollamadas: todo vive en localStorage del navegador.

const CLAVE = "cotizaya-demo-v1";
export const CATALOGO_DEMO = crearCatalogo(CATALOGO, PLANTILLAS);
const RUTAS_DEMO = crearRutas("/demo");

/** Lo que solo usa la vista pública del prototipo; la real habla con el servidor. */
export interface DemoPublica {
  listo: boolean;
  porSlug: (slug: string) => Cotizacion | undefined;
  marcarAbierta: (slug: string) => void;
  aceptar: (slug: string) => void;
}

const ContextoPublica = createContext<DemoPublica | null>(null);

function sufijo() {
  return Math.random().toString(36).slice(2, 6);
}

function leerGuardadas(): Cotizacion[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Cotizacion[]) : COTIZACIONES_SEMILLA;
  } catch {
    // Almacenamiento bloqueado o dañado: se sigue con la semilla.
    return COTIZACIONES_SEMILLA;
  }
}

function usePersistencia(estado: EstadoLista, despachar: Dispatch<Accion>) {
  useEffect(() => {
    despachar({ tipo: "cargar", cotizaciones: leerGuardadas() });
    // Otra pestaña (la vista pública) cambió el estado.
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE && e.newValue) despachar({ tipo: "cargar", cotizaciones: JSON.parse(e.newValue) as Cotizacion[] });
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [despachar]);

  useEffect(() => {
    if (!estado.listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado.cotizaciones));
    } catch {
      // Sin espacio o sin permiso: el prototipo sigue en memoria.
    }
  }, [estado]);
}

function armarFuente(estado: EstadoLista, despachar: Dispatch<Accion>): Fuente {
  return {
    ...estado,
    taller: TALLER,
    catalogo: CATALOGO_DEMO,
    rutas: RUTAS_DEMO,
    reiniciarDemo: () => despachar({ tipo: "cargar", cotizaciones: COTIZACIONES_SEMILLA }),
    acciones: {
      crear: async () => {
        const cotizacion = nuevaCotizacionDemo(estado.cotizaciones, sufijo(), new Date().toISOString());
        despachar({ tipo: "crear", cotizacion });
        return cotizacion.id;
      },
      guardarPartida: (id, partida) => despachar({ tipo: "guardarPartida", id, partida }),
      quitarPartida: (id, partidaId) => despachar({ tipo: "quitarPartida", id, partidaId }),
      editar: (id, cambios) => despachar({ tipo: "editar", id, cambios }),
      marcarEnviada: (id) => despachar({ tipo: "enviada", id }),
      avisoVisto: (id) => despachar({ tipo: "avisoVisto", id }),
    },
  };
}

function armarPublica(estado: EstadoLista, despachar: Dispatch<Accion>): DemoPublica {
  return {
    listo: estado.listo,
    porSlug: (slug) => estado.cotizaciones.find((c) => c.slug === slug),
    marcarAbierta: (slug) => despachar({ tipo: "abierta", slug, en: new Date().toISOString() }),
    aceptar: (slug) => despachar({ tipo: "aceptada", slug }),
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducir, { listo: false, cotizaciones: COTIZACIONES_SEMILLA });
  usePersistencia(estado, despachar);
  const fuente = useMemo(() => armarFuente(estado, despachar), [estado]);
  const publica = useMemo(() => armarPublica(estado, despachar), [estado]);
  return (
    <ProveedorFuente fuente={fuente}>
      <ContextoPublica value={publica}>{children}</ContextoPublica>
    </ProveedorFuente>
  );
}

export function useDemoPublica(): DemoPublica {
  const publica = use(ContextoPublica);
  if (!publica) throw new Error("useDemoPublica fuera de DemoProvider");
  return publica;
}
