"use client";

import { useFuente } from "@/lib/cotizaciones/fuente";
import { planVigente } from "@/lib/plan/cupo";

const fechaPlan = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function mostrarFechaPlan(fecha: string): string {
  return fechaPlan.format(new Date(`${fecha}T12:00:00Z`));
}

export function EstadoPlan() {
  const { taller } = useFuente();
  if (planVigente(taller, new Date())) {
    return <p data-guia="estado-plan" className="mt-5 border-y-2 border-tinta py-3 text-lg">Plan fundador{taller.planHasta && ` hasta el ${mostrarFechaPlan(taller.planHasta)}`}</p>;
  }
  return <p data-guia="estado-plan" className="mt-5 border-y-2 border-tinta py-3 text-lg">Plan gratis: 5 cotizaciones al mes</p>;
}
