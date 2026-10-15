"use server";

import { revalidatePath } from "next/cache";
import { crearCasosCatalogo, type EntradaMaterial, type ResultadoCatalogo } from "@/lib/catalogo/casos";
import { esquemaId } from "@/lib/cotizaciones/esquemas";
import { RepositorioCatalogoSupabase } from "@/lib/server/catalogo/repositorio";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { exigirTaller } from "@/lib/server/supabase/sesion";

async function casosDeSesion() {
  const db = await clienteServidor();
  const { workshopId } = await exigirTaller(db);
  return crearCasosCatalogo(new RepositorioCatalogoSupabase(db, workshopId));
}

function terminar(resultado: ResultadoCatalogo): ResultadoCatalogo {
  if (resultado.ok) revalidatePath("/precios");
  return resultado;
}

export async function agregarMaterial(entrada: EntradaMaterial): Promise<ResultadoCatalogo> {
  return terminar(await (await casosDeSesion()).agregar(entrada));
}

export async function cambiarPrecio(id: string, precio: string): Promise<ResultadoCatalogo> {
  return terminar(await (await casosDeSesion()).cambiarPrecio(esquemaId.parse(id), precio));
}

export async function quitarMaterial(id: string): Promise<ResultadoCatalogo> {
  return terminar(await (await casosDeSesion()).quitar(esquemaId.parse(id)));
}
