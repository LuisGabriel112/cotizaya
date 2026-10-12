import type { Cotizacion, PartidaGuardada } from "./tipos";

// Estado de la lista en el navegador. Lo comparten el prototipo (/demo) y la app real,
// que lo usa para responder al instante mientras el servidor confirma.

export type CambiosCotizacion = Partial<Pick<Cotizacion, "cliente" | "descuentoPct" | "conIva" | "acabado" | "garantiaSalitre">>;

export type Accion =
  | { tipo: "cargar"; cotizaciones: Cotizacion[] }
  | { tipo: "crear"; cotizacion: Cotizacion }
  | { tipo: "guardarPartida"; id: string; partida: PartidaGuardada }
  | { tipo: "quitarPartida"; id: string; partidaId: string }
  | { tipo: "editar"; id: string; cambios: CambiosCotizacion }
  | { tipo: "enviada"; id: string }
  | { tipo: "abierta"; slug: string; en: string }
  | { tipo: "avisoVisto"; id: string }
  | { tipo: "aceptada"; slug: string };

export interface EstadoLista {
  listo: boolean;
  cotizaciones: Cotizacion[];
}

type Lista = Cotizacion[];
type Manejadores = { [T in Accion["tipo"]]: (lista: Lista, a: Extract<Accion, { tipo: T }>) => Lista };

const cambiar = (lista: Lista, id: string, f: (c: Cotizacion) => Cotizacion) => lista.map((c) => (c.id === id ? f(c) : c));
const cambiarPorSlug = (lista: Lista, slug: string, f: (c: Cotizacion) => Cotizacion) =>
  lista.map((c) => (c.slug === slug ? f(c) : c));

function ponerPartida(c: Cotizacion, partida: PartidaGuardada): Cotizacion {
  const existe = c.partidas.some((p) => p.id === partida.id);
  const partidas = existe ? c.partidas.map((p) => (p.id === partida.id ? partida : p)) : [...c.partidas, partida];
  return { ...c, partidas };
}

function abrir(c: Cotizacion, en: string): Cotizacion {
  const avanza = c.estado === "enviada" || c.estado === "borrador";
  return { ...c, vistaEn: en, avisoPendiente: true, estado: avanza ? "vista" : c.estado };
}

const MANEJADORES: Manejadores = {
  cargar: (_, a) => a.cotizaciones,
  crear: (lista, a) => [a.cotizacion, ...lista],
  guardarPartida: (lista, a) => cambiar(lista, a.id, (c) => ponerPartida(c, a.partida)),
  quitarPartida: (lista, a) => cambiar(lista, a.id, (c) => ({ ...c, partidas: c.partidas.filter((p) => p.id !== a.partidaId) })),
  editar: (lista, a) => cambiar(lista, a.id, (c) => ({ ...c, ...a.cambios })),
  enviada: (lista, a) => cambiar(lista, a.id, (c) => (c.estado === "borrador" ? { ...c, estado: "enviada" } : c)),
  abierta: (lista, a) => cambiarPorSlug(lista, a.slug, (c) => abrir(c, a.en)),
  avisoVisto: (lista, a) => cambiar(lista, a.id, (c) => ({ ...c, avisoPendiente: false })),
  aceptada: (lista, a) => cambiarPorSlug(lista, a.slug, (c) => ({ ...c, estado: "aceptada", avisoPendiente: true })),
};

export function reducir(estado: EstadoLista, a: Accion): EstadoLista {
  const manejar = MANEJADORES[a.tipo] as (lista: Lista, a: Accion) => Lista;
  return { listo: estado.listo || a.tipo === "cargar", cotizaciones: manejar(estado.cotizaciones, a) };
}
