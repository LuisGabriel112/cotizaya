import type { CambiosCotizacion, Accion } from "./estado";
import type { AccionesCotizaciones } from "./fuente";
import type { Cotizacion, PartidaGuardada } from "./tipos";

/** Las Server Actions que confirman cada cambio; se inyectan para probar sin red. */
export interface ServidorCotizaciones {
  crearCotizacion: () => Promise<Cotizacion>;
  guardarPartida: (id: string, partida: PartidaGuardada) => Promise<PartidaGuardada>;
  quitarPartida: (id: string, partidaId: string) => Promise<void>;
  marcarEnviada: (id: string) => Promise<void>;
  avisoVisto: (id: string) => Promise<void>;
}

interface Dependencias {
  despachar: (accion: Accion) => void;
  servidor: ServidorCotizaciones;
  agrupador: { agregar: (id: string, cambios: CambiosCotizacion) => void };
  alFallar: () => void;
}

/** Responde al instante con el reductor local y confirma con el servidor detrás. */
export function crearAccionesOptimistas({ despachar, servidor, agrupador, alFallar }: Dependencias): AccionesCotizaciones {
  const atras = (p: Promise<unknown>) => void p.catch(alFallar);
  return {
    crear: async () => {
      const cotizacion = await servidor.crearCotizacion();
      despachar({ tipo: "crear", cotizacion });
      return cotizacion.id;
    },
    guardarPartida: (id, partida) => {
      despachar({ tipo: "guardarPartida", id, partida });
      // El servidor regresa la partida con la foto del precio: esa es la que queda.
      atras(servidor.guardarPartida(id, partida).then((conFoto) => despachar({ tipo: "guardarPartida", id, partida: conFoto })));
    },
    quitarPartida: (id, partidaId) => {
      despachar({ tipo: "quitarPartida", id, partidaId });
      atras(servidor.quitarPartida(id, partidaId));
    },
    editar: (id, cambios) => {
      despachar({ tipo: "editar", id, cambios });
      agrupador.agregar(id, cambios);
    },
    marcarEnviada: (id) => {
      despachar({ tipo: "enviada", id });
      atras(servidor.marcarEnviada(id));
    },
    avisoVisto: (id) => {
      despachar({ tipo: "avisoVisto", id });
      atras(servidor.avisoVisto(id));
    },
  };
}
