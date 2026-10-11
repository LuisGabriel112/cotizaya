import { formatFolio } from "@/lib/format";

/** Sello rojo de folio: borde doble, rotado −2°. */
export function Folio({ folio, className = "" }: { folio: number; className?: string }) {
  return (
    <span
      className={`titulo inline-block -rotate-2 rounded-sm border-4 border-double border-rojo px-2.5 py-0.5 text-2xl font-extrabold whitespace-nowrap text-rojo ${className}`}
    >
      No. <span className="num font-bold">{formatFolio(folio)}</span>
    </span>
  );
}
