"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { crearAgrupador } from "@/lib/cotizaciones/agrupador";
import { crearCatalogo } from "@/lib/cotizaciones/catalogo";
import { reducir, type Accion } from "@/lib/cotizaciones/estado";
import { ProveedorFuente, type AccionesCotizaciones } from "@/lib/cotizaciones/fuente";
import { crearAccionesOptimistas } from "@/lib/cotizaciones/optimista";
import { crearRutas } from "@/lib/cotizaciones/rutas";
import type { DatosApp } from "@/lib/server/supabase/datos-app";
import * as servidor from "./acciones";

const RUTAS = crearRutas("");
const ESPERA_EDICION_MS = 400;

/** Responde al instante con el mismo reductor del prototipo y confirma con el servidor detrás. */
function useAcciones(despachar: Dispatch<Accion>, alFallar: () => void): AccionesCotizaciones {
  const agrupador = useMemo(() => crearAgrupador(ESPERA_EDICION_MS, (id, cambios) => servidor.editarCotizacion(id, cambios).catch(alFallar)), [alFallar]);

  // Al salir de la pestaña se manda lo que quedó pendiente.
  useEffect(() => {
    const vaciar = () => agrupador.vaciar();
    window.addEventListener("pagehide", vaciar);
    return () => window.removeEventListener("pagehide", vaciar);
  }, [agrupador]);

  return useMemo(() => crearAccionesOptimistas({ despachar, servidor, agrupador, alFallar }), [despachar, alFallar, agrupador]);
}

export function ProveedorSupabase({ datos, children }: { datos: DatosApp; children: ReactNode }) {
  const router = useRouter();
  const [estado, despachar] = useReducer(reducir, { listo: true, cotizaciones: datos.cotizaciones });
  const [fallo, setFallo] = useState(false);

  // Tras router.refresh() llegan datos frescos del servidor: mandan sobre lo local.
  useEffect(() => despachar({ tipo: "cargar", cotizaciones: datos.cotizaciones }), [datos.cotizaciones]);

  const alFallar = useCallback(() => {
    setFallo(true);
    router.refresh();
  }, [router]);
  const acciones = useAcciones(despachar, alFallar);
  const catalogo = useMemo(() => crearCatalogo(datos.materiales, datos.plantillas), [datos.materiales, datos.plantillas]);
  const fuente = useMemo(() => ({ ...estado, acciones, catalogo, taller: datos.taller, rutas: RUTAS }), [estado, acciones, catalogo, datos.taller]);

  return (
    <ProveedorFuente fuente={fuente}>
      {fallo && <AvisoSinSenal onCerrar={() => setFallo(false)} />}
      {children}
    </ProveedorFuente>
  );
}

function AvisoSinSenal({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div role="alert" className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b-2 border-rojo bg-papel px-4 py-3 text-lg">
      <span>No se guardó el último cambio. Revisa la señal y vuelve a intentarlo.</span>
      <button type="button" onClick={onCerrar} className="min-h-14 shrink-0 px-2 underline">
        Entendido
      </button>
    </div>
  );
}
