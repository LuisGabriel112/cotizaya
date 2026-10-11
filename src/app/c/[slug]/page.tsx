"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { HojaCotizacion } from "@/components/hoja-cotizacion";
import { Icono } from "@/components/icono";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton, clasesBoton } from "@/components/ui/boton";
import { resumir } from "@/lib/demo/derivados";
import { TALLER } from "@/lib/demo/semilla";
import { useDemo } from "@/lib/demo/store";

// Lo que ve el cliente al abrir el enlace. Solo esta cotización; nada más del taller.
export default function VistaPublica() {
  const { slug } = useParams<{ slug: string }>();
  const demo = useDemo();
  const c = demo.porSlug(slug);
  const registrada = useRef(false);
  const { marcarAbierta } = demo;

  // Evento "abierta": una vez por visita.
  useEffect(() => {
    if (!demo.listo || !c || registrada.current) return;
    registrada.current = true;
    marcarAbierta(c.slug);
  }, [demo.listo, c, marcarAbierta]);

  if (!demo.listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  if (!c) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <h1 className="titulo text-3xl">Esta cotización ya no está disponible</h1>
        <p className="mt-2">Pídele al taller que te la vuelva a mandar.</p>
      </main>
    );
  }

  const aceptada = c.estado === "aceptada";
  const telefono = `52${TALLER.telefono.replace(/\D/g, "")}`;

  return (
    <main className="mx-auto max-w-md px-4 pt-4 pb-32">
      <h1 className="sr-only">Cotización de {TALLER.nombre}</h1>
      <p className="mb-3 text-base text-tinta-2">Cotización de ejemplo, hecha con datos de prueba.</p>

      <HojaCotizacion cotizacion={c} resumen={resumir(c)} taller={TALLER} />

      {aceptada && (
        <p role="status" className="mt-5 border-2 border-verde bg-papel-2 px-4 py-3 text-lg">
          <span className="titulo text-xl">Aceptada.</span> {TALLER.nombre} ya sabe que la aceptaste.
        </p>
      )}

      <BarraAccion>
        {aceptada ? (
          <a href={`https://wa.me/${telefono}`} target="_blank" rel="noreferrer" className={clasesBoton("secundario", "no-underline")}>
            <Icono nombre="whatsapp" />
            Escribirle al taller
          </a>
        ) : (
          <Boton onClick={() => demo.aceptar(c.slug)}>Aceptar cotización</Boton>
        )}
      </BarraAccion>
    </main>
  );
}
