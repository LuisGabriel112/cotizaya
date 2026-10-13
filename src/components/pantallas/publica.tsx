"use client";

import { useEffect, useRef } from "react";
import { HojaCotizacion } from "@/components/hoja-cotizacion";
import { Icono } from "@/components/icono";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton, clasesBoton } from "@/components/ui/boton";
import type { Catalogo } from "@/lib/cotizaciones/catalogo";
import { resumir } from "@/lib/cotizaciones/resumen";
import type { Cotizacion, Taller } from "@/lib/cotizaciones/tipos";
import { normalizarTelefono } from "@/lib/telefono";

interface Props {
  cotizacion?: Cotizacion;
  taller: Taller;
  catalogo: Catalogo;
  /** Prototipo: avisa que son datos de prueba. */
  demo?: boolean;
  pdfHref?: string;
  onAbierta: () => void;
  onAceptar: () => void;
}

// Lo que ve el cliente al abrir el enlace. Solo esta cotización; nada más del taller.
export function PantallaPublica({ cotizacion: c, taller, catalogo, demo = false, pdfHref, onAbierta, onAceptar }: Props) {
  const registrada = useRef(false);

  // Evento "abierta": una vez por visita.
  useEffect(() => {
    if (!c || registrada.current) return;
    registrada.current = true;
    onAbierta();
  }, [c, onAbierta]);

  if (!c) return <CotizacionNoDisponible />;
  const aceptada = c.estado === "aceptada";

  return (
    <main className="mx-auto max-w-md px-4 pt-4 pb-32">
      <h1 className="sr-only">Cotización de {taller.nombre}</h1>
      {demo && <p className="mb-3 text-base text-tinta-2">Cotización de ejemplo, hecha con datos de prueba.</p>}

      <HojaCotizacion cotizacion={c} resumen={resumir(c, catalogo)} taller={taller} catalogo={catalogo} />
      {/* <a> y no Link: Link precargaría la ruta y generaría el PDF sin que nadie lo pida. */}
      {pdfHref && <a href={pdfHref} download className={clasesBoton("secundario", "mt-5 w-full no-underline")}>Descargar PDF</a>}

      {aceptada && (
        <p role="status" className="mt-5 border-2 border-verde bg-papel-2 px-4 py-3 text-lg">
          <span className="titulo text-xl">Aceptada.</span> {taller.nombre} ya sabe que la aceptaste.
        </p>
      )}

      <BarraAccion>{aceptada ? <EscribirAlTaller telefono={taller.telefono} /> : <Boton onClick={onAceptar}>Aceptar cotización</Boton>}</BarraAccion>
    </main>
  );
}

function EscribirAlTaller({ telefono }: { telefono: string }) {
  const numero = normalizarTelefono(telefono) ?? "";
  return (
    <a href={`https://wa.me/${numero}`} target="_blank" rel="noreferrer" className={clasesBoton("secundario", "no-underline")}>
      <Icono nombre="whatsapp" />
      Escribirle al taller
    </a>
  );
}

export function CotizacionNoDisponible() {
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="titulo text-3xl">Esta cotización ya no está disponible</h1>
      <p className="mt-2">Pídele al taller que te la vuelva a mandar.</p>
    </main>
  );
}
