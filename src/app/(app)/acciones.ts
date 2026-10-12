"use server";

import { redirect } from "next/navigation";
import { crearCasos } from "@/lib/cotizaciones/casos";
import { esquemaCambios, esquemaId, esquemaPartida } from "@/lib/cotizaciones/esquemas";
import type { CambiosCotizacion } from "@/lib/cotizaciones/estado";
import type { PartidaConFoto } from "@/lib/cotizaciones/puerto";
import type { Cotizacion, PartidaGuardada } from "@/lib/cotizaciones/tipos";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { RepositorioSupabase } from "@/lib/server/supabase/repositorio";
import { exigirTaller } from "@/lib/server/supabase/sesion";

// Todo lo que llega del navegador se valida con Zod; RLS vuelve a acotar en la base.

async function casosDeSesion() {
  const db = await clienteServidor();
  const { workshopId } = await exigirTaller(db);
  return crearCasos(new RepositorioSupabase(db, workshopId));
}

export async function crearCotizacion(): Promise<Cotizacion> {
  return (await casosDeSesion()).crear();
}

export async function guardarPartida(quoteId: string, partida: PartidaGuardada): Promise<PartidaConFoto> {
  return (await casosDeSesion()).guardarPartida(esquemaId.parse(quoteId), esquemaPartida.parse(partida));
}

export async function quitarPartida(quoteId: string, partidaId: string): Promise<void> {
  await (await casosDeSesion()).quitarPartida(esquemaId.parse(quoteId), esquemaId.parse(partidaId));
}

export async function editarCotizacion(id: string, cambios: CambiosCotizacion): Promise<void> {
  await (await casosDeSesion()).editar(esquemaId.parse(id), esquemaCambios.parse(cambios));
}

export async function marcarEnviada(id: string): Promise<void> {
  await (await casosDeSesion()).marcarEnviada(esquemaId.parse(id));
}

export async function avisoVisto(id: string): Promise<void> {
  await (await casosDeSesion()).avisoVisto(esquemaId.parse(id));
}

export async function salir(): Promise<void> {
  await (await clienteServidor()).auth.signOut();
  redirect("/entrar");
}
