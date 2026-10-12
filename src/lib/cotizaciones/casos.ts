import { calcularPartida } from "@/lib/quote";
import { crearCatalogo } from "./catalogo";
import type { CambiosCotizacion } from "./estado";
import type { PartidaConFoto, RepositorioCotizaciones } from "./puerto";
import { aPartidaEntrada, resumir } from "./resumen";
import type { Cotizacion, FotoMaterial, PartidaGuardada } from "./tipos";

export class ErrorDeCaso extends Error {
  constructor(readonly codigo: "cotizacion-inexistente" | "material-inexistente") {
    super(codigo);
  }
}

// Las partidas guardadas traen su foto de material: los totales no dependen del catálogo de hoy.
const SOLO_FOTOS = crearCatalogo([], []);

async function exigirCotizacion(repo: RepositorioCotizaciones, id: string): Promise<Cotizacion> {
  const c = await repo.porId(id);
  if (!c) throw new ErrorDeCaso("cotizacion-inexistente");
  return c;
}

/** El precio lo pone el servidor: el de la partida si ya existía con ese material, si no el del catálogo. */
async function fotoPara(repo: RepositorioCotizaciones, entrada: PartidaGuardada, previa?: PartidaGuardada): Promise<FotoMaterial> {
  if (previa?.material && previa.materialId === entrada.materialId) return previa.material;
  const m = await repo.material(entrada.materialId);
  if (!m) throw new ErrorDeCaso("material-inexistente");
  return { unidad: m.unidad, precioCentavos: m.precioCentavos, ...(m.pieza ? { pieza: m.pieza } : {}) };
}

function importeDe(p: PartidaConFoto): number {
  const r = calcularPartida(aPartidaEntrada(p, SOLO_FOTOS));
  return r.ok ? r.importeCentavos : 0;
}

async function recalcular(repo: RepositorioCotizaciones, id: string): Promise<void> {
  const c = await exigirCotizacion(repo, id);
  await repo.guardarTotales(id, resumir(c, SOLO_FOTOS).totales);
}

async function guardarPartida(repo: RepositorioCotizaciones, quoteId: string, entrada: PartidaGuardada): Promise<PartidaConFoto> {
  const c = await exigirCotizacion(repo, quoteId);
  const indice = c.partidas.findIndex((p) => p.id === entrada.id);
  const previa = c.partidas[indice];
  const partida: PartidaConFoto = { ...entrada, material: await fotoPara(repo, entrada, previa) };
  const orden = previa ? indice : c.partidas.length;
  await repo.guardarPartida(quoteId, partida, orden, importeDe(partida), !previa);
  await recalcular(repo, quoteId);
  return partida;
}

export function crearCasos(repo: RepositorioCotizaciones) {
  return {
    crear: () => repo.crear(),
    guardarPartida: (quoteId: string, partida: PartidaGuardada) => guardarPartida(repo, quoteId, partida),
    quitarPartida: async (quoteId: string, partidaId: string) => {
      await repo.quitarPartida(quoteId, partidaId);
      await recalcular(repo, quoteId);
    },
    editar: async (id: string, cambios: CambiosCotizacion) => {
      await repo.editar(id, cambios);
      await recalcular(repo, id);
    },
    marcarEnviada: (id: string) => repo.marcarEnviada(id),
    avisoVisto: (id: string) => repo.apagarAviso(id),
  };
}
