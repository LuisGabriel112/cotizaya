import { beforeEach, describe, expect, it, vi } from "vitest";

const { casos, exigirTaller, signOut, Repositorio } = vi.hoisted(() => ({
  casos: { crear: vi.fn(), guardarPartida: vi.fn(), quitarPartida: vi.fn(), editar: vi.fn(), marcarEnviada: vi.fn(), avisoVisto: vi.fn() },
  exigirTaller: vi.fn(),
  signOut: vi.fn(),
  Repositorio: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (ruta: string) => {
    throw new Error(`REDIRECT ${ruta}`);
  },
}));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => ({ auth: { signOut } }) }));
vi.mock("@/lib/server/supabase/sesion", () => ({ exigirTaller }));
vi.mock("@/lib/server/supabase/repositorio", () => ({ RepositorioSupabase: Repositorio }));
vi.mock("@/lib/cotizaciones/casos", () => ({ crearCasos: () => casos }));

import { avisoVisto, crearCotizacion, editarCotizacion, marcarEnviada, quitarPartida, salir } from "./acciones";

const ID = "11111111-1111-4111-8111-111111111111";
const OTRO = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  vi.clearAllMocks();
  exigirTaller.mockResolvedValue({ tipo: "taller", usuarioId: "u", workshopId: "w1" });
});

describe("acciones de la app", () => {
  it("el repositorio queda acotado al taller de la sesión", async () => {
    casos.crear.mockResolvedValue({ id: ID });
    expect(await crearCotizacion()).toEqual({ id: ID });
    expect(Repositorio).toHaveBeenCalledWith(expect.anything(), "w1");
  });

  it("sin taller no llega a los casos", async () => {
    exigirTaller.mockRejectedValue(new Error("sin taller"));
    await expect(marcarEnviada(ID)).rejects.toThrow("sin taller");
    expect(casos.marcarEnviada).not.toHaveBeenCalled();
  });

  it.each([
    ["marcarEnviada", () => marcarEnviada("x")],
    ["avisoVisto", () => avisoVisto("x")],
    ["quitarPartida", () => quitarPartida(ID, "x")],
    ["editarCotizacion", () => editarCotizacion("x", {})],
  ])("%s rechaza un id que no es UUID", async (_, accion) => {
    await expect(accion()).rejects.toThrow();
    expect(Object.values(casos).some((f) => f.mock.calls.length > 0)).toBe(false);
  });

  it("pasa ids válidos a los casos", async () => {
    await quitarPartida(ID, OTRO);
    await avisoVisto(ID);
    expect(casos.quitarPartida).toHaveBeenCalledWith(ID, OTRO);
    expect(casos.avisoVisto).toHaveBeenCalledWith(ID);
  });

  it("editar solo deja pasar campos conocidos", async () => {
    await editarCotizacion(ID, { cliente: "Ana" });
    expect(casos.editar).toHaveBeenCalledWith(ID, { cliente: "Ana" });
  });

  it("salir cierra sesión y manda a /entrar", async () => {
    await expect(salir()).rejects.toThrow("REDIRECT /entrar");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
