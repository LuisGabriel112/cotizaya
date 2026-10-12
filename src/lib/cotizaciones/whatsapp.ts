import { formatCentavos, formatFolio } from "@/lib/format";

/** Enlace de WhatsApp con el mensaje prellenado. Sin número: el maestro elige el chat. */
export function enlaceWhatsApp(opts: { cliente: string; folio: number; taller: string; totalCentavos: number; url: string }): string {
  const saludo = opts.cliente ? `Hola, ${opts.cliente}.` : "Hola.";
  const texto = `${saludo} Te mando la cotización No. ${formatFolio(opts.folio)} de ${opts.taller} por ${formatCentavos(opts.totalCentavos)}. Aquí la puedes ver: ${opts.url}`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
