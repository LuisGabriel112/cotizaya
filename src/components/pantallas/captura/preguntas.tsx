"use client";

import type { ReactNode } from "react";
import { Croquis } from "@/components/croquis";
import { Icono } from "@/components/icono";
import type { CambiosCotizacion } from "@/lib/cotizaciones/estado";
import { useFuente } from "@/lib/cotizaciones/fuente";
import { ACABADOS, type Acabado, type Cotizacion, type Plantilla } from "@/lib/cotizaciones/tipos";
import { formatCentavos } from "@/lib/format";
import { limpiarCifra, parsearCantidad, parsearDescuento, type Material } from "@/lib/quote";
import type { Borrador, PasoMedida } from "./borrador";

const CAMPO_TEXTO = "h-16 w-full rounded-sm border-2 border-tinta bg-papel px-4 text-2xl placeholder:text-tinta-2";
const OPCION = "flex min-h-14 items-center gap-3 rounded-sm border-2 border-tinta px-4 has-checked:bg-papel-2";

export function Pregunta({ titulo, detalle, onCancelar, children }: { titulo: string; detalle?: ReactNode; onCancelar?: () => void; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="titulo text-[2.5rem] leading-none">{titulo}</h2>
          {detalle && <p className="mt-1 text-lg">{detalle}</p>}
        </div>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="-mr-2 min-h-14 shrink-0 px-2 text-base text-tinta-2 underline">
            Cancelar
          </button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** "$1,850/m²", "$95/m" o "$180/hoja". */
function precioPorUnidad(m: Material): string {
  const unidad = m.unidad === "m2" ? "m²" : m.unidad === "ml" ? "m" : (m.pieza?.[0] ?? "pza");
  return `${formatCentavos(m.precioCentavos).replace(".00", "")}/${unidad}`;
}

interface PropsTrabajo {
  c: Cotizacion;
  onPlantilla: (p: Plantilla) => void;
  onExtra: (t: "descuento" | "acabado") => void;
  onIva: () => void;
}

export function PreguntaTrabajo({ c, onPlantilla, onExtra, onIva }: PropsTrabajo) {
  const { catalogo } = useFuente();
  return (
    <Pregunta titulo={c.partidas.length === 0 ? "¿Qué trabajo es?" : "¿Qué más lleva?"}>
      <div data-guia="trabajos" className="grid grid-cols-2 gap-2">
        {catalogo.plantillas.map((pl) => (
          <FichaPlantilla key={pl.id} plantilla={pl} material={catalogo.material(pl.materialId)} onClick={() => onPlantilla(pl)} />
        ))}
      </div>
      <div data-guia="ajustes" className="mt-5 grid grid-cols-2 gap-2 border-t border-dashed border-aluminio pt-4">
        <Extra onClick={() => onExtra("descuento")} etiqueta="Descuento" valor={c.descuentoPct ? `${c.descuentoPct} %` : "No"} />
        <Extra onClick={onIva} etiqueta="IVA 16 %" valor={c.conIva ? "Sí" : "No"} pressed={c.conIva} />
        <Extra onClick={() => onExtra("acabado")} etiqueta="Acabado" valor={ACABADOS[c.acabado]} className="col-span-2" />
      </div>
    </Pregunta>
  );
}

function FichaPlantilla({ plantilla, material, onClick }: { plantilla: Plantilla; material?: Material; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 items-center gap-2 rounded-sm border-2 border-tinta bg-papel p-2 text-left transition-transform duration-75 active:translate-y-0.5 active:bg-papel-2"
    >
      <Croquis tipo={plantilla.croquis} className="h-8 w-9 shrink-0" />
      <span className="flex min-w-0 flex-col">
        <span className="titulo text-lg leading-tight [overflow-wrap:anywhere] hyphens-auto">{plantilla.nombre}</span>
        {material && <span className="num text-base text-tinta-2">{precioPorUnidad(material)}</span>}
      </span>
    </button>
  );
}

function Extra({ etiqueta, valor, onClick, pressed, className = "" }: { etiqueta: string; valor: string; onClick: () => void; pressed?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`flex min-h-14 flex-col justify-center rounded-sm border-2 border-dashed border-tinta-2 px-3 py-1 text-left active:bg-papel-2 aria-pressed:border-solid aria-pressed:border-tinta aria-pressed:bg-papel-2 ${className}`}
    >
      <span className="text-base leading-tight text-tinta-2">{etiqueta}</span>
      <span className="truncate font-semibold">{valor}</span>
    </button>
  );
}

interface PropsMedida {
  paso: PasoMedida;
  b: Borrador;
  onCambio: (b: Borrador) => void;
  onCancelar: () => void;
  onQuitar: () => void;
}

const TITULOS: Record<Exclude<PasoMedida, "piezas">, string> = { ancho: "¿Ancho?", alto: "¿Alto?" };

function nombrePiezas(material?: Pick<Material, "pieza">): string {
  const nombres = material?.pieza;
  return nombres?.[1] ?? "piezas";
}

export function PreguntaMedida({ paso, b, onCambio, onCancelar, onQuitar }: PropsMedida) {
  const { catalogo } = useFuente();
  const plural = nombrePiezas(catalogo.materialDe(b));
  const titulo = paso === "piezas" ? `¿Cuántas ${plural}?` : TITULOS[paso];
  return <Pregunta titulo={titulo} detalle={<DetalleTrabajo b={b} />} onCancelar={onCancelar}>
      <CampoMedida paso={paso} b={b} plural={plural} onCambio={onCambio} />
      {paso === "alto" && <Iguales valor={parsearCantidad(b.cantidad) ?? 1} onCambio={(n) => onCambio({ ...b, cantidad: String(n) })} />}
      <QuitarPartida nueva={b.nueva} onQuitar={onQuitar} />
    </Pregunta>;
}

function DetalleTrabajo({ b }: { b: Borrador }) {
  const { catalogo } = useFuente();
  const plantilla = catalogo.plantilla(b.plantillaId);
  return <span className="flex items-center gap-2">
    {plantilla && <Croquis tipo={plantilla.croquis} className="h-6 w-7" />}
    {b.descripcion}
  </span>;
}

function QuitarPartida({ nueva, onQuitar }: { nueva: boolean; onQuitar: () => void }) {
  if (nueva) return null;
  return <button type="button" onClick={onQuitar} className="titulo mt-5 min-h-14 text-xl text-rojo underline">
    Quitar esta partida
  </button>;
}

function CampoMedida({ paso, b, plural, onCambio }: { paso: PasoMedida; b: Borrador; plural: string; onCambio: (b: Borrador) => void }) {
  if (paso === "ancho") {
    return <div data-guia="ancho"><CampoNumero key="ancho" etiqueta="Ancho en centímetros" unidad="cm" decimal valor={b.ancho} onCambio={(v) => onCambio({ ...b, ancho: v })} /></div>;
  }
  if (paso === "alto") {
    return <CampoNumero key="alto" etiqueta="Alto en centímetros" unidad="cm" decimal valor={b.alto} onCambio={(v) => onCambio({ ...b, alto: v })} />;
  }
  return <CampoNumero key="piezas" etiqueta={`Número de ${plural}`} unidad={plural} max={3} valor={b.cantidad} onCambio={(v) => onCambio({ ...b, cantidad: v })} />;
}

interface PropsCampoNumero {
  etiqueta: string;
  unidad: string;
  valor: string;
  onCambio: (v: string) => void;
  /** Cifras enteras permitidas. */
  max?: number;
  /** Acepta medio centímetro: punto o coma y una cifra. */
  decimal?: boolean;
}

function CampoNumero({ etiqueta, unidad, valor, onCambio, max = 4, decimal = false }: PropsCampoNumero) {
  return (
    <label className="flex h-20 items-center gap-3 rounded-sm border-2 border-tinta bg-papel px-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-tinta">
      <span className="sr-only">{etiqueta}</span>
      <input
        autoFocus
        inputMode={decimal ? "decimal" : "numeric"}
        pattern={decimal ? "[0-9]*[.,]?[0-9]?" : "[0-9]*"}
        enterKeyHint="next"
        autoComplete="off"
        value={valor}
        onChange={(e) => onCambio(limpiarCifra(e.target.value, { enteros: max, decimal }))}
        className="num w-full min-w-0 bg-transparent text-right text-5xl font-bold outline-none"
      />
      <span className="num shrink-0 text-2xl text-tinta-2">{unidad}</span>
    </label>
  );
}

function Iguales({ valor, onCambio }: { valor: number; onCambio: (n: number) => void }) {
  return <div className="mt-4 flex items-center justify-between gap-3">
      <span id="iguales" className="text-lg">¿Cuántas iguales?</span>
      <div role="group" aria-labelledby="iguales" className="flex items-center">
        <button type="button" aria-label="Una menos" disabled={valor <= 1} onClick={() => onCambio(Math.max(1, valor - 1))}
          className="grid size-14 place-items-center rounded-l-sm border-2 border-tinta active:bg-papel-2 disabled:border-tinta-2 disabled:text-tinta-2"
        ><Icono nombre="menos" /></button>
        <output className="num grid h-14 w-14 place-items-center border-y-2 border-tinta text-2xl font-bold" aria-live="polite">
          {valor}
        </output>
        <button type="button" aria-label="Una más" onClick={() => onCambio(Math.min(99, valor + 1))}
          className="grid size-14 place-items-center rounded-r-sm border-2 border-tinta active:bg-papel-2"
        ><Icono nombre="mas" /></button>
      </div>
    </div>;
}

interface PropsDato {
  c: Cotizacion;
  onEditar: (cambios: CambiosCotizacion) => void;
  onCancelar: () => void;
}

export function PreguntaCliente({ c, onEditar, onCancelar }: PropsDato) {
  return (
    <Pregunta titulo="¿A nombre de quién?" onCancelar={onCancelar}>
      <input
        autoFocus
        aria-label="Nombre del cliente"
        value={c.cliente}
        onChange={(e) => onEditar({ cliente: e.target.value })}
        placeholder="Ej. Sra. Martínez"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={120}
        className={CAMPO_TEXTO}
      />
    </Pregunta>
  );
}

export function PreguntaDescuento({ c, onEditar, onCancelar }: PropsDato) {
  return (
    <Pregunta titulo="¿Cuánto descuento?" onCancelar={onCancelar}>
      <CampoNumero
        etiqueta="Descuento en porcentaje"
        unidad="%"
        valor={c.descuentoPct ? String(c.descuentoPct) : ""}
        max={2}
        onCambio={(v) => onEditar({ descuentoPct: parsearDescuento(v) ?? 0 })}
      />
      <p className="mt-2 text-base text-tinta-2">Se resta antes del IVA. Déjalo vacío para no dar descuento.</p>
    </Pregunta>
  );
}

export function PreguntaAcabado({ c, onEditar, onCancelar }: PropsDato) {
  return (
    <Pregunta titulo="¿Qué acabado lleva?" onCancelar={onCancelar}>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Acabado</legend>
        {(Object.keys(ACABADOS) as Acabado[]).map((a) => (
          <label key={a} className={`${OPCION} has-checked:font-semibold`}>
            <input type="radio" name="acabado" checked={c.acabado === a} onChange={() => onEditar({ acabado: a })} className="size-6 accent-tinta" />
            {ACABADOS[a]}
          </label>
        ))}
      </fieldset>
      <GarantiaSalitre c={c} onEditar={onEditar} />
    </Pregunta>
  );
}

function GarantiaSalitre({ c, onEditar }: Pick<PropsDato, "c" | "onEditar">) {
  return <label className={`mt-4 ${OPCION}`}>
    <input type="checkbox" checked={c.garantiaSalitre} onChange={(e) => onEditar({ garantiaSalitre: e.target.checked })} className="size-6 accent-tinta" />
    Incluir garantía contra salitre
  </label>;
}
