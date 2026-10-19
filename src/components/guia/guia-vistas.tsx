import type { JSX, Ref } from "react";
import { Boton } from "@/components/ui/boton";
import type { Paso } from "@/lib/guia/pasos";
import { rotuloPaso, type Colocacion, type Rect } from "@/lib/guia/recorrido";

export interface PropsGuiaVista {
  paso: Paso;
  indice: number;
  total: number;
  hueco: Rect;
  tapas: Rect[];
  colocacion: Colocacion;
  refHoja?: Ref<HTMLElement>;
  onSiguiente(): void;
  onAtras(): void;
  onSaltar(): void;
}

export function GuiaVista({ refHoja, ...p }: PropsGuiaVista): JSX.Element {
  return <>
    {p.tapas.map((tapa, indice) => <div key={indice} data-guia-tapa aria-hidden="true" style={tapa} className="fixed bg-tinta/80 pointer-events-auto" />)}
    <div id="guia-marco" aria-hidden="true" style={p.hueco} className="pointer-events-none fixed rounded-sm border-4 border-amarillo">
      <div className="h-full w-full rounded-sm border-2 border-tinta" />
    </div>
    <section id="guia-hoja" ref={refHoja} data-lado={p.colocacion.lado} style={{ bottom: p.colocacion.bottom }}
      className="fixed inset-x-4 mx-auto max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto rounded-sm border-2 border-tinta bg-papel p-4 text-tinta pointer-events-auto">
      <CabeceraGuia {...p} />
      <h2 id="guia-titulo" className="titulo text-2xl leading-none">{p.paso.titulo}</h2>
      <p id="guia-texto" className="mt-2 text-lg">{p.paso.texto}</p>
      <AccionesGuia {...p} />
      {/* El foco se queda en Sigue al cambiar de paso: el lector de pantalla oye el paso nuevo completo por aquí. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">{`${rotuloPaso(p.indice, p.total)}. ${p.paso.titulo}. ${p.paso.texto}`}</p>
    </section>
  </>;
}

function CabeceraGuia(p: PropsGuiaVista) {
  return <div className="flex min-h-14 items-center justify-between">
    <span className="num text-base text-tinta-2">{rotuloPaso(p.indice, p.total)}</span>
    {p.indice < p.total - 1 && <button id="guia-saltar" type="button" onClick={p.onSaltar}
      className="min-h-14 px-2 text-base text-tinta underline">Saltar guía</button>}
  </div>;
}

function AccionesGuia(p: PropsGuiaVista) {
  return <div className="mt-4 flex gap-2">
    {p.indice > 0 && <Boton id="guia-atras" variante="secundario" onClick={p.onAtras}>Atrás</Boton>}
    <Boton id="guia-siguiente" variante="tinta" className="flex-1" onClick={p.onSiguiente}>
      {p.indice === p.total - 1 ? "Entendido" : "Sigue"}
    </Boton>
  </div>;
}
