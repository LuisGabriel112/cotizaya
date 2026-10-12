import type { SupabaseClient } from "@supabase/supabase-js";

export type Sesion = { tipo: "sin-sesion" } | { tipo: "sin-taller"; usuarioId: string } | { tipo: "taller"; usuarioId: string; workshopId: string };

/** getClaims verifica el JWT; getSession solo lee la cookie y no sirve para decidir acceso. */
async function usuarioActual(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

export async function leerSesion(supabase: SupabaseClient): Promise<Sesion> {
  const usuarioId = await usuarioActual(supabase);
  if (!usuarioId) return { tipo: "sin-sesion" };
  // Por owner_id y no "lo que deje ver RLS": un admin ve todos los talleres.
  const { data, error } = await supabase.from("workshops").select("id").eq("owner_id", usuarioId).maybeSingle();
  if (error) throw error;
  return data ? { tipo: "taller", usuarioId, workshopId: data.id as string } : { tipo: "sin-taller", usuarioId };
}

export async function exigirTaller(supabase: SupabaseClient): Promise<Extract<Sesion, { tipo: "taller" }>> {
  const sesion = await leerSesion(supabase);
  if (sesion.tipo !== "taller") throw new Error("sin-taller");
  return sesion;
}

export async function esAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("es_admin");
  if (error) throw error;
  return data === true;
}
