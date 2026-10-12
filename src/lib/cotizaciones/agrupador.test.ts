import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { crearAgrupador } from "./agrupador";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("crearAgrupador", () => {
  it("junta los cambios de la misma cotización y los manda una vez al dejar de teclear", () => {
    const enviar = vi.fn();
    const agrupador = crearAgrupador(400, enviar);

    agrupador.agregar("a", { cliente: "R" });
    vi.advanceTimersByTime(300);
    agrupador.agregar("a", { cliente: "Ra" });
    agrupador.agregar("a", { conIva: true });
    vi.advanceTimersByTime(399);
    expect(enviar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(enviar).toHaveBeenCalledExactlyOnceWith("a", { cliente: "Ra", conIva: true });
  });

  it("cada cotización lleva su propio reloj", () => {
    const enviar = vi.fn();
    const agrupador = crearAgrupador(400, enviar);
    agrupador.agregar("a", { cliente: "A" });
    agrupador.agregar("b", { cliente: "B" });
    vi.advanceTimersByTime(400);
    expect(enviar.mock.calls).toEqual([
      ["a", { cliente: "A" }],
      ["b", { cliente: "B" }],
    ]);
  });

  it("vaciar manda lo pendiente de inmediato", () => {
    const enviar = vi.fn();
    const agrupador = crearAgrupador(400, enviar);
    agrupador.agregar("a", { descuentoPct: 5 });
    agrupador.vaciar();
    expect(enviar).toHaveBeenCalledExactlyOnceWith("a", { descuentoPct: 5 });
    vi.advanceTimersByTime(400);
    expect(enviar).toHaveBeenCalledOnce();
  });
});
