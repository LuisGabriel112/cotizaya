import Link from "next/link";
import { Encabezado } from "@/components/encabezado";
import { Guia } from "@/components/guia/guia";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { PRECIOS, type Periodo } from "@/lib/pagos/planes";
import { formatCentavos } from "@/lib/format";
import { iniciarPago } from "./acciones";
import { EstadoPlan } from "./estado-plan";

const avisos: Record<string, string> = {
  aprobado: "Pago aprobado. Tu plan ya está activo.",
  pendiente: "Tu pago está pendiente. En cuanto se acredite se activa solo.",
  rechazado: "El pago no pasó. Intenta de nuevo o usa otro medio.",
};

function OpcionPeriodo({ periodo, texto, marcado = false }: { periodo: Periodo; texto: string; marcado?: boolean }) {
  return <label className="flex min-h-14 items-center gap-3 rounded-sm border-2 border-tinta px-4 py-2 text-lg has-checked:bg-papel-2">
    <input type="radio" name="periodo" value={periodo} defaultChecked={marcado} className="size-6 accent-tinta" />
    <span className="flex-1">{texto}</span>
  </label>;
}

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ pago?: string }> }) {
  const { pago } = await searchParams;
  return <main className="mx-auto max-w-md px-4 pb-36">
    <Encabezado titulo="Plan" atras={{ href: "/cotizaciones", texto: "Cotizaciones" }} />
    {pago && avisos[pago] && <p role="status" className="mt-5 border-y-2 border-tinta py-3 text-lg">{avisos[pago]}</p>}
    <EstadoPlan />
    <form action={iniciarPago} className="mt-8 space-y-4">
      <fieldset data-guia="periodo" className="space-y-3">
        <legend className="titulo mb-3 text-xl">Elige tu periodo</legend>
        <OpcionPeriodo periodo="mes" texto={`1 mes · ${formatCentavos(PRECIOS.mes).replace(".00", "")}`} />
        <OpcionPeriodo periodo="anio" texto={`1 año · ${formatCentavos(PRECIOS.anio).replace(".00", "")} (2 meses gratis)`} marcado />
      </fieldset>
      <p className="text-base text-tinta-2">Tarjeta, OXXO o transferencia. El plan se activa en cuanto Mercado Pago confirma el pago.</p>
      <Link href="/cotizaciones" className="inline-flex min-h-14 items-center underline">Volver a cotizaciones</Link>
      <BarraAccion><Boton data-guia="pagar" type="submit" className="w-full">Pagar con Mercado Pago</Boton></BarraAccion>
    </form>
    <Guia id="plan" />
  </main>;
}
