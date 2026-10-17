import { Croquis } from "@/components/croquis";
import { formatCentavos, formatMedidaParcial, formatMedidas } from "@/lib/format";
import type { Croquis as TipoCroquis } from "@/lib/cotizaciones/tipos";
import type { ResultadoPartida, Unidad } from "@/lib/quote";

const ERRORES = {
  "medida-invalida": "Falta medida",
  "cantidad-invalida": "Falta cantidad",
  "precio-invalido": "Revisa el precio",
} as const;

interface Props {
  descripcion: string;
  anchoCm: number;
  altoCm: number;
  cantidad: number;
  unidad: Unidad;
  resultado: ResultadoPartida;
  croquis?: TipoCroquis;
  /** Nombre de la pieza en singular y plural, p. ej. ["hoja", "hojas"]. */
  pieza?: readonly [string, string];
  /** Partida que se está capturando: medidas a medias y sin error en rojo. */
  enCurso?: boolean;
}

/** Renglón de libreta: descripción, medidas en mono a la izquierda, importe a la derecha. */
export function RenglonPartida({ descripcion, anchoCm, altoCm, cantidad, unidad, resultado, croquis, enCurso, pieza }: Props) {
  const medidas = enCurso && unidad !== "pieza" && !(anchoCm > 0 && altoCm > 0)
    ? formatMedidaParcial(anchoCm, altoCm)
    : formatMedidas(anchoCm, altoCm, unidad, cantidad, pieza);

  return (
    <div className="flex flex-col gap-0.5 border-b border-dashed border-aluminio py-3">
      <span className="flex items-center gap-2 font-medium">
        {croquis && <Croquis tipo={croquis} className="h-5 w-6 shrink-0" />}
        {descripcion}
      </span>
      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="num text-tinta-2">{medidas}</span>
        {resultado.ok ? (
          <span className="num text-right font-bold">{formatCentavos(resultado.importeCentavos)}</span>
        ) : enCurso ? (
          <span className="num text-right text-tinta-2">—</span>
        ) : (
          <span className="titulo text-right text-xl text-rojo">{ERRORES[resultado.error]}</span>
        )}
      </span>
    </div>
  );
}
