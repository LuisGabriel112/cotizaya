import Link from "next/link";
import { HojaCotizacion } from "@/components/hoja-cotizacion";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { resumir } from "@/lib/cotizaciones/resumen";
import { CATALOGO_LANDING } from "@/lib/demo/landing";
import { COTIZACIONES_SEMILLA, TALLER } from "@/lib/demo/semilla";
import { formatCentavos } from "@/lib/format";

const titulo = "titulo mt-12 text-3xl";
const enlace = "min-h-14 text-lg font-semibold underline decoration-2 underline-offset-4";

/** La cotización de ejemplo que se le muestra al visitante; solo la pinta el servidor. */
const COTIZACION_EJEMPLO = COTIZACIONES_SEMILLA[0]!;

const PASOS = ["Mides con tu cinta.", "Eliges el trabajo y tecleas las medidas.", "Lo mandas por WhatsApp."];

export function ComoSeUsa() {
  return <section>
    <h2 className={titulo}>Así se cotiza en la obra</h2>
    <ol className="mt-2">
      {PASOS.map((paso, i) => <li key={paso} className="flex items-baseline gap-4 border-b border-dashed border-aluminio py-4">
        <span className="num text-2xl font-bold text-tinta-2">{i + 1}</span>
        <span className="text-xl">{paso}</span>
      </li>)}
    </ol>
    <p className="mt-4 text-lg text-tinta-2">De la medida al mensaje sin pasar por la libreta ni por la computadora del taller.</p>
  </section>;
}

export function LoQueRecibeElCliente() {
  return <section>
    <h2 className={titulo}>Lo que le llega a tu cliente</h2>
    <p className="mt-2 text-lg">Un enlace y un PDF con el desglose partida por partida, tu nombre y tus condiciones de pago. No una foto de la libreta.</p>
    <p className="mt-6 text-base text-tinta-2">Cotización de ejemplo</p>
    <div className="mt-2">
      <HojaCotizacion cotizacion={COTIZACION_EJEMPLO} resumen={resumir(COTIZACION_EJEMPLO, CATALOGO_LANDING)} taller={TALLER} catalogo={CATALOGO_LANDING} />
    </div>
    <Link className={`${enlace} mt-4 block`} href={`/demo/c/${COTIZACION_EJEMPLO.slug}`}>Ábrela como la ve tu cliente</Link>
  </section>;
}

export function Precio() {
  return <section>
    <h2 className={titulo}>Precio</h2>
    <ReglaCinta className="mt-3" />
    <dl className="mt-1">
      <Renglon nombre="Gratis" detalle="5 cotizaciones al mes" montos={[`${formatCentavos(0)} siempre`]} />
      <Renglon nombre="Fundador" detalle="Cotizaciones sin tope" montos={[`${formatCentavos(9_900)} al mes`, `${formatCentavos(99_000)} al año`]} />
    </dl>
    <p className="mt-4 text-lg">Pagas con tarjeta, en OXXO o por transferencia. Si no te sirve, lo dejas y no pagas el mes que sigue.</p>
  </section>;
}

function Renglon({ nombre, detalle, montos }: { nombre: string; detalle: string; montos: string[] }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-aluminio py-3">
    <dt><span className="titulo text-xl">{nombre}</span> <span className="text-base text-tinta-2">{detalle}</span></dt>
    <dd className="num text-right text-xl font-bold">{montos.map((monto) => <span key={monto} className="block">{monto}</span>)}</dd>
  </div>;
}

const PREGUNTAS = [
  ["¿Necesito internet en la obra?", "Para guardar y mandar la cotización, sí. La app es ligera y jala con datos del celular."],
  ["¿Puedo cambiar mis precios?", "Cuando quieras, desde Precios. Las cotizaciones que ya mandaste conservan el precio con que las hiciste."],
  ["¿Sale mi logo?", "Sí, en el enlace y en el PDF, con tus condiciones de pago y tu teléfono."],
  ["¿Qué pasa cuando se acaban las 5?", "Te avisamos cuando te queden 2. Pasas a fundador o esperas el siguiente mes."],
];

export function Preguntas() {
  return <section>
    <h2 className={titulo}>Lo que preguntan los talleres</h2>
    <dl className="mt-2">
      {PREGUNTAS.map(([pregunta, respuesta]) => <div key={pregunta} className="border-b border-dashed border-aluminio py-4">
        <dt className="titulo text-xl">{pregunta}</dt>
        <dd className="mt-1 text-lg">{respuesta}</dd>
      </div>)}
    </dl>
  </section>;
}

export function Pie() {
  return <footer className="mx-auto mt-12 max-w-md border-t-2 border-tinta px-4 pt-4 pb-32 text-base text-tinta-2">
    <Link className={`${enlace} block text-tinta`} href="/demo">Pruébalo completo, sin registrarte</Link>
    <p className="mt-4">Los datos de esta página son de ejemplo. Cotiza Ya es para talleres de aluminio de Veracruz.</p>
  </footer>;
}
