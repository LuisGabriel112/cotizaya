"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Encabezado } from "@/components/encabezado";
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
  return (
    <main className="mx-auto max-w-md px-4 pb-32">
      <CabeceraLista />
      <CotizacionesLista />
      <PieLista />
    </main>
  );
}

function CabeceraLista() {
  const { taller, cupo, rutas, reiniciarDemo } = useFuente();
  const aviso = avisoDeCupo(cupo);
  return <>
    <Encabezado titulo="Cotizaciones" />
    <p className="mt-2 text-base text-tinta-2">{taller.nombre}.{reiniciarDemo && " Taller de ejemplo con datos de prueba."}</p>
    {aviso && <p role="status" className={`mt-5 border-y-2 py-3 text-lg ${cupoAgotado(cupo) ? "border-rojo" : "border-tinta"}`}>
      {aviso} {rutas.plan && <Link href={rutas.plan} className="inline-flex min-h-14 items-center font-semibold underline">Pasar a fundador</Link>}
    </p>}
  </>;
}

function CotizacionesLista() {
  const { listo, cotizaciones } = useFuente();
  if (listo && cotizaciones.length === 0) {
    return <p className="mt-8 border-y-2 border-tinta py-6 text-lg">Aún no tienes cotizaciones. Haz la primera desde la obra.</p>;
  }
  const ordenadas = [...cotizaciones].sort((a, b) => b.folio - a.folio);
  return <>
    <ReglaCinta className="mt-5" />
    <ul aria-busy={!listo}>{ordenadas.map((c) => <li key={c.id}><Fila c={c} /></li>)}</ul>
  </>;
}

function PieLista() {
  const { listo, reiniciarDemo } = useFuente();
  return <>
    {listo && reiniciarDemo && <button type="button" onClick={reiniciarDemo} className="mt-8 min-h-14 text-base text-tinta-2 underline">Volver a los datos de ejemplo</button>}
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
    <Boton onClick={nueva} disabled={creando || cupoAgotado(cupo)}>
      Nueva cotización
    </Boton>
  );
}

function Fila({ c }: { c: Cotizacion }) {
  const { catalogo, rutas } = useFuente();
  const { totales } = resumir(c, catalogo);
  const href = c.estado === "borrador" ? rutas.editar(c.id) : rutas.ver(c.id);
  const aviso = c.avisoPendiente && (c.estado === "vista" || c.estado === "aceptada");

  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 border-b border-dashed border-aluminio px-2 py-3 no-underline ${aviso ? "bg-papel-2" : ""}`}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate">
          <span className="num mr-2 text-tinta-2">{formatFolio(c.folio)}</span>
          <span className="font-semibold">{c.cliente || "Sin nombre"}</span>
        </span>
        <CintaEstado estado={c.estado} />
      </span>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-base text-tinta-2">
          {formatFecha(c.creadaEn)} · {c.partidas.length} {c.partidas.length === 1 ? "partida" : "partidas"}
        </span>
        <span className="num text-right text-xl font-bold">{formatCentavos(totales.totalCentavos)}</span>
      </span>
      {aviso && c.vistaEn && (
        <span className="titulo text-lg">
          {c.estado === "aceptada" ? "Tu cliente la aceptó" : "Tu cliente la abrió"} · {formatFecha(c.vistaEn)}, {formatHora(c.vistaEn)}
        </span>
      )}
    </Link>
  );
}
