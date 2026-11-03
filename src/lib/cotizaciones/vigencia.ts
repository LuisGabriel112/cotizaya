import type { Cotizacion } from "./tipos";

type Fechas = Pick<Cotizacion,"creadaEn"|"enviadaEn"|"venceEn"|"estado">;
const fecha = new Intl.DateTimeFormat("es-MX", {
  day:"numeric",month:"long",year:"numeric",timeZone:"America/Mexico_City",
});

export function fechaDocumento(cotizacion: Fechas): string {
  return fecha.format(new Date(cotizacion.enviadaEn ?? cotizacion.creadaEn));
}

export function vigenciaDocumento(cotizacion: Fechas): string {
  if (cotizacion.venceEn) return `15 días, hasta el ${fecha.format(new Date(cotizacion.venceEn))}`;
  return cotizacion.estado === "borrador" ? "15 días desde el primer envío" : "Pendiente de confirmar con el taller";
}
