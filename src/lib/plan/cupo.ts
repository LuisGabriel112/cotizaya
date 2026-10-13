import type { Taller } from "@/lib/cotizaciones/tipos";

export const LIMITE_GRATIS = 5;

export type Cupo = { tipo: "ilimitado" } | { tipo: "limitado"; usadas: number; restantes: number; renuevaEl: string };

type PlanTaller = Pick<Taller, "plan" | "planHasta">;
type CotizacionFechada = { creadaEn: string };

function fechaEnMexico(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function primerDiaSiguienteMes(fecha: string): string {
  const [anio, mes] = fecha.split("-").map(Number);
  const siguiente = new Date(Date.UTC(anio!, mes!, 1));
  return `${siguiente.getUTCFullYear()}-${String(siguiente.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function planVigente(taller: PlanTaller, hoy: Date): boolean {
  return taller.plan === "fundador" && (!taller.planHasta || taller.planHasta >= fechaEnMexico(hoy));
}

export function calcularCupo(taller: PlanTaller, cotizaciones: readonly CotizacionFechada[], hoy: Date): Cupo {
  if (planVigente(taller, hoy)) return { tipo: "ilimitado" };
  const fecha = fechaEnMexico(hoy);
  const mes = fecha.slice(0, 7);
  const usadas = cotizaciones.filter((cotizacion) => fechaEnMexico(new Date(cotizacion.creadaEn)).startsWith(mes)).length;
  return { tipo: "limitado", usadas, restantes: Math.max(0, LIMITE_GRATIS - usadas), renuevaEl: primerDiaSiguienteMes(fecha) };
}

export function cupoAgotado(cupo?: Cupo): boolean {
  return cupo?.tipo === "limitado" && cupo.restantes === 0;
}

export function avisoDeCupo(cupo?: Cupo): string | null {
  if (!cupo || cupo.tipo === "ilimitado" || cupo.restantes > 2) return null;
  if (cupo.restantes === 2) return "Te quedan 2 cotizaciones este mes en el plan gratis.";
  if (cupo.restantes === 1) return "Te queda 1 cotización este mes en el plan gratis.";
  const mes = new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: "UTC" }).format(new Date(`${cupo.renuevaEl}T12:00:00Z`));
  return `Ya usaste tus ${LIMITE_GRATIS} cotizaciones de este mes. Se renuevan el 1 de ${mes}.`;
}

export class CupoAgotado extends Error {
  constructor() {
    super("Cupo mensual agotado");
    this.name = "CupoAgotado";
  }
}
