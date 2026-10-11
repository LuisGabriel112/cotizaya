"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Encabezado } from "@/components/encabezado";
import { HojaCotizacion } from "@/components/hoja-cotizacion";
import { Icono } from "@/components/icono";
import { BarraAccion } from "@/components/ui/barra-accion";
import { clasesBoton } from "@/components/ui/boton";
import { CintaEstado } from "@/components/ui/cinta-estado";
import { resumir } from "@/lib/demo/derivados";
import { TALLER } from "@/lib/demo/semilla";
import { useDemo } from "@/lib/demo/store";
import { enlaceWhatsApp } from "@/lib/demo/whatsapp";
import { formatFecha, formatHora } from "@/lib/format";

export default function VistaPrevia() {
  const { id } = useParams<{ id: string }>();
  const demo = useDemo();
  const c = demo.porId(id);
  const { avisoVisto } = demo;

  // Entrar a la cotización apaga el aviso de la lista.
  useEffect(() => {
    if (c?.avisoPendiente) avisoVisto(c.id);
  }, [c?.avisoPendiente, c?.id, avisoVisto]);

  if (!demo.listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  if (!c) {
    return (
      <main className="mx-auto max-w-md px-4 pt-6">
        <h1 className="titulo text-3xl">No encontramos esta cotización</h1>
        <Link href="/cotizaciones" className="mt-4 inline-flex min-h-14 items-center font-semibold">
          Ir a mis cotizaciones
        </Link>
      </main>
    );
  }

  const resumen = resumir(c);
  const rutaPublica = `/c/${c.slug}`;

  const enviar = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = enlaceWhatsApp({
      cliente: c.cliente,
      folio: c.folio,
      taller: TALLER.nombre,
      totalCentavos: resumen.totales.totalCentavos,
      url: `${window.location.origin}${rutaPublica}`,
    });
    demo.marcarEnviada(c.id);
  };

  return (
    <main className="mx-auto max-w-md px-4 pb-32">
      <Encabezado titulo="Así la recibe" atras={{ href: "/cotizaciones", texto: "Cotizaciones" }} derecha={<CintaEstado estado={c.estado} />} />

      {c.vistaEn && (c.estado === "vista" || c.estado === "aceptada" || c.estado === "rechazada") && (
        <p className="titulo mt-3 text-lg">
          {c.estado === "aceptada" ? "Aceptada" : c.estado === "rechazada" ? "Rechazada" : "Tu cliente la abrió"} · {formatFecha(c.vistaEn)}, {formatHora(c.vistaEn)}
        </p>
      )}

      <nav className="mt-3 flex flex-wrap gap-x-6" aria-label="Acciones de la cotización">
        <Link href={`/cotizaciones/${c.id}/editar`} className="inline-flex min-h-14 items-center font-semibold underline">
          Corregir
        </Link>
        <Link href={rutaPublica} className="inline-flex min-h-14 items-center font-semibold underline">
          Ver el enlace del cliente
        </Link>
      </nav>

      <div className="mt-2">
        <HojaCotizacion cotizacion={c} resumen={resumen} taller={TALLER} />
      </div>

      <BarraAccion>
        <a href={rutaPublica} target="_blank" rel="noreferrer" onClick={enviar} className={clasesBoton("principal", "no-underline")}>
          <Icono nombre="whatsapp" />
          Enviar por WhatsApp
        </a>
      </BarraAccion>
    </main>
  );
}
