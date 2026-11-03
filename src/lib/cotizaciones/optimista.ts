import type { CambiosCotizacion, Accion } from "./estado";
import type { AccionesCotizaciones } from "./fuente";
import type { Cotizacion, PartidaGuardada } from "./tipos";
import { CupoAgotado } from "@/lib/plan/cupo";
import { crearConfirmaciones } from "./confirmaciones";

export type ResultadoCrear = { ok: true; cotizacion: Cotizacion } | { ok: false; motivo: "cupo-agotado" };

/** Las Server Actions que confirman cada cambio; se inyectan para probar sin red. */
export interface ServidorCotizaciones {
  crearCotizacion: () => Promise<ResultadoCrear>;
  revisarCotizacion?: (id:string) => Promise<Cotizacion>;
  guardarPartida: (id: string, partida: PartidaGuardada) => Promise<PartidaGuardada>;
  quitarPartida: (id: string, partidaId: string) => Promise<void>;
  marcarEnviada: (id: string) => Promise<void>;
  avisoVisto: (id: string) => Promise<void>;
}

interface Dependencias {
  despachar: (accion: Accion) => void;
  servidor: ServidorCotizaciones;
  agrupador: { agregar: (id: string, cambios: CambiosCotizacion) => void;vaciar?:(id:string)=>Promise<void> };
  alFallar: () => void;
  alAgotarCupo: () => void;
}

/** Responde al instante con el reductor local y confirma con el servidor detrás. */
export function crearAccionesOptimistas({ despachar, servidor, agrupador, alFallar, alAgotarCupo }: Dependencias): AccionesCotizaciones {
  const atras = (p: Promise<unknown>) => void p.catch(alFallar);
  const confirmaciones=crearConfirmaciones(alFallar);
  return {
    ...(servidor.revisarCotizacion && {revisar:async(id:string)=>{
      const cotizacion=await servidor.revisarCotizacion!(id);
      despachar({tipo:"crear",cotizacion});
      return cotizacion.id;
    }}),
    crear: async () => {
      const resultado = await servidor.crearCotizacion();
      if (!resultado.ok) {
        alAgotarCupo();
        throw new CupoAgotado();
      }
      const { cotizacion } = resultado;
      despachar({ tipo: "crear", cotizacion });
      return cotizacion.id;
    },
    guardarPartida: (id, partida) => {
      despachar({ tipo: "guardarPartida", id, partida });
      // El servidor regresa la partida con la foto del precio: esa es la que queda.
      confirmaciones.agregar(id,servidor.guardarPartida(id, partida).then((conFoto) => despachar({ tipo: "guardarPartida", id, partida: conFoto })));
    },
    quitarPartida: (id, partidaId) => {
      despachar({ tipo: "quitarPartida", id, partidaId });
      confirmaciones.agregar(id,servidor.quitarPartida(id, partidaId));
    },
    editar: (id, cambios) => {
      despachar({ tipo: "editar", id, cambios });
      agrupador.agregar(id, cambios);
    },
    marcarEnviada: async(id) => {
      await agrupador.vaciar?.(id);
      await confirmaciones.confirmar(id);
      try{await servidor.marcarEnviada(id);}
      catch(error){alFallar();throw error;}
      despachar({ tipo: "enviada", id });
    },
    avisoVisto: (id) => {
      despachar({ tipo: "avisoVisto", id });
      atras(servidor.avisoVisto(id));
    },
  };
}
