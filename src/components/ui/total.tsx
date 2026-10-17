import { formatCentavos } from "@/lib/format";

interface Props {
  subtotalCentavos: number;
  descuentoPct: number;
  descuentoCentavos: number;
  ivaCentavos: number;
  conIva: boolean;
  totalCentavos: number;
}

/** Bloque de totales: desglose solo cuando hay descuento o IVA; TOTAL con línea doble. */
export function Total({ subtotalCentavos, descuentoPct, descuentoCentavos, ivaCentavos, conIva, totalCentavos }: Props) {
  const desglose = descuentoCentavos > 0 || conIva;
  return (
    <div>
      {desglose && (
        <dl className="flex flex-col gap-1 pb-2 text-tinta-2">
          <Fila etiqueta="Subtotal" monto={formatCentavos(subtotalCentavos)} />
          {descuentoCentavos > 0 && <Fila etiqueta={`Descuento ${descuentoPct} %`} monto={`−${formatCentavos(descuentoCentavos)}`} />}
          {conIva && <Fila etiqueta="IVA 16 %" monto={formatCentavos(ivaCentavos)} />}
        </dl>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t-[6px] border-double border-tinta pt-2">
        <span className="titulo text-2xl">Total</span>
        <span className="num text-right text-[min(2rem,12vw)] leading-tight font-bold" data-testid="total">
          {formatCentavos(totalCentavos)}
        </span>
      </div>
    </div>
  );
}

function Fila({ etiqueta, monto }: { etiqueta: string; monto: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      <dt>{etiqueta}</dt>
      <dd className="num text-right">{monto}</dd>
    </div>
  );
}
