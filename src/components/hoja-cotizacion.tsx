import Image from "next/image";
import { Folio } from "@/components/ui/folio";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { RenglonPartida } from "@/components/ui/renglon-partida";
import { Total } from "@/components/ui/total";
import type { Catalogo } from "@/lib/cotizaciones/catalogo";
import type { Resumen } from "@/lib/cotizaciones/resumen";
import { ACABADOS, type Cotizacion, type Taller } from "@/lib/cotizaciones/tipos";
import { formatFecha } from "@/lib/format";
import { formatTelefono } from "@/lib/telefono";

/**
 * La hoja que recibe el cliente. Misma composición que el PDF (fase 4):
 * taller y folio arriba, partidas en renglones, recuadro de acabado, total con línea doble, condiciones al pie.
 */
interface Props {
  cotizacion: Cotizacion;
  resumen: Resumen;
  taller: Taller;
  catalogo: Catalogo;
}

export function HojaCotizacion({ cotizacion: c, resumen, taller, catalogo }: Props) {
  return (
    <article className="border-2 border-tinta bg-papel px-4 py-5" aria-label={`Cotización ${c.folio}`}>
      <header className="flex items-center gap-3">
        <Marca taller={taller} />
        <div className="min-w-0">
          <p className="titulo text-xl leading-tight">{taller.nombre}</p>
          <p className="text-base text-tinta-2">{taller.ciudad}</p>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-base">
          <dt className="text-tinta-2">Para</dt>
          <dd className={c.cliente ? "font-medium" : "text-tinta-2"}>{c.cliente || "Sin nombre"}</dd>
          <dt className="text-tinta-2">Fecha</dt>
          <dd>
            {formatFecha(c.creadaEn)} {new Date(c.creadaEn).getFullYear()}
          </dd>
          <dt className="text-tinta-2">Vigencia</dt>
          <dd>15 días</dd>
        </dl>
        <Folio folio={c.folio} className="mt-1 shrink-0" />
      </div>

      <ReglaCinta className="mt-4" />

      <ul className="mt-1">
        {resumen.renglones.map(({ partida, resultado }) => (
          <li key={partida.id}>
            <RenglonPartida
              descripcion={partida.descripcion}
              anchoCm={partida.anchoCm}
              altoCm={partida.altoCm}
              cantidad={partida.cantidad}
              unidad={catalogo.materialDe(partida)?.unidad ?? "pieza"}
              pieza={catalogo.materialDe(partida)?.pieza}
              resultado={resultado}
              croquis={catalogo.plantilla(partida.plantillaId)?.croquis}
            />
          </li>
        ))}
      </ul>

      {(c.acabado !== "natural" || c.garantiaSalitre) && (
        <div className="border-b border-dashed border-aluminio py-3">
          {c.acabado !== "natural" && (
            <p>
              <span className="font-semibold">Acabado:</span> {ACABADOS[c.acabado].toLowerCase()}.
            </p>
          )}
          {c.garantiaSalitre && <p>Incluye garantía contra salitre.</p>}
        </div>
      )}

      <div className="mt-4">
        <Total
          subtotalCentavos={resumen.totales.subtotalCentavos}
          descuentoPct={c.descuentoPct}
          descuentoCentavos={resumen.totales.descuentoCentavos}
          ivaCentavos={resumen.totales.ivaCentavos}
          conIva={c.conIva}
          totalCentavos={resumen.totales.totalCentavos}
        />
      </div>

      <footer className="mt-5 flex flex-col gap-1 border-t border-dashed border-aluminio pt-3 text-base text-tinta-2">
        <p>{taller.condiciones}</p>
        <p>
          Precios válidos por 15 días. Tel. {formatTelefono(taller.telefono)}
        </p>
        {taller.plan === "gratis" && <p className="pt-2">Hecho con Cotiza Ya</p>}
      </footer>
    </article>
  );
}

/** Logo del taller si el admin lo subió; si no, sus iniciales en el mismo recuadro. */
function Marca({ taller }: { taller: Taller }) {
  if (taller.logoUrl) {
    return <Image src={taller.logoUrl} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-sm object-contain" />;
  }
  const iniciales = taller.nombre
    .split(" ")
    .filter((p) => p.length > 3)
    .slice(-2)
    .map((p) => p[0])
    .join("");
  return (
    <span className="titulo grid size-12 shrink-0 place-items-center rounded-sm border-2 border-tinta text-xl" aria-hidden="true">
      {iniciales}
    </span>
  );
}
