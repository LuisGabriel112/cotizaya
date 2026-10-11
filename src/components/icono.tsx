const TRAZOS = {
  atras: "M15 5l-7 7 7 7",
  mas: "M12 5v14M5 12h14",
  menos: "M5 12h14",
  whatsapp:
    "M4 20l1.2-4A8 8 0 1 1 8.4 19zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1.2-.5-2.5-1.8-3-3l1-1-1-2z",
} as const;

/** Íconos de trazo propio, 24 px, mismo grosor que las líneas de la hoja. */
export function Icono({ nombre, className = "size-6" }: { nombre: keyof typeof TRAZOS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
