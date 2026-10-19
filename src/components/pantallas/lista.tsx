"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Encabezado } from "@/components/encabezado";
import { Guia, reiniciarGuias } from "@/components/guia/guia";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { CintaEstado } from "@/components/ui/cinta-estado";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { useFuente } from "@/lib/cotizaciones/fuente";
import { resumir } from "@/lib/cotizaciones/resumen";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import { avisoDeCupo, cupoAgotado } from "@/lib/plan/cupo";
import { formatCentavos, formatFecha, formatFolio, formatHora } from "@/lib/format";

export function PantallaLista() {
  const { listo } = useFuente();
  return (
    <main className="mx-auto max-w-md px-4 pb-32">
      <CabeceraLista />
      <CotizacionesLista />
      <PieLista />
      <Guia id="lista" listo={listo} />
    </main>
  );
}

function CabeceraLista() {
  const { taller, cupo, rutas, reiniciarDemo } = useFuente();
  const aviso = avisoDeCupo(cupo);
  return <>
    <Encabezado titulo="Cotizaciones" derecha={!reiniciarDemo && <Link data-guia="precios" href="/precios" className="inline-flex min-h-14 items-center px-2 font-semibold underline">Precios</Link>} />
    <p className="mt-2 text-base text-tinta-2">{taller.nombre}.{reiniciarDemo && " Taller de ejemplo con datos de prueba."}</p>
    <button type="button" onClick={reiniciarGuias} className="mt-1 min-h-14 text-left text-base font-semibold underline">Cómo se usa</button>
    {aviso && <p role="status" className={`mt-5 border-y-2 py-3 text-lg ${cupoAgotado(cupo) ? "border-rojo" : "border-tinta"}`}>
      {aviso} {rutas.plan && <Link href={rutas.plan} className="inline-flex min-h-14 items-center font-semibold underline">Pasar a fundador</Link>}
    </p>}
  </>;
}

function CotizacionesLista() {
  const { listo, cotizaciones, catalogo } = useFuente();
  if (listo && cotizaciones.length === 0) {
    return <p className="mt-8 border-y-2 border-tinta py-6 text-lg">Aún no tienes cotizaciones. Haz la primera desde la obra.</p>;
  }
  const ordenadas = [...cotizaciones].sort((a, b) => b.folio - a.folio)
    .map((c) => ({ c, total: resumir(c, catalogo).totales.totalCentavos }));
  const primeraConTotal = ordenadas.find(({ total }) => total > 0)?.c.id;
  return <>
    <ReglaCinta className="mt-5" />
    <ul aria-busy={!listo}>{ordenadas.map(({ c, total }) => <li key={c.id} data-guia={c.id === primeraConTotal ? "fila" : undefined}><Fila c={c} total={total} /></li>)}</ul>
  </>;
}

function PieLista() {
  const { listo, reiniciarDemo, rutas } = useFuente();
  return <>
    <div className="mt-8 flex flex-col items-start">
      {rutas.plan && <Link href={rutas.plan} data-guia="plan" className="inline-flex min-h-14 items-center font-semibold underline">Tu plan</Link>}
      {listo && reiniciarDemo && <button type="button" onClick={reiniciarDemo} className="min-h-14 text-base text-tinta-2 underline">Volver a los datos de ejemplo</button>}
    </div>
    <BarraAccion><BotonNueva /></BarraAccion>
  </>;
}

function BotonNueva() {
  const { acciones, rutas, cupo } = useFuente();
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const nueva = async () => {
    setCreando(true);
    try {
      router.push(rutas.editar(await acciones.crear()));
    } catch {
      setCreando(false);
    }
  };
  return (
    <Boton data-guia="nueva" onClick={nueva} disabled={creando || cupoAgotado(cupo)}>
      Nueva cotización
    </Boton>
  );
}

function Fila({ c, total }: { c: Cotizacion; total: number }) {
  const { rutas } = useFuente();
  const href = c.estado === "borrador" ? rutas.editar(c.id) : rutas.ver(c.id);
  const aviso = c.avisoPendiente && (c.estado === "vista" || c.estado === "aceptada");
  return <Link href={href} className={`flex flex-col gap-1 border-b border-dashed border-aluminio px-2 py-3 no-underline ${aviso ? "bg-papel-2" : ""}`}>
    <IdentidadCotizacion c={c} />
    <ImporteCotizacion c={c} total={total} />
    {aviso && <AvisoCotizacion c={c} />}
  </Link>;
}

function IdentidadCotizacion({ c }: { c: Cotizacion }) {
  return <span className="flex items-baseline justify-between gap-3">
    <span className="min-w-0 truncate">
      <span className="num mr-2 text-tinta-2">{formatFolio(c.folio)}</span>
      <span className="font-semibold">{c.cliente || "Sin nombre"}</span>
    </span>
    <CintaEstado estado={c.estado} />
  </span>;
}

function ImporteCotizacion({ c, total }: { c: Cotizacion; total: number }) {
  return <span className="flex items-baseline justify-between gap-3">
    <span className="text-base text-tinta-2">
      {formatFecha(c.creadaEn)} · {c.partidas.length} {c.partidas.length === 1 ? "partida" : "partidas"}
    </span>
    <span className="num text-right text-xl font-bold">{formatCentavos(total)}</span>
  </span>;
}

function AvisoCotizacion({ c }: { c: Cotizacion }) {
  if (!c.vistaEn) return null;
  return <span className="titulo text-lg">
    {c.estado === "aceptada" ? "Tu cliente la aceptó" : "Tu cliente la abrió"} · {formatFecha(c.vistaEn)}, {formatHora(c.vistaEn)}
  </span>;
}
