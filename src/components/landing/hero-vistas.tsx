import Link from "next/link";
import { clasesBoton } from "@/components/ui/boton";
import { Folio } from "@/components/ui/folio";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { RenglonPartida } from "@/components/ui/renglon-partida";
import { Total } from "@/components/ui/total";
import { etiquetaUnidad } from "@/lib/catalogo/unidades";
import type { PartidaGuardada } from "@/lib/cotizaciones/tipos";
import { CATALOGO_LANDING, TRABAJOS_HERO } from "@/lib/demo/landing";
import { formatCentavos } from "@/lib/format";
import { hojaHero, lleno, puedeAgregar, type AccionHero, type EstadoHero, type HojaHero } from "./estado";

const campo = "mt-1 min-h-16 w-full rounded-sm border-2 border-tinta bg-papel px-4 text-right text-xl text-tinta";
const enlace = "min-h-14 text-lg font-semibold underline decoration-2 underline-offset-4";
const SIN_IMPORTE = { ok: false, error: "medida-invalida" } as const;

interface Props {
  estado: EstadoHero;
  despachar: (accion: AccionHero) => void;
}

/** La hoja de obra que se llena con lo que teclea el visitante. Pura: el estado vive en el contenedor. */
export function HeroVista({ estado, despachar }: Props) {
  const hoja = hojaHero(estado);
  return <>
    {lleno(estado) ? <Cierre despachar={despachar} /> : <Controles estado={estado} hoja={hoja} despachar={despachar} />}
    <Hoja hoja={hoja} folio={estado.cotizacion.folio} cliente={estado.cotizacion.cliente} conIva={estado.cotizacion.conIva} />
    {estado.cotizacion.partidas.length > 1 && !lleno(estado) && (
      <button id="hero-reiniciar" type="button" className={`${enlace} mt-2 block`} onClick={() => despachar({ tipo: "reiniciar" })}>Empezar de nuevo</button>
    )}
  </>;
}

function Cierre({ despachar }: Pick<Props, "despachar">) {
  return <section className="mt-6" role="status">
    <p id="hero-cierre" tabIndex={-1} className="text-lg">Ya viste cómo va. En tu cuenta van tus precios, tu logo y tus condiciones.</p>
    <Link className={`${enlace} mt-2 block`} href="/entrar">Hacer la mía con mis precios</Link>
    <button id="hero-reiniciar" type="button" className={`${enlace} mt-1 block text-tinta-2`} onClick={() => despachar({ tipo: "reiniciar" })}>Empezar de nuevo</button>
  </section>;
}

function Hoja({ hoja, folio, cliente, conIva }: { hoja: HojaHero; folio: number; cliente: string; conIva: boolean }) {
  return <article className="mt-6 border-2 border-tinta bg-papel px-4 py-5" aria-label="Hoja de cotización">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="text-base text-tinta-2">Para <span className="font-medium text-tinta">{cliente}</span></p>
      <Folio folio={folio} className="shrink-0" />
    </div>
    <ReglaCinta className="mt-3" />
    <ul className="mt-1">
      {hoja.renglones.map(({ partida, resultado }) => <li key={partida.id} className="motion-safe:animate-[caer_220ms_cubic-bezier(0.16,1,0.3,1)]">
        <Renglon partida={partida} resultado={resultado} />
      </li>)}
    </ul>
    {hoja.enCurso && <div className="bg-papel-2">
      <Renglon partida={hoja.enCurso} resultado={SIN_IMPORTE} enCurso />
    </div>}
    <div className="mt-4">
      <Total
        subtotalCentavos={hoja.totales.subtotalCentavos}
        descuentoPct={0}
        descuentoCentavos={hoja.totales.descuentoCentavos}
        ivaCentavos={hoja.totales.ivaCentavos}
        conIva={conIva}
        totalCentavos={hoja.totales.totalCentavos}
      />
    </div>
  </article>;
}

function Renglon({ partida, resultado, enCurso = false }: { partida: PartidaGuardada; resultado: HojaHero["renglones"][number]["resultado"]; enCurso?: boolean }) {
  return <RenglonPartida
    descripcion={partida.descripcion}
    anchoCm={partida.anchoCm}
    altoCm={partida.altoCm}
    cantidad={partida.cantidad}
    unidad={CATALOGO_LANDING.materialDe(partida)?.unidad ?? "pieza"}
    resultado={resultado}
    croquis={CATALOGO_LANDING.plantilla(partida.plantillaId)?.croquis}
    enCurso={enCurso}
  />;
}

/** Lo que se dice en voz alta: la ayuda mientras falta una medida y el acuse cuando ya se agregó. */
export function avisoHero(estado: EstadoHero, hoja: HojaHero): string {
  if (estado.tocado) return puedeAgregar(estado) ? "Listo: toca Agregar partida." : "Pon las dos medidas en centímetros.";
  if (estado.cotizacion.partidas.length > 1) return `Partida agregada. Total ${formatCentavos(hoja.totales.totalCentavos)}.`;
  return "Elige el trabajo y pon las dos medidas en centímetros.";
}

function Controles({ estado, hoja, despachar }: Props & { hoja: HojaHero }) {
  const listo = puedeAgregar(estado);
  return <section className="mt-6">
    <p className="text-lg font-medium">Pruébalo: elige el trabajo y teclea las medidas.</p>
    <Trabajos elegido={estado.borrador.plantillaId} elegir={(plantillaId) => despachar({ tipo: "trabajo", plantillaId })} />
    <div className="mt-3 flex gap-3">
      <CampoMedida id="hero-ancho" nombre="Ancho" valor={estado.borrador.ancho} cambiar={(texto) => despachar({ tipo: "medida", lado: "ancho", texto })} />
      <CampoMedida id="hero-alto" nombre="Alto" valor={estado.borrador.alto} cambiar={(texto) => despachar({ tipo: "medida", lado: "alto", texto })} />
    </div>
    <button id="hero-agregar" type="button" aria-disabled={!listo} aria-describedby="hero-ayuda" onClick={() => listo && despachar({ tipo: "agregar" })}
      className={clasesBoton("secundario", "mt-3 w-full aria-disabled:border-tinta-2 aria-disabled:bg-papel-2 aria-disabled:text-tinta-2")}>
      Agregar partida
    </button>
    <p id="hero-ayuda" role="status" className="mt-2 text-base text-tinta-2">{avisoHero(estado, hoja)}</p>
    <PrecioEjemplo plantillaId={estado.borrador.plantillaId} />
  </section>;
}

function Trabajos({ elegido, elegir }: { elegido: string; elegir: (plantillaId: string) => void }) {
  return <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Trabajo">
    {TRABAJOS_HERO.map((trabajo) => <button key={trabajo.id} id={`trabajo-${trabajo.id}`} type="button" aria-pressed={elegido === trabajo.id}
      onClick={() => elegir(trabajo.id)} className={clasesBoton("secundario", "px-3 aria-[pressed=true]:bg-tinta aria-[pressed=true]:text-papel")}>
      <span className="min-w-0 break-words">{trabajo.nombre}</span>
    </button>)}
  </div>;
}

/** De dónde sale el importe: el precio de ejemplo del material del trabajo elegido. */
function PrecioEjemplo({ plantillaId }: { plantillaId: string }) {
  const material = CATALOGO_LANDING.material(CATALOGO_LANDING.plantilla(plantillaId)?.materialId ?? "");
  if (!material) return null;
  return <p className="num mt-2 text-base text-tinta-2">
    Precio de ejemplo: {formatCentavos(material.precioCentavos)} {etiquetaUnidad(material.unidad)}. En tu cuenta va el tuyo.
  </p>;
}

function CampoMedida({ id, nombre, valor, cambiar }: { id: string; nombre: string; valor: string; cambiar: (valor: string) => void }) {
  return <div className="flex-1">
    <label className="block font-medium" htmlFor={id}>{nombre} <span className="text-tinta-2">cm</span></label>
    <input id={id} className={`${campo} num`} inputMode="decimal" value={valor} aria-describedby="hero-ayuda" onChange={(e) => cambiar(e.target.value)} />
  </div>;
}
