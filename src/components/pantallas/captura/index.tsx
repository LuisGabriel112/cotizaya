"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Encabezado } from "@/components/encabezado";
import { Guia } from "@/components/guia/guia";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { Folio } from "@/components/ui/folio";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { RenglonPartida } from "@/components/ui/renglon-partida";
import { Total } from "@/components/ui/total";
import type { CambiosCotizacion } from "@/lib/cotizaciones/estado";
import { useCotizacion, useFuente } from "@/lib/cotizaciones/fuente";
import { nuevoUuid } from "@/lib/cotizaciones/ids";
import { resumir, type Resumen } from "@/lib/cotizaciones/resumen";
import type { Cotizacion, PartidaGuardada, Plantilla } from "@/lib/cotizaciones/tipos";
import { parsearCm } from "@/lib/quote";
import { aGuardada, borradorDePartida, borradorDePlantilla, conBorrador, listaParaGuardar, primerPaso, type Borrador, type PasoMedida } from "./borrador";
import { PreguntaAcabado, PreguntaCliente, PreguntaDescuento, PreguntaMedida, PreguntaTrabajo } from "./preguntas";

type PasoDato = "cliente" | "descuento" | "acabado";
type Paso = { tipo: "trabajo" } | { tipo: PasoMedida; b: Borrador } | { tipo: PasoDato };

const TRABAJO: Paso = { tipo: "trabajo" };
const FORM = "pregunta";
const esDato = (p: Paso): p is { tipo: PasoDato } => p.tipo === "cliente" || p.tipo === "descuento" || p.tipo === "acabado";

export function PantallaCaptura() {
  const { id } = useParams<{ id: string }>();
  const { listo } = useFuente();
  const c = useCotizacion(id);

  if (!listo) return <main className="mx-auto max-w-md px-4" aria-busy="true" />;
  if (!c) return <NoExiste />;
  return <Conversacion c={c} />;
}

/** Al enviar el formulario de la pregunta: a qué paso se sigue, o guardar la partida. */
function siguiente(paso: Paso): Paso | "guardar" | null {
  if (esDato(paso)) return TRABAJO;
  if (paso.tipo === "trabajo") return null;
  if (paso.tipo === "ancho") return parsearCm(paso.b.ancho) !== null ? { tipo: "alto", b: paso.b } : null;
  return listaParaGuardar(paso.b, paso.tipo) ? "guardar" : null;
}

function useConversacion(c: Cotizacion) {
  const { acciones, catalogo } = useFuente();
  const [paso, setPaso] = useState<Paso>(TRABAJO);
  // La partida que se está contestando cae a la hoja desde el primer número, con el total al día.
  const borrador = "b" in paso ? paso.b : undefined;
  const resumen = resumir(borrador ? conBorrador(c, borrador) : c, catalogo);
  const medir = (b: Borrador) => setPaso({ tipo: primerPaso(b, catalogo), b });
  const corregir = (p: PartidaGuardada) => medir(borrador?.partidaId === p.id ? borrador : borradorDePartida(p));
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const sigue = siguiente(paso);
    if (sigue === "guardar" && borrador) acciones.guardarPartida(c.id, aGuardada(borrador));
    if (sigue) setPaso(sigue === "guardar" ? TRABAJO : sigue);
  };
  return { paso, setPaso, borrador, resumen, medir, corregir, enviar };
}

function useDesplazarPregunta(tipo: Paso["tipo"], partidas: number) {
  const preguntaRef = useRef<HTMLElement>(null);
  // Cada respuesta baja la vista a la siguiente pregunta, como en un chat.
  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    preguntaRef.current?.scrollIntoView({ block: "end", behavior: quieto ? "auto" : "smooth" });
  }, [tipo, partidas]);
  return preguntaRef;
}

function Conversacion({ c }: { c: Cotizacion }) {
  const { paso, setPaso, borrador, resumen, medir, corregir, enviar } = useConversacion(c);
  const preguntaRef = useDesplazarPregunta(paso.tipo, c.partidas.length);
  return <main className="mx-auto max-w-md px-4 pb-32">
      <EncabezadoCaptura c={c} />
      <HojaCaptura c={c} resumen={resumen} borrador={borrador} onCliente={() => setPaso({ tipo: "cliente" })} onPartida={corregir} />
      <section ref={preguntaRef} aria-live="polite" className="mt-8 scroll-mb-32 border-t-2 border-tinta pt-4">
        <form id={FORM} onSubmit={enviar} noValidate>
          <PreguntaActual c={c} paso={paso} setPaso={setPaso} medir={medir} />
        </form>
      </section>
      <BarraCaptura c={c} paso={paso} />
      {paso.tipo === "trabajo" && c.partidas.length === 0 && <Guia key="captura" id="captura" />}
      {paso.tipo === "trabajo" && c.partidas.length > 0 && <Guia key="partida" id="partida" />}
      {paso.tipo === "ancho" && <Guia id="medida" />}
    </main>;
}

function EncabezadoCaptura({ c }: { c: Cotizacion }) {
  const { rutas } = useFuente();
  return <Encabezado titulo="Cotización" atras={{ href: rutas.lista, texto: "Cotizaciones" }} derecha={<Folio folio={c.folio} />} />;
}

interface PropsHoja {
  c: Cotizacion;
  resumen: Resumen;
  borrador?: Borrador;
  onCliente: () => void;
  onPartida: (p: PartidaGuardada) => void;
}

/** La hoja: lo ya contestado. */
function HojaCaptura({ c, resumen, borrador, onCliente, onPartida }: PropsHoja) {
  const { totales } = resumen;
  return (
    <section aria-label="Hoja de la cotización" className="mt-4">
      <button data-guia="cliente" type="button" onClick={onCliente} className="flex min-h-14 w-full items-baseline gap-3 text-left">
        <span className="text-tinta-2">Para</span>
        <span className={c.cliente ? "font-semibold" : "text-tinta-2 underline"}>{c.cliente || "Poner nombre del cliente"}</span>
      </button>
      <ReglaCinta className="mt-1" />
      <RenglonesCaptura resumen={resumen} borrador={borrador} onPartida={onPartida} />
      <div data-guia="total" className="mt-3">
        <Total {...totales} descuentoPct={c.descuentoPct} conIva={c.conIva} />
      </div>
    </section>
  );
}

function RenglonesCaptura({ resumen, borrador, onPartida }: Pick<PropsHoja, "resumen" | "borrador" | "onPartida">) {
  if (resumen.renglones.length === 0) {
    return <p className="border-b border-dashed border-aluminio py-4 text-tinta-2">Aún sin partidas. Elige el trabajo aquí abajo.</p>;
  }
  return <ul>{resumen.renglones.map((renglon) => <RenglonCaptura key={renglon.partida.id} {...renglon}
    enCurso={borrador?.partidaId === renglon.partida.id} onPartida={onPartida} />)}</ul>;
}

function RenglonCaptura({ partida, resultado, enCurso, onPartida }: Resumen["renglones"][number] & {
  enCurso: boolean; onPartida: PropsHoja["onPartida"];
}) {
  const { catalogo } = useFuente();
  const material = catalogo.materialDe(partida);
  return <li className="motion-safe:animate-[caer_220ms_cubic-bezier(0.16,1,0.3,1)]">
    <button type="button" onClick={() => onPartida(partida)} aria-label={`Corregir ${partida.descripcion}`}
      aria-current={enCurso ? "true" : undefined} className="block w-full text-left aria-[current=true]:bg-papel-2">
      <RenglonPartida descripcion={partida.descripcion} anchoCm={partida.anchoCm} altoCm={partida.altoCm} cantidad={partida.cantidad}
        unidad={material?.unidad ?? "pieza"} pieza={material?.pieza} resultado={resultado}
        croquis={catalogo.plantilla(partida.plantillaId)?.croquis} enCurso={enCurso} />
    </button>
  </li>;
}

interface PropsPregunta {
  c: Cotizacion;
  paso: Paso;
  setPaso: (p: Paso) => void;
  medir: (b: Borrador) => void;
}

/** La pregunta: solo la siguiente decisión, en grande. */
function PreguntaActual({ c, paso, setPaso, medir }: PropsPregunta) {
  const { acciones } = useFuente();
  const volver = () => setPaso(TRABAJO);
  const editar = (cambios: CambiosCotizacion) => acciones.editar(c.id, cambios);
  const datos = { c, onEditar: editar, onCancelar: volver };

  if (paso.tipo === "cliente") return <PreguntaCliente {...datos} />;
  if (paso.tipo === "descuento") return <PreguntaDescuento {...datos} />;
  if (paso.tipo === "acabado") return <PreguntaAcabado {...datos} />;
  if (paso.tipo === "trabajo") {
    const empezar = (pl: Plantilla) => medir(borradorDePlantilla(pl, nuevoUuid()));
    return <PreguntaTrabajo c={c} onPlantilla={empezar} onExtra={(tipo) => setPaso({ tipo })} onIva={() => editar({ conIva: !c.conIva })} />;
  }
  if (!("b" in paso)) return null;
  const quitar = () => {
    acciones.quitarPartida(c.id, paso.b.partidaId);
    volver();
  };
  return <PreguntaMedida paso={paso.tipo} b={paso.b} onCambio={(b) => setPaso({ tipo: paso.tipo, b })} onCancelar={volver} onQuitar={quitar} />;
}

function BarraCaptura({ c, paso }: { c: Cotizacion; paso: Paso }) {
  const { rutas } = useFuente();
  const router = useRouter();
  return <BarraAccion>
    {paso.tipo === "trabajo" ? <Boton data-guia="ver" disabled={c.partidas.length === 0} onClick={() => router.push(rutas.ver(c.id))}>
      Ver cotización
    </Boton> : <BotonRespuesta paso={paso} />}
  </BarraAccion>;
}

function BotonRespuesta({ paso }: { paso: Exclude<Paso, { tipo: "trabajo" }> }) {
  if (esDato(paso)) return <Boton type="submit" form={FORM}>Listo</Boton>;
  if (paso.tipo === "ancho") return <Boton data-guia="seguir" type="submit" form={FORM} disabled={parsearCm(paso.b.ancho) === null}>Siguiente: alto</Boton>;
  return <Boton type="submit" form={FORM} disabled={!listaParaGuardar(paso.b, paso.tipo)}>
    {paso.b.nueva ? "Agregar partida" : "Guardar cambios"}
  </Boton>;
}

function NoExiste() {
  const { rutas, reiniciarDemo } = useFuente();
  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="titulo text-3xl">No encontramos esta cotización</h1>
      {reiniciarDemo && <p className="mt-2">Puede que se haya borrado al reiniciar los datos de ejemplo.</p>}
      <Link href={rutas.lista} className="mt-4 inline-flex min-h-14 items-center font-semibold">
        Ir a mis cotizaciones
      </Link>
    </main>
  );
}
