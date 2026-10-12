"use client";

import { createContext, use, type ReactNode } from "react";
import type { Catalogo } from "./catalogo";
import type { CambiosCotizacion } from "./estado";
import type { Rutas } from "./rutas";
import type { Cotizacion, PartidaGuardada, Taller } from "./tipos";

// Lo que las pantallas necesitan, venga del prototipo (localStorage) o de Supabase.

export interface AccionesCotizaciones {
  /** Crea una cotización en borrador y regresa su id. */
  crear: () => Promise<string>;
  guardarPartida: (id: string, partida: PartidaGuardada) => void;
  quitarPartida: (id: string, partidaId: string) => void;
  editar: (id: string, cambios: CambiosCotizacion) => void;
  marcarEnviada: (id: string) => void;
  avisoVisto: (id: string) => void;
}

export interface Fuente {
  listo: boolean;
  cotizaciones: Cotizacion[];
  acciones: AccionesCotizaciones;
  taller: Taller;
  catalogo: Catalogo;
  rutas: Rutas;
  /** Solo en /demo: vuelve a los datos de ejemplo. */
  reiniciarDemo?: () => void;
}

const Contexto = createContext<Fuente | null>(null);

export function ProveedorFuente({ fuente, children }: { fuente: Fuente; children: ReactNode }) {
  return <Contexto value={fuente}>{children}</Contexto>;
}

export function useFuente(): Fuente {
  const fuente = use(Contexto);
  if (!fuente) throw new Error("useFuente fuera de ProveedorFuente");
  return fuente;
}

export function useCotizacion(id: string): Cotizacion | undefined {
  return useFuente().cotizaciones.find((c) => c.id === id);
}
