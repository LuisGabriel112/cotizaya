"use client";

import { useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, type Dispatch } from "react";
import { Guia } from "@/components/guia/guia";
import type { MaterialGuardado, ResultadoCatalogo } from "@/lib/catalogo/casos";
import { ejecutarOperacion, ESTADO_INICIAL, reducirEditor, type AccionEditor } from "@/lib/catalogo/editor";
import { agregarMaterial, cambiarPrecio, quitarMaterial } from "./acciones";
import { FormularioNuevo, FormularioPrecio, Lista } from "./vistas";

async function operar(accion: () => Promise<ResultadoCatalogo>, texto: string, enviar: Dispatch<AccionEditor>, refrescar: () => void) {
  enviar({ tipo: "empezar", texto });
  const resultado = await ejecutarOperacion(accion);
  if (!resultado.ok) return enviar({ tipo: "fallar", mensaje: resultado.mensaje });
  enviar({ tipo: "terminar" });
  refrescar();
}

function useFocoRetorno(tipo: string, enviar: Dispatch<AccionEditor>) {
  const focoAlVolver = useRef<string | null>(null);
  useEffect(() => {
    if (tipo !== "lista" || !focoAlVolver.current) return;
    document.getElementById(focoAlVolver.current)?.focus();
    focoAlVolver.current = null;
  }, [tipo]);
  const abrir = (material: MaterialGuardado) => { focoAlVolver.current = `material-${material.id}`; enviar({ tipo: "abrir-precio", material }); };
  const abrirNuevo = () => { focoAlVolver.current = "agregar-material"; enviar({ tipo: "abrir-nuevo" }); };
  return { abrir, abrirNuevo };
}

export function EditorCatalogo({ grupos }: { grupos: { linea: string; materiales: MaterialGuardado[] }[] }) {
  const [estado, enviar] = useReducer(reducirEditor, ESTADO_INICIAL);
  const router = useRouter();
  const pantalla = estado.pantalla;
  const { abrir, abrirNuevo } = useFocoRetorno(pantalla.tipo, enviar);
  const ejecutar = (accion: () => Promise<ResultadoCatalogo>, texto: string) => operar(accion, texto, enviar, () => router.refresh());
  const cancelar = () => enviar({ tipo: "cancelar" });
  return <>
    {pantalla.tipo === "lista" && <Lista grupos={grupos} abrir={abrir} abrirNuevo={abrirNuevo} />}
    {pantalla.tipo === "lista" && <Guia id="precios" />}
    {pantalla.tipo === "precio" && <FormularioPrecio material={pantalla.material} precio={pantalla.precio} cambiar={(precio) => enviar({ tipo: "cambiar-precio", precio })}
      error={estado.error} ocupado={!!estado.operacion} progreso={estado.operacion} cancelar={cancelar}
      quitar={() => { if (window.confirm("¿Quitar este material?")) void ejecutar(() => quitarMaterial(pantalla.material.id), "Quitando…"); }}
      guardar={() => void ejecutar(() => cambiarPrecio(pantalla.material.id, pantalla.precio), "Guardando…")} />}
    {pantalla.tipo === "nuevo" && <FormularioNuevo entrada={pantalla.entrada} cambiar={(entrada) => enviar({ tipo: "cambiar-entrada", cambios: entrada })}
      error={estado.error} ocupado={!!estado.operacion} progreso={estado.operacion} cancelar={cancelar}
      guardar={() => void ejecutar(() => agregarMaterial(pantalla.entrada), "Guardando…")} />}
  </>;
}
