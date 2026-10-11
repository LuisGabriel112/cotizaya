"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Croquis } from "@/components/croquis";
import { Encabezado } from "@/components/encabezado";
import { Icono } from "@/components/icono";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { Folio } from "@/components/ui/folio";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { RenglonPartida } from "@/components/ui/renglon-partida";
import { Total } from "@/components/ui/total";
import { materialPorId } from "@/lib/demo/catalogo";
import { resumir } from "@/lib/demo/derivados";
import { PLANTILLAS, plantillaPorId, type Plantilla } from "@/lib/demo/plantillas";
import { nuevoId, useDemo } from "@/lib/demo/store";
import { ACABADOS, type Acabado, type Cotizacion, type PartidaGuardada } from "@/lib/demo/tipos";
import { formatCentavos } from "@/lib/format";

interface Borrador {
  partidaId: string;
  nueva: boolean;
  plantillaId: string;
  descripcion: string;
  materialId: string;
  manoObraCentavos: number;
  ancho: string;
  alto: string;
  cantidad: string;
}

type Paso =
  | { tipo: "trabajo" }
  | { tipo: "ancho" | "alto" | "piezas"; b: Borrador }
  | { tipo: "cliente" | "descuento" | "acabado" };

const FORM = "pregunta";

export default function Captura() {
  const { id } = useParams<{ id: string }>();
  const demo = useDemo();
  const c = demo.porId(id);

  if (!demo.listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  if (!c) return <NoExiste />;
  return <Conversacion c={c} />;
}

function Conversacion({ c }: { c: Cotizacion }) {
  const demo = useDemo();
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>({ tipo: "trabajo" });
  const preguntaRef = useRef<HTMLElement>(null);
  // La partida que se está contestando cae a la hoja desde el primer número, con el total al día.
  const borrador = "b" in paso ? paso.b : undefined;
  const resumen = resumir(borrador ? conBorrador(c, borrador) : c);

  // Cada respuesta baja la vista a la siguiente pregunta, como en un chat.
  useEffect(() => {
    preguntaRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [paso.tipo, c.partidas.length]);

  const empezar = (pl: Plantilla) => {
    const b: Borrador = {
      partidaId: `${c.id}-${nuevoId()}`,
      nueva: true,
      plantillaId: pl.id,
      descripcion: pl.descripcion,
      materialId: pl.materialId,
      manoObraCentavos: pl.manoObraCentavos,
      ancho: "",
      alto: "",
      cantidad: "1",
    };
    setPaso({ tipo: unidadDe(b) === "pieza" ? "piezas" : "ancho", b });
  };

  const editar = (p: PartidaGuardada) => {
    const b: Borrador = {
      partidaId: p.id,
      nueva: false,
      plantillaId: p.plantillaId,
      descripcion: p.descripcion,
      materialId: p.materialId,
      manoObraCentavos: p.manoObraCentavos,
      ancho: p.anchoCm ? String(p.anchoCm) : "",
      alto: p.altoCm ? String(p.altoCm) : "",
      cantidad: String(p.cantidad),
    };
    setPaso({ tipo: unidadDe(b) === "pieza" ? "piezas" : "ancho", b });
  };

  const guardar = (b: Borrador) => {
    demo.guardarPartida(c.id, aGuardada(b));
    setPaso({ tipo: "trabajo" });
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (paso.tipo === "ancho" && Number(paso.b.ancho) > 0) setPaso({ tipo: "alto", b: paso.b });
    else if ((paso.tipo === "alto" || paso.tipo === "piezas") && listaParaGuardar(paso.b, paso.tipo)) guardar(paso.b);
    else if (paso.tipo === "cliente" || paso.tipo === "descuento" || paso.tipo === "acabado") setPaso({ tipo: "trabajo" });
  };

  return (
    <main className="mx-auto max-w-md px-4 pb-32">
      <Encabezado titulo="Cotización" atras={{ href: "/cotizaciones", texto: "Cotizaciones" }} derecha={<Folio folio={c.folio} />} />

      {/* La hoja: lo ya contestado. */}
      <section aria-label="Hoja de la cotización" className="mt-4">
        <button
          type="button"
          onClick={() => setPaso({ tipo: "cliente" })}
          className="flex min-h-14 w-full items-baseline gap-3 text-left"
        >
          <span className="text-tinta-2">Para</span>
          <span className={c.cliente ? "font-semibold" : "text-tinta-2 underline"}>{c.cliente || "Poner nombre del cliente"}</span>
        </button>
        <ReglaCinta className="mt-1" />
        {resumen.renglones.length > 0 ? (
          <ul>
            {resumen.renglones.map(({ partida, resultado }) => {
              const enCurso = borrador?.partidaId === partida.id;
              return (
                <li key={partida.id} className="motion-safe:animate-[caer_220ms_cubic-bezier(0.16,1,0.3,1)]">
                  <button
                    type="button"
                    onClick={() => (enCurso && borrador ? setPaso({ tipo: unidadDe(borrador) === "pieza" ? "piezas" : "ancho", b: borrador }) : editar(partida))}
                    aria-label={`Corregir ${partida.descripcion}`}
                    aria-current={enCurso ? "true" : undefined}
                    className="block w-full text-left aria-[current=true]:bg-papel-2"
                  >
                    <RenglonPartida
                      descripcion={partida.descripcion}
                      anchoCm={partida.anchoCm}
                      altoCm={partida.altoCm}
                      cantidad={partida.cantidad}
                      unidad={materialPorId(partida.materialId)?.unidad ?? "pieza"}
                      pieza={materialPorId(partida.materialId)?.pieza}
                      resultado={resultado}
                      croquis={plantillaPorId(partida.plantillaId)?.croquis}
                      enCurso={enCurso}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border-b border-dashed border-aluminio py-4 text-tinta-2">Aún sin partidas. Elige el trabajo aquí abajo.</p>
        )}
        <div className="mt-3">
          <Total
            subtotalCentavos={resumen.totales.subtotalCentavos}
            descuentoPct={c.descuentoPct}
            descuentoCentavos={resumen.totales.descuentoCentavos}
            ivaCentavos={resumen.totales.ivaCentavos}
            conIva={c.conIva}
            totalCentavos={resumen.totales.totalCentavos}
          />
        </div>
      </section>

      {/* La pregunta: solo la siguiente decisión, en grande. */}
      <section ref={preguntaRef} aria-live="polite" className="mt-8 scroll-mb-32 border-t-2 border-tinta pt-4">
        <form id={FORM} onSubmit={enviar} noValidate>
          {paso.tipo === "trabajo" && (
            <PreguntaTrabajo
              primera={c.partidas.length === 0}
              c={c}
              onPlantilla={empezar}
              onExtra={(tipo) => setPaso({ tipo })}
              onIva={() => demo.editar(c.id, { conIva: !c.conIva })}
            />
          )}
          {(paso.tipo === "ancho" || paso.tipo === "alto" || paso.tipo === "piezas") && (
            <PreguntaMedida
              paso={paso.tipo}
              b={paso.b}
              onCambio={(b) => setPaso({ tipo: paso.tipo, b })}
              onCancelar={() => setPaso({ tipo: "trabajo" })}
              onQuitar={() => {
                demo.quitarPartida(c.id, paso.b.partidaId);
                setPaso({ tipo: "trabajo" });
              }}
            />
          )}
          {paso.tipo === "cliente" && (
            <Pregunta titulo="¿A nombre de quién?" onCancelar={() => setPaso({ tipo: "trabajo" })}>
              <input
                autoFocus
                aria-label="Nombre del cliente"
                value={c.cliente}
                onChange={(e) => demo.editar(c.id, { cliente: e.target.value })}
                placeholder="Ej. Sra. Martínez"
                autoComplete="off"
                enterKeyHint="done"
                className="h-16 w-full rounded-sm border-2 border-tinta bg-papel px-4 text-2xl placeholder:text-tinta-2"
              />
            </Pregunta>
          )}
          {paso.tipo === "descuento" && (
            <Pregunta titulo="¿Cuánto descuento?" onCancelar={() => setPaso({ tipo: "trabajo" })}>
              <CampoNumero
                etiqueta="Descuento en porcentaje"
                unidad="%"
                valor={c.descuentoPct ? String(c.descuentoPct) : ""}
                max={2}
                onCambio={(v) => demo.editar(c.id, { descuentoPct: Math.min(100, Number(v) || 0) })}
              />
              <p className="mt-2 text-base text-tinta-2">Se resta antes del IVA. Déjalo vacío para no dar descuento.</p>
            </Pregunta>
          )}
          {paso.tipo === "acabado" && (
            <Pregunta titulo="¿Qué acabado lleva?" onCancelar={() => setPaso({ tipo: "trabajo" })}>
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Acabado</legend>
                {(Object.keys(ACABADOS) as Acabado[]).map((a) => (
                  <label key={a} className="flex min-h-14 items-center gap-3 rounded-sm border-2 border-tinta px-4 has-checked:bg-papel-2 has-checked:font-semibold">
                    <input
                      type="radio"
                      name="acabado"
                      checked={c.acabado === a}
                      onChange={() => demo.editar(c.id, { acabado: a })}
                      className="size-6 accent-tinta"
                    />
                    {ACABADOS[a]}
                  </label>
                ))}
              </fieldset>
              <label className="mt-4 flex min-h-14 items-center gap-3 rounded-sm border-2 border-tinta px-4 has-checked:bg-papel-2">
                <input
                  type="checkbox"
                  checked={c.garantiaSalitre}
                  onChange={(e) => demo.editar(c.id, { garantiaSalitre: e.target.checked })}
                  className="size-6 accent-tinta"
                />
                Incluir garantía contra salitre
              </label>
            </Pregunta>
          )}
        </form>
      </section>

      <BarraAccion>
        {paso.tipo === "trabajo" && (
          <Boton disabled={c.partidas.length === 0} onClick={() => router.push(`/cotizaciones/${c.id}`)}>
            Ver cotización
          </Boton>
        )}
        {paso.tipo === "ancho" && (
          <Boton type="submit" form={FORM} disabled={!(Number(paso.b.ancho) > 0)}>
            Siguiente: alto
          </Boton>
        )}
        {(paso.tipo === "alto" || paso.tipo === "piezas") && (
          <Boton type="submit" form={FORM} disabled={!listaParaGuardar(paso.b, paso.tipo)}>
            {paso.b.nueva ? "Agregar partida" : "Guardar cambios"}
          </Boton>
        )}
        {(paso.tipo === "cliente" || paso.tipo === "descuento" || paso.tipo === "acabado") && (
          <Boton type="submit" form={FORM}>
            Listo
          </Boton>
        )}
      </BarraAccion>
    </main>
  );
}

function aGuardada(b: Borrador): PartidaGuardada {
  return {
    id: b.partidaId,
    plantillaId: b.plantillaId,
    descripcion: b.descripcion,
    materialId: b.materialId,
    anchoCm: Number(b.ancho) || 0,
    altoCm: Number(b.alto) || 0,
    cantidad: Number(b.cantidad) || 0,
    manoObraCentavos: b.manoObraCentavos,
  };
}

function conBorrador(c: Cotizacion, b: Borrador): Cotizacion {
  const p = aGuardada(b);
  const partidas = b.nueva ? [...c.partidas, p] : c.partidas.map((x) => (x.id === p.id ? p : x));
  return { ...c, partidas };
}

function unidadDe(b: Pick<Borrador, "materialId">) {
  return materialPorId(b.materialId)?.unidad ?? "pieza";
}

function listaParaGuardar(b: Borrador, paso: "alto" | "piezas") {
  return paso === "piezas" ? Number(b.cantidad) > 0 : Number(b.ancho) > 0 && Number(b.alto) > 0 && Number(b.cantidad) > 0;
}

function Pregunta({ titulo, detalle, onCancelar, children }: { titulo: string; detalle?: ReactNode; onCancelar?: () => void; children: ReactNode }) {
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

function PreguntaTrabajo({
  primera,
  c,
  onPlantilla,
  onExtra,
  onIva,
}: {
  primera: boolean;
  c: Cotizacion;
  onPlantilla: (p: Plantilla) => void;
  onExtra: (t: "descuento" | "acabado") => void;
  onIva: () => void;
}) {
  return (
    <Pregunta titulo={primera ? "¿Qué trabajo es?" : "¿Qué más lleva?"}>
      <div className="grid grid-cols-2 gap-2">
        {PLANTILLAS.map((pl) => {
          const m = materialPorId(pl.materialId);
          return (
            <button
              key={pl.id}
              type="button"
              onClick={() => onPlantilla(pl)}
              className="flex min-h-20 items-center gap-2 rounded-sm border-2 border-tinta bg-papel p-2 text-left transition-transform duration-75 active:translate-y-0.5 active:bg-papel-2"
            >
              <Croquis tipo={pl.croquis} className="h-8 w-9 shrink-0" />
              <span className="flex min-w-0 flex-col">
                <span className="titulo text-lg leading-tight [overflow-wrap:anywhere] hyphens-auto">{pl.nombre}</span>
                {m && (
                  <span className="num text-base text-tinta-2">
                    {formatCentavos(m.precioCentavos).replace(".00", "")}/{m.unidad === "m2" ? "m²" : m.unidad === "ml" ? "m" : (m.pieza?.[0] ?? "pza")}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-dashed border-aluminio pt-4">
        <Extra onClick={() => onExtra("descuento")} etiqueta="Descuento" valor={c.descuentoPct ? `${c.descuentoPct} %` : "No"} />
        <Extra onClick={onIva} etiqueta="IVA 16 %" valor={c.conIva ? "Sí" : "No"} pressed={c.conIva} />
        <Extra onClick={() => onExtra("acabado")} etiqueta="Acabado" valor={ACABADOS[c.acabado]} className="col-span-2" />
      </div>
    </Pregunta>
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

function PreguntaMedida({
  paso,
  b,
  onCambio,
  onCancelar,
  onQuitar,
}: {
  paso: "ancho" | "alto" | "piezas";
  b: Borrador;
  onCambio: (b: Borrador) => void;
  onCancelar: () => void;
  onQuitar: () => void;
}) {
  const plantilla = plantillaPorId(b.plantillaId);
  const pieza = paso === "piezas";
  const plural = materialPorId(b.materialId)?.pieza?.[1] ?? "piezas";
  const titulo = paso === "ancho" ? "¿Ancho?" : paso === "alto" ? "¿Alto?" : `¿Cuántas ${plural}?`;

  return (
    <Pregunta
      titulo={titulo}
      detalle={
        <span className="flex items-center gap-2">
          {plantilla && <Croquis tipo={plantilla.croquis} className="h-6 w-7" />}
          {b.descripcion}
        </span>
      }
      onCancelar={onCancelar}
    >
      {paso === "ancho" && (
        <CampoNumero key="ancho" etiqueta="Ancho en centímetros" unidad="cm" valor={b.ancho} onCambio={(v) => onCambio({ ...b, ancho: v })} />
      )}
      {paso === "alto" && (
        <CampoNumero key="alto" etiqueta="Alto en centímetros" unidad="cm" valor={b.alto} onCambio={(v) => onCambio({ ...b, alto: v })} />
      )}
      {pieza && (
        <CampoNumero key="piezas" etiqueta={`Número de ${plural}`} unidad={plural} max={3} valor={b.cantidad} onCambio={(v) => onCambio({ ...b, cantidad: v })} />
      )}

      {paso === "alto" && <Iguales valor={Number(b.cantidad) || 1} onCambio={(n) => onCambio({ ...b, cantidad: String(n) })} />}

      {!b.nueva && (
        <button type="button" onClick={onQuitar} className="titulo mt-5 min-h-14 text-xl text-rojo underline">
          Quitar esta partida
        </button>
      )}
    </Pregunta>
  );
}

function CampoNumero({
  etiqueta,
  unidad,
  valor,
  onCambio,
  max = 4,
}: {
  etiqueta: string;
  unidad: string;
  valor: string;
  onCambio: (v: string) => void;
  max?: number;
}) {
  return (
    <label className="flex h-20 items-center gap-3 rounded-sm border-2 border-tinta bg-papel px-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-tinta">
      <span className="sr-only">{etiqueta}</span>
      <input
        autoFocus
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="next"
        autoComplete="off"
        value={valor}
        onChange={(e) => onCambio(e.target.value.replace(/\D/g, "").slice(0, max))}
        className="num w-full min-w-0 bg-transparent text-right text-5xl font-bold outline-none"
      />
      <span className="num shrink-0 text-2xl text-tinta-2">{unidad}</span>
    </label>
  );
}

function Iguales({ valor, onCambio }: { valor: number; onCambio: (n: number) => void }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span id="iguales" className="text-lg">
        ¿Cuántas iguales?
      </span>
      <div role="group" aria-labelledby="iguales" className="flex items-center">
        <button
          type="button"
          aria-label="Una menos"
          disabled={valor <= 1}
          onClick={() => onCambio(Math.max(1, valor - 1))}
          className="grid size-14 place-items-center rounded-l-sm border-2 border-tinta active:bg-papel-2 disabled:border-tinta-2 disabled:text-tinta-2"
        >
          <Icono nombre="menos" />
        </button>
        <output className="num grid h-14 w-14 place-items-center border-y-2 border-tinta text-2xl font-bold" aria-live="polite">
          {valor}
        </output>
        <button
          type="button"
          aria-label="Una más"
          onClick={() => onCambio(Math.min(99, valor + 1))}
          className="grid size-14 place-items-center rounded-r-sm border-2 border-tinta active:bg-papel-2"
        >
          <Icono nombre="mas" />
        </button>
      </div>
    </div>
  );
}

function NoExiste() {
  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="titulo text-3xl">No encontramos esta cotización</h1>
      <p className="mt-2">Puede que se haya borrado al reiniciar los datos de ejemplo.</p>
      <Link href="/cotizaciones" className="mt-4 inline-flex min-h-14 items-center font-semibold">
        Ir a mis cotizaciones
      </Link>
    </main>
  );
}
