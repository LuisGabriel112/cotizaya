"use server";

import { clienteServidor } from "@/lib/server/supabase/cliente";
import { esSlugValido } from "@/lib/server/supabase/publica";
import { sinError } from "@/lib/server/supabase/repositorio";

// El cliente del taller no tiene cuenta: estas llamadas corren como anónimo y la base
// solo deja tocar la cotización de ese slug.

export async function registrarApertura(slug: string): Promise<void> {
  if (!esSlugValido(slug)) return;
  sinError(await (await clienteServidor()).rpc("registrar_apertura", { p_slug: slug }));
}

export async function aceptarCotizacion(slug: string): Promise<void> {
  if (!esSlugValido(slug)) return;
  sinError(await (await clienteServidor()).rpc("aceptar_cotizacion", { p_slug: slug }));
}
