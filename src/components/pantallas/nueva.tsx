"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFuente } from "@/lib/cotizaciones/fuente";
import { cupoAgotado } from "@/lib/plan/cupo";

// Entrada directa: crea la cotización y abre la captura.
export function PantallaNueva() {
  const { listo, acciones, rutas, cupo } = useFuente();
  const router = useRouter();
  const creada = useRef(false);

  useEffect(() => {
    if (!listo || creada.current) return;
    creada.current = true;
    if (cupoAgotado(cupo)) {
      router.replace(rutas.lista);
      return;
    }
    acciones
      .crear()
      .then((id) => router.replace(rutas.editar(id)))
      .catch(() => router.replace(rutas.lista));
  }, [listo, acciones, rutas, router, cupo]);

  return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
}
