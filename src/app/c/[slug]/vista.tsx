"use client";

import { useCallback, useState } from "react";
import { CotizacionNoDisponible, PantallaPublica } from "@/components/pantallas/publica";
import { catalogoSoloCroquis } from "@/lib/cotizaciones/catalogo";
import type { VistaPublica as Datos } from "@/lib/server/supabase/publica";
import { aceptarCotizacion, registrarApertura } from "./acciones";

const CATALOGO = catalogoSoloCroquis();

export function VistaPublica({ slug, vista }: { slug: string; vista: Datos | null }) {
  const [cotizacion, setCotizacion] = useState(vista?.cotizacion);
  const alAbrir = useCallback(() => void registrarApertura(slug).catch(() => {}), [slug]);

  if (!vista) return <CotizacionNoDisponible />;

  const aceptar = () => {
    setCotizacion((c) => c && { ...c, estado: "aceptada" });
    // Si falla, vuelve a mostrar el botón para que el cliente lo intente otra vez.
    aceptarCotizacion(slug).catch(() => setCotizacion(vista.cotizacion));
  };
  return <PantallaPublica cotizacion={cotizacion} taller={vista.taller} catalogo={CATALOGO} pdfHref={`/c/${slug}/pdf`} onAbierta={alAbrir} onAceptar={aceptar} />;
}
