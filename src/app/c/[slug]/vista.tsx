"use client";

import { useCallback, useState } from "react";
import { CotizacionNoDisponible, PantallaPublica } from "@/components/pantallas/publica";
import { catalogoSoloCroquis } from "@/lib/cotizaciones/catalogo";
import type { VistaPublica as Datos } from "@/lib/server/supabase/publica";
import { aceptarCotizacion, registrarApertura } from "./acciones";

const CATALOGO = catalogoSoloCroquis();

export function VistaPublica({ slug, vista }: { slug: string; vista: Datos | null }) {
  const [cotizacion, setCotizacion] = useState(vista?.cotizacion);
  const [error, setError] = useState("");
  const [aceptando, setAceptando] = useState(false);
  const alAbrir = useCallback(() => void registrarApertura(slug).catch(() => {}), [slug]);

  if (!vista) return <CotizacionNoDisponible />;

  const aceptar = async () => {
    if (aceptando) return;
    setError(""); setAceptando(true);
    try {
      await aceptarCotizacion(slug);
      setCotizacion((c) => c && { ...c, estado: "aceptada" });
    } catch {
      setError("No pudimos confirmar la aceptación. Puede haber vencido; intenta otra vez o escríbele al taller.");
    } finally { setAceptando(false); }
  };
  return <PantallaPublica cotizacion={cotizacion} taller={vista.taller} catalogo={CATALOGO} pdfHref={`/c/${slug}/pdf`} onAbierta={alAbrir} onAceptar={aceptar} aceptando={aceptando} errorAceptacion={error} />;
}
