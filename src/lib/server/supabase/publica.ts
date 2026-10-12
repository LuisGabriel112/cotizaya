import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cotizacion, Taller } from "@/lib/cotizaciones/tipos";
import { aVistaPublica, type JsonPublico } from "./mapeo";
import { sinError } from "./repositorio";

// Forma del slug que genera asignar_folio_y_slug(): folio con 4+ cifras y 12 hex.
const SLUG = /^\d{4,}-[0-9a-f]{12}$/;

export const esSlugValido = (slug: string) => SLUG.test(slug);

export interface VistaPublica {
  cotizacion: Cotizacion;
  taller: Taller;
}

export async function leerVistaPublica(db: SupabaseClient, slug: string): Promise<VistaPublica | null> {
  if (!esSlugValido(slug)) return null;
  const json = sinError(await db.rpc("cotizacion_publica", { p_slug: slug })) as JsonPublico | null;
  return json ? aVistaPublica(json) : null;
}
