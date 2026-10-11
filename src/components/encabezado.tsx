import Link from "next/link";
import type { ReactNode } from "react";
import { Icono } from "./icono";

/** Encabezado de pantalla: regreso opcional, rótulo y un elemento a la derecha (folio). */
export function Encabezado({ titulo, atras, derecha }: { titulo: string; atras?: { href: string; texto: string }; derecha?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1 pt-2">
      {atras && (
        <Link href={atras.href} className="-ml-2 inline-flex min-h-14 items-center gap-1 self-start px-2 font-medium no-underline">
          <Icono nombre="atras" />
          {atras.texto}
        </Link>
      )}
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo text-4xl leading-none">{titulo}</h1>
        {derecha}
      </div>
    </header>
  );
}
