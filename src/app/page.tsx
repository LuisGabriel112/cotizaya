import { formatCentavos, formatMetros } from "@/lib/format";

// Pantalla de arranque de la fase 0: solo comprueba tokens y fuentes.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <h1 className="titulo text-4xl">Cotiza Ya</h1>
      <p className="text-lg text-tinta-2">Cotiza en obra y mándalo por WhatsApp.</p>

      <dl className="border-y-2 border-tinta">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-aluminio py-3">
          <dt>Ventana corrediza</dt>
          <dd className="num text-right">
            {formatMetros(120)} × {formatMetros(150)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="titulo text-xl">Total</dt>
          <dd className="num text-right text-2xl font-bold">{formatCentavos(486000)}</dd>
        </div>
      </dl>
    </main>
  );
}
