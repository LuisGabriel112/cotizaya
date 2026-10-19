import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "tinta";

const base =
  "titulo inline-flex min-h-14 items-center justify-center gap-2 rounded-sm border-2 border-tinta px-6 text-xl leading-none select-none transition-transform duration-75 active:translate-y-0.5 disabled:cursor-not-allowed disabled:border-tinta-2 disabled:bg-papel-2 disabled:text-tinta-2 disabled:active:translate-y-0";

const variantes: Record<Variante, string> = {
  principal: "bg-amarillo text-tinta",
  secundario: "bg-papel text-tinta active:bg-papel-2",
  tinta: "bg-tinta text-papel",
};

export function clasesBoton(variante: Variante = "principal", extra = "") {
  return `${base} ${variantes[variante]} ${extra}`;
}

type BotonProps = ComponentProps<"button"> & { variante?: Variante };

export function Boton({ variante = "principal", className = "", type = "button", ...props }: BotonProps) {
  return <button type={type} className={clasesBoton(variante, className)} {...props} />;
}

type BotonEnlaceProps = ComponentProps<typeof Link> & { variante?: Variante };

export function BotonEnlace({ variante = "principal", className = "", ...props }: BotonEnlaceProps) {
  return <Link className={clasesBoton(variante, `no-underline ${className}`)} {...props} />;
}
