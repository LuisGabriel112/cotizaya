"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Encabezado } from "@/components/encabezado";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { CintaEstado } from "@/components/ui/cinta-estado";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { resumir } from "@/lib/demo/derivados";
import { TALLER } from "@/lib/demo/semilla";
import { useDemo } from "@/lib/demo/store";
import type { Cotizacion } from "@/lib/demo/tipos";
import { formatCentavos, formatFecha, formatFolio, formatHora } from "@/lib/format";

export default function ListaCotizaciones() {
  const demo = useDemo();
  const router = useRouter();

  const nueva = () => {
    const c = demo.crear();
    router.push(`/cotizaciones/${c.id}/editar`);
  };

  const ordenadas = [...demo.cotizaciones].sort((a, b) => b.folio - a.folio);

  return (
    <main className="mx-auto max-w-md px-4 pb-32">
      <Encabezado titulo="Cotizaciones" />
      <p className="mt-2 text-base text-tinta-2">
        {TALLER.nombre}. Taller de ejemplo con datos de prueba.
      </p>

      {demo.listo && ordenadas.length === 0 ? (
        <p className="mt-8 border-y-2 border-tinta py-6 text-lg">Aún no tienes cotizaciones. Haz la primera desde la obra.</p>
      ) : (
        <>
          <ReglaCinta className="mt-5" />
          <ul aria-busy={!demo.listo}>
          {ordenadas.map((c) => (
            <li key={c.id}>
              <Fila c={c} />
            </li>
          ))}
        </ul>
        </>
      )}

      {demo.listo && (
        <button type="button" onClick={demo.reiniciar} className="mt-8 min-h-14 text-base text-tinta-2 underline">
          Volver a los datos de ejemplo
        </button>
      )}

      <BarraAccion>
        <Boton onClick={nueva}>Nueva cotización</Boton>
      </BarraAccion>
    </main>
  );
}

function Fila({ c }: { c: Cotizacion }) {
  const { totales } = resumir(c);
  const href = c.estado === "borrador" ? `/cotizaciones/${c.id}/editar` : `/cotizaciones/${c.id}`;
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
