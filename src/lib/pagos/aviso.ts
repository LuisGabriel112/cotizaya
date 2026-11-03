const AVISOS: Record<string, string> = {
  aprobado: "Estamos verificando tu pago. Consulta el estado de tu plan abajo.",
  pendiente: "Si tu pago quedó pendiente, el plan se activa cuando se acredite. Consulta su estado abajo.",
  rechazado: "Si el pago no pasó, intenta de nuevo o usa otro medio. Consulta el estado de tu plan abajo.",
};

export function avisoDePago(resultado: string | undefined): string | null {
  if (!resultado || !Object.hasOwn(AVISOS, resultado)) return null;
  return AVISOS[resultado]!;
}
