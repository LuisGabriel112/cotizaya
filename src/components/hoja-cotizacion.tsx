import { Folio } from "@/components/ui/folio";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { RenglonPartida } from "@/components/ui/renglon-partida";
import { Total } from "@/components/ui/total";
import { materialPorId } from "@/lib/demo/catalogo";
import { plantillaPorId } from "@/lib/demo/plantillas";
import type { Resumen } from "@/lib/demo/derivados";
import { ACABADOS } from "@/lib/demo/tipos";
import type { Cotizacion, Taller } from "@/lib/demo/tipos";
import { formatFecha } from "@/lib/format";

/**
 * La hoja que recibe el cliente. Misma composición que el PDF (fase 4):
 * taller y folio arriba, partidas en renglones, recuadro de acabado, total con línea doble, condiciones al pie.
 */
export function HojaCotizacion({ cotizacion: c, resumen, taller }: { cotizacion: Cotizacion; resumen: Resumen; taller: Taller }) {
  const iniciales = taller.nombre
    .split(" ")
    .filter((p) => p.length > 3)
    .slice(-2)
    .map((p) => p[0])
    .join("");

  return (
    <article className="border-2 border-tinta bg-papel px-4 py-5" aria-label={`Cotización ${c.folio}`}>
      <header className="flex items-center gap-3">
        <span className="titulo grid size-12 shrink-0 place-items-center rounded-sm border-2 border-tinta text-xl" aria-hidden="true">
          {iniciales}
        </span>
        <div className="min-w-0">
          <p className="titulo text-xl leading-tight">{taller.nombre}</p>
          <p className="text-base text-tinta-2">{taller.ciudad}</p>
        </div>
      </header>

      <div className="mt-5 flex items-start justify-between gap-3">
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
              unidad={materialPorId(partida.materialId)?.unidad ?? "pieza"}
              pieza={materialPorId(partida.materialId)?.pieza}
              resultado={resultado}
              croquis={plantillaPorId(partida.plantillaId)?.croquis}
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
          Precios válidos por 15 días. Tel. {taller.telefono}
        </p>
        {taller.plan === "gratis" && <p className="pt-2">Hecho con Cotiza Ya</p>}
      </footer>
    </article>
  );
}
