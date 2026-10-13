import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cotizacion, Plantilla, Taller } from "@/lib/cotizaciones/tipos";
import type { Material } from "@/lib/quote";
import { aCotizacion, aMaterial, aPlantillas, aTaller, type FilaMaterial, type FilaPlantilla, type FilaQuote, type FilaTaller } from "./mapeo";
import { SELECT_COTIZACION, sinError } from "./repositorio";

/** Lo que la app necesita al abrir: viaja del servidor al proveedor del navegador. */
export interface DatosApp {
  taller: Taller;
  materiales: Material[];
  plantillas: Plantilla[];
  cotizaciones: Cotizacion[];
}

// Suficiente para la lista; las viejas se archivarán cuando haga falta paginar.
const LIMITE_COTIZACIONES = 200;

export async function cargarDatosApp(db: SupabaseClient, workshopId: string): Promise<DatosApp> {
  // Un admin ve todo por RLS: cada consulta se acota al taller de la sesión.
  const [taller, materiales, plantillas, cotizaciones] = await Promise.all([
    db.from("workshops").select("nombre, ciudad, telefono, condiciones, plan, logo_url, plan_until").eq("id", workshopId).single<FilaTaller>(),
    db.from("materials").select("*").eq("workshop_id", workshopId).order("nombre").returns<FilaMaterial[]>(),
    db.from("item_templates").select("*").or(`workshop_id.is.null,workshop_id.eq.${workshopId}`).returns<FilaPlantilla[]>(),
    db.from("quotes").select(SELECT_COTIZACION).eq("workshop_id", workshopId).order("folio", { ascending: false }).limit(LIMITE_COTIZACIONES).returns<FilaQuote[]>(),
  ]);
  const filasMaterial = sinError(materiales) ?? [];
  return {
    taller: aTaller(sinError(taller)!),
    materiales: filasMaterial.map(aMaterial),
    plantillas: aPlantillas(sinError(plantillas) ?? [], filasMaterial),
    cotizaciones: (sinError(cotizaciones) ?? []).map(aCotizacion),
  };
}
