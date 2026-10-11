/** Separador de sección: regla de cinta métrica. */
export function ReglaCinta({ className = "" }: { className?: string }) {
  return <div role="separator" className={`regla-cinta ${className}`} />;
}
