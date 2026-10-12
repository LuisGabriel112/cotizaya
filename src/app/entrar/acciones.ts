"use server";

import { z } from "zod";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { sinError } from "@/lib/server/supabase/repositorio";

const esquemaNombre = z.string().trim().min(2).max(80);

export type Continuacion = "listo" | "pide-nombre";

/**
 * Después del código: liga el taller que el admin dio de alta con este teléfono,
 * o crea uno nuevo si ya trae nombre.
 */
export async function continuarConTaller(nombre?: string): Promise<Continuacion> {
  const parametros = nombre === undefined ? {} : { p_nombre: esquemaNombre.parse(nombre) };
  const id = sinError(await (await clienteServidor()).rpc("reclamar_o_crear_taller", parametros));
  return id ? "listo" : "pide-nombre";
}
