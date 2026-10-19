"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Encabezado } from "@/components/encabezado";
import { Guia } from "@/components/guia/guia";
import { HojaCotizacion } from "@/components/hoja-cotizacion";
import { Icono } from "@/components/icono";
import { BarraAccion } from "@/components/ui/barra-accion";
import { clasesBoton } from "@/components/ui/boton";
import { CintaEstado } from "@/components/ui/cinta-estado";
import { useCotizacion, useFuente } from "@/lib/cotizaciones/fuente";
import { resumir } from "@/lib/cotizaciones/resumen";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import { enlaceWhatsApp } from "@/lib/cotizaciones/whatsapp";
import { formatFecha, formatHora } from "@/lib/format";

const RESULTADO: Partial<Record<Cotizacion["estado"], string>> = { aceptada: "Aceptada", rechazada: "Rechazada", vista: "Tu cliente la abrió" };

export function PantallaVistaPrevia() {
  const { id } = useParams<{ id: string }>();
  const { listo, acciones } = useFuente();
  const c = useCotizacion(id);
  const { avisoVisto } = acciones;

  // Entrar a la cotización apaga el aviso de la lista.
  useEffect(() => {
    if (c?.avisoPendiente) avisoVisto(c.id);
  }, [c?.avisoPendiente, c?.id, avisoVisto]);

  if (!listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  if (!c) return <NoEncontrada />;
  return <VistaPrevia c={c} />;
}

function VistaPrevia({ c }: { c: Cotizacion }) {
  const { taller, catalogo, rutas } = useFuente();
  const resumen = resumir(c, catalogo);
  return <main className="mx-auto max-w-md px-4 pb-32">
      <Encabezado titulo="Así la recibe" atras={{ href: rutas.lista, texto: "Cotizaciones" }} derecha={<span data-guia="estado"><CintaEstado estado={c.estado} /></span>} />
      <ResultadoVistaPrevia c={c} />
      <AccionesVistaPrevia c={c} />
      <div className="mt-2">
        <HojaCotizacion cotizacion={c} resumen={resumen} taller={taller} catalogo={catalogo} />
      </div>
      <BarraAccion>
        <EnviarWhatsApp c={c} totalCentavos={resumen.totales.totalCentavos} />
      </BarraAccion>
      <Guia id="vista-previa" />
    </main>;
}

function ResultadoVistaPrevia({ c }: { c: Cotizacion }) {
  const resultado = RESULTADO[c.estado];
  if (!resultado || !c.vistaEn) return null;
  return <p className="titulo mt-3 text-lg">
    {resultado} · {formatFecha(c.vistaEn)}, {formatHora(c.vistaEn)}
  </p>;
}

function AccionesVistaPrevia({ c }: { c: Cotizacion }) {
  const { rutas } = useFuente();
  return <nav className="mt-3 flex flex-wrap gap-x-6" aria-label="Acciones de la cotización">
    <Link data-guia="corregir" href={rutas.editar(c.id)} className="inline-flex min-h-14 items-center font-semibold underline">Corregir</Link>
    <Link data-guia="enlace-cliente" href={rutas.publica(c.slug)} className="inline-flex min-h-14 items-center font-semibold underline">Ver el enlace del cliente</Link>
  </nav>;
}

function EnviarWhatsApp({ c, totalCentavos }: { c: Cotizacion; totalCentavos: number }) {
  const { taller, rutas, acciones } = useFuente();
  const rutaPublica = rutas.publica(c.slug);
  const enviar = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = `${window.location.origin}${rutaPublica}`;
    e.currentTarget.href = enlaceWhatsApp({ cliente: c.cliente, folio: c.folio, taller: taller.nombre, totalCentavos, url });
    acciones.marcarEnviada(c.id);
  };
  return (
    <a data-guia="whatsapp" href={rutaPublica} target="_blank" rel="noreferrer" onClick={enviar} className={clasesBoton("principal", "no-underline")}>
      <Icono nombre="whatsapp" />
      Enviar por WhatsApp
    </a>
  );
}

function NoEncontrada() {
  const { rutas } = useFuente();
  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="titulo text-3xl">No encontramos esta cotización</h1>
      <Link href={rutas.lista} className="mt-4 inline-flex min-h-14 items-center font-semibold">
        Ir a mis cotizaciones
      </Link>
    </main>
  );
}
