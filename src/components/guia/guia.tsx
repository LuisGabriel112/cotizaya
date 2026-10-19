"use client";

import { useRef } from "react";
import { CLAVE_GUIA, type IdGuia, type Paso } from "@/lib/guia/pasos";
import { GuiaVista } from "./guia-vistas";
import { useDialogo } from "./use-dialogo";
import { useMedida } from "./use-medida";
import { EVENTO_GUIAS, useVistas } from "./use-vistas";

export function reiniciarGuias(): void {
  try {
    localStorage.removeItem(CLAVE_GUIA);
  } catch {
    // Reiniciar no debe impedir usar la lista si el almacenamiento está bloqueado.
  }
  window.dispatchEvent(new Event(EVENTO_GUIAS));
}

export function Guia({ id, listo = true }: { id: IdGuia; listo?: boolean }) {
  const control = useVistas(id, listo);
  const paso = control.recorrido?.pasos[control.recorrido.indice];
  if (!listo || !control.recorrido || !paso) return null;
  return <GuiaAbierta paso={paso} indice={control.recorrido.indice} total={control.recorrido.pasos.length}
    onSiguiente={control.siguiente} onAtras={control.atras} onSaltar={control.cerrar} />;
}

interface PropsAbierta {
  paso: Paso;
  indice: number;
  total: number;
  onSiguiente(): void;
  onAtras(): void;
  onSaltar(): void;
}

function GuiaAbierta(props: PropsAbierta) {
  const refDialogo = useRef<HTMLDialogElement>(null);
  useDialogo(refDialogo, props.indice, props.paso.objetivo, props.onSaltar);
  const { medida, refHoja } = useMedida(props.paso);
  return <dialog ref={refDialogo} aria-labelledby="guia-titulo" aria-describedby="guia-texto"
    className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 pointer-events-none">
    <GuiaVista {...props} {...medida} refHoja={refHoja} />
  </dialog>;
}
