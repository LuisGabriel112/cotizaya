"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDemo } from "@/lib/demo/store";

// Entrada directa: crea la cotización y abre la captura.
export default function NuevaCotizacion() {
  const demo = useDemo();
  const router = useRouter();
  const creada = useRef(false);

  useEffect(() => {
    if (!demo.listo || creada.current) return;
    creada.current = true;
    const c = demo.crear();
    router.replace(`/cotizaciones/${c.id}/editar`);
  }, [demo, router]);

  return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
}
