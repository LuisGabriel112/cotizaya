import type { Croquis as TipoCroquis } from "@/lib/cotizaciones/tipos";

/** Croquis de línea de cada plantilla, a mano alzada de taller: trazo de 2 px en tinta. */
export function Croquis({ tipo, className = "" }: { tipo: TipoCroquis; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
    >
      {DIBUJOS[tipo]}
    </svg>
  );
}

const DIBUJOS: Record<TipoCroquis, React.ReactNode> = {
  // Dos hojas que se traslapan al centro, flecha de corrimiento.
  corrediza: (
    <>
      <rect x="3" y="5" width="42" height="30" />
      <path d="M22 8v24M26 8v24M22 8h-16v24h16M26 8h16v24h-16" />
      <path d="M9 20h8M14 17l3 3-3 3" />
    </>
  ),
  // Cancel alto con jaladera.
  cancel: (
    <>
      <rect x="10" y="2" width="28" height="36" />
      <path d="M24 2v36M28 16v8" />
    </>
  ),
  // Marco con malla.
  mosquitero: (
    <>
      <rect x="4" y="5" width="40" height="30" />
      <path d="M4 13h40M4 20h40M4 27h40M14 5v30M24 5v30M34 5v30" strokeWidth={1} />
    </>
  ),
  // Puerta con abatimiento punteado.
  abatible: (
    <>
      <rect x="12" y="2" width="22" height="36" />
      <path d="M12 2l18 18-18 18" strokeDasharray="3 3" strokeWidth={1.5} />
      <path d="M30 18v4" />
    </>
  ),
  // Rodamiento sobre riel y tira de felpa.
  felpa: (
    <>
      <path d="M3 30h42" />
      <circle cx="16" cy="23" r="6" />
      <circle cx="16" cy="23" r="1.5" />
      <path d="M28 10v14M31 10v14M34 10v14M37 10v14" strokeWidth={1.5} />
    </>
  ),
  // Perfil en L con picaduras de salitre.
  corrosion: (
    <>
      <path d="M8 4v32h32v-8H16V4z" />
      <path d="M11 12h1M12 20h1M10 27h1M22 32h1M30 31h1" strokeWidth={2.5} />
    </>
  ),
};
