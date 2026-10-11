import type { Estado } from "@/lib/demo/tipos";

const TEXTO: Record<Estado, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  vista: "Vista",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const BORDE: Record<Estado, string> = {
  borrador: "border-dashed border-tinta-2",
  enviada: "border-tinta",
  vista: "border-tinta",
  aceptada: "border-verde",
  rechazada: "border-rojo",
};

/** Etiqueta de estado tipo cinta adhesiva. El texto lleva el significado; el color solo refuerza. */
export function CintaEstado({ estado }: { estado: Estado }) {
  return (
    <span
      className={`titulo inline-block -rotate-1 border-2 bg-papel-2 px-2 py-px text-base leading-tight text-tinta ${BORDE[estado]} ${estado === "aceptada" || estado === "rechazada" ? "border-[3px]" : ""}`}
    >
      {TEXTO[estado]}
    </span>
  );
}
