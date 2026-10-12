"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { PantallaPublica } from "@/components/pantallas/publica";
import { TALLER } from "@/lib/demo/semilla";
import { CATALOGO_DEMO, useDemoPublica } from "@/lib/demo/store";

export default function PublicaDemo() {
  const { slug } = useParams<{ slug: string }>();
  const { listo, porSlug, marcarAbierta, aceptar } = useDemoPublica();
  const alAbrir = useCallback(() => marcarAbierta(slug), [marcarAbierta, slug]);

  if (!listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  return (
    <PantallaPublica cotizacion={porSlug(slug)} taller={TALLER} catalogo={CATALOGO_DEMO} demo onAbierta={alAbrir} onAceptar={() => aceptar(slug)} />
  );
}
