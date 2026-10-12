import type { Material, Totales } from "@/lib/quote";
import type { CambiosCotizacion } from "./estado";
import type { Cotizacion, FotoMaterial, PartidaGuardada } from "./tipos";

export type PartidaConFoto = PartidaGuardada & { material: FotoMaterial };

/**
 * Lo que los casos de uso necesitan de la base. La implementación real (Supabase)
 * ya está acotada al taller de la sesión por RLS.
 */
export interface RepositorioCotizaciones {
  crear(): Promise<Cotizacion>;
  porId(id: string): Promise<Cotizacion | null>;
  material(id: string): Promise<Material | null>;
  guardarPartida(quoteId: string, partida: PartidaConFoto, orden: number, importeCentavos: number, nueva: boolean): Promise<void>;
  quitarPartida(quoteId: string, partidaId: string): Promise<void>;
  editar(id: string, cambios: CambiosCotizacion): Promise<void>;
  guardarTotales(id: string, totales: Totales): Promise<void>;
  marcarEnviada(id: string): Promise<void>;
  apagarAviso(id: string): Promise<void>;
}
