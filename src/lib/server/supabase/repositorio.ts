import type { SupabaseClient } from "@supabase/supabase-js";
import type { CambiosCotizacion } from "@/lib/cotizaciones/estado";
import type { PartidaConFoto, RepositorioCotizaciones } from "@/lib/cotizaciones/puerto";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import type { Material, Totales } from "@/lib/quote";
import { aCambiosFila, aCotizacion, aFilaPartida, aMaterial, type FilaMaterial, type FilaQuote } from "./mapeo";

export const SELECT_COTIZACION = "*, quote_items(*)";

interface Respuesta<T> {
  data: T | null;
  error: { message: string } | null;
}

export function sinError<T>({ data, error }: Respuesta<T>): T | null {
  if (error) throw new Error(error.message);
  return data;
}

/** Puerto de cotizaciones sobre Supabase. RLS ya limita todo al taller; workshopId solo se usa al insertar. */
export class RepositorioSupabase implements RepositorioCotizaciones {
  constructor(
    private readonly db: SupabaseClient,
    private readonly workshopId: string,
  ) {}

  async crear(): Promise<Cotizacion> {
    const fila = sinError(await this.db.from("quotes").insert({ workshop_id: this.workshopId }).select(SELECT_COTIZACION).single<FilaQuote>());
    return aCotizacion(fila!);
  }

  async porId(id: string): Promise<Cotizacion | null> {
    const fila = sinError(await this.db.from("quotes").select(SELECT_COTIZACION).eq("id", id).maybeSingle<FilaQuote>());
    return fila ? aCotizacion(fila) : null;
  }

  async material(id: string): Promise<Material | null> {
    const fila = sinError(await this.db.from("materials").select("*").eq("id", id).maybeSingle<FilaMaterial>());
    return fila ? aMaterial(fila) : null;
  }

  async guardarPartida(quoteId: string, p: PartidaConFoto, orden: number, importeCentavos: number, nueva: boolean): Promise<void> {
    const fila = aFilaPartida(p, orden, importeCentavos);
    const items = this.db.from("quote_items");
    // Update sin quote_id ni workshop_id: la base no deja mover una partida de cotización.
    const consulta = nueva
      ? items.insert({ ...fila, id: p.id, quote_id: quoteId, workshop_id: this.workshopId })
      : items.update(fila).eq("id", p.id).eq("quote_id", quoteId);
    sinError(await consulta);
  }

  async quitarPartida(quoteId: string, partidaId: string): Promise<void> {
    sinError(await this.db.from("quote_items").delete().eq("id", partidaId).eq("quote_id", quoteId));
  }

  async editar(id: string, cambios: CambiosCotizacion): Promise<void> {
    sinError(await this.db.from("quotes").update(aCambiosFila(cambios)).eq("id", id));
  }

  async guardarTotales(id: string, t: Totales): Promise<void> {
    const fila = { subtotal_centavos: t.subtotalCentavos, descuento_centavos: t.descuentoCentavos, iva_centavos: t.ivaCentavos, total_centavos: t.totalCentavos };
    sinError(await this.db.from("quotes").update(fila).eq("id", id));
  }

  async marcarEnviada(id: string): Promise<void> {
    sinError(await this.db.from("quotes").update({ status: "enviada" }).eq("id", id).eq("status", "borrador"));
    sinError(await this.db.from("quote_events").insert({ quote_id: id, workshop_id: this.workshopId, tipo: "enviada" }));
  }

  async apagarAviso(id: string): Promise<void> {
    sinError(await this.db.from("quotes").update({ aviso_pendiente: false }).eq("id", id));
  }
}
