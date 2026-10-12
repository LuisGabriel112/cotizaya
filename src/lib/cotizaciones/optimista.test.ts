import { describe, expect, it, vi } from "vitest";
import { crearAccionesOptimistas, type ServidorCotizaciones } from "./optimista";
import type { Cotizacion, PartidaGuardada } from "./tipos";

const partida = { id: "p1" } as PartidaGuardada;
const conFoto = { id: "p1", foto: true } as unknown as PartidaGuardada;
const cotizacion = { id: "c1" } as Cotizacion;

function preparar(servidor: Partial<ServidorCotizaciones> = {}) {
  const despachar = vi.fn();
  const alFallar = vi.fn();
  const agrupador = { agregar: vi.fn() };
  const completo: ServidorCotizaciones = {
    crearCotizacion: vi.fn().mockResolvedValue(cotizacion),
    guardarPartida: vi.fn().mockResolvedValue(conFoto),
    quitarPartida: vi.fn().mockResolvedValue(undefined),
    marcarEnviada: vi.fn().mockResolvedValue(undefined),
    avisoVisto: vi.fn().mockResolvedValue(undefined),
    ...servidor,
  };
  const acciones = crearAccionesOptimistas({ despachar, servidor: completo, agrupador, alFallar });
  return { acciones, despachar, alFallar, agrupador, servidor: completo };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("crearAccionesOptimistas", () => {
  it("crear espera al servidor, despacha y regresa el id", async () => {
    const { acciones, despachar } = preparar();
    expect(await acciones.crear()).toBe("c1");
    expect(despachar).toHaveBeenCalledWith({ tipo: "crear", cotizacion });
  });

  it("guardarPartida despacha al instante y luego la partida con foto", async () => {
    const { acciones, despachar, servidor } = preparar();
    acciones.guardarPartida("c1", partida);
    expect(despachar).toHaveBeenNthCalledWith(1, { tipo: "guardarPartida", id: "c1", partida });
    await tick();
    expect(servidor.guardarPartida).toHaveBeenCalledWith("c1", partida);
    expect(despachar).toHaveBeenNthCalledWith(2, { tipo: "guardarPartida", id: "c1", partida: conFoto });
  });

  it("quitarPartida despacha y avisa al servidor", () => {
    const { acciones, despachar, servidor } = preparar();
    acciones.quitarPartida("c1", "p1");
    expect(despachar).toHaveBeenCalledWith({ tipo: "quitarPartida", id: "c1", partidaId: "p1" });
    expect(servidor.quitarPartida).toHaveBeenCalledWith("c1", "p1");
  });

  it("editar despacha y pasa por el agrupador, no directo al servidor", () => {
    const { acciones, despachar, agrupador } = preparar();
    acciones.editar("c1", { cliente: "Ana" });
    expect(despachar).toHaveBeenCalledWith({ tipo: "editar", id: "c1", cambios: { cliente: "Ana" } });
    expect(agrupador.agregar).toHaveBeenCalledWith("c1", { cliente: "Ana" });
  });

  it("marcarEnviada y avisoVisto despachan y avisan al servidor", () => {
    const { acciones, despachar, servidor } = preparar();
    acciones.marcarEnviada("c1");
    acciones.avisoVisto("c1");
    expect(despachar).toHaveBeenCalledWith({ tipo: "enviada", id: "c1" });
    expect(despachar).toHaveBeenCalledWith({ tipo: "avisoVisto", id: "c1" });
    expect(servidor.marcarEnviada).toHaveBeenCalledWith("c1");
    expect(servidor.avisoVisto).toHaveBeenCalledWith("c1");
  });

  it.each(["marcarEnviada", "avisoVisto"] as const)("si %s falla en el servidor se avisa", async (nombre) => {
    const { acciones, alFallar } = preparar({ [nombre]: vi.fn().mockRejectedValue(new Error("sin señal")) });
    acciones[nombre]("c1");
    await tick();
    expect(alFallar).toHaveBeenCalledOnce();
  });

  it("si guardarPartida falla se avisa y no se despacha la foto", async () => {
    const { acciones, despachar, alFallar } = preparar({ guardarPartida: vi.fn().mockRejectedValue(new Error("x")) });
    acciones.guardarPartida("c1", partida);
    await tick();
    expect(alFallar).toHaveBeenCalledOnce();
    expect(despachar).toHaveBeenCalledOnce();
  });

  it("si quitarPartida falla se avisa", async () => {
    const { acciones, alFallar } = preparar({ quitarPartida: vi.fn().mockRejectedValue(new Error("x")) });
    acciones.quitarPartida("c1", "p1");
    await tick();
    expect(alFallar).toHaveBeenCalledOnce();
  });

  it("sin fallas no se avisa", async () => {
    const { acciones, alFallar } = preparar();
    acciones.marcarEnviada("c1");
    await tick();
    expect(alFallar).not.toHaveBeenCalled();
  });
});
