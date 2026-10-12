import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => ({ rpc }) }));

import { continuarConTaller } from "./acciones";

beforeEach(() => vi.clearAllMocks());

describe("continuarConTaller", () => {
  it("teléfono con taller dado de alta entra directo", async () => {
    rpc.mockResolvedValue({ data: "t1", error: null });
    expect(await continuarConTaller()).toBe("listo");
    expect(rpc).toHaveBeenCalledWith("reclamar_o_crear_taller", {});
  });

  it("teléfono nuevo sin nombre pide el nombre", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await continuarConTaller()).toBe("pide-nombre");
  });

  it("con nombre lo manda recortado", async () => {
    rpc.mockResolvedValue({ data: "t2", error: null });
    expect(await continuarConTaller("  Vidrios Boca ")).toBe("listo");
    expect(rpc).toHaveBeenCalledWith("reclamar_o_crear_taller", { p_nombre: "Vidrios Boca" });
  });

  it("nombre de una letra no llega a la base", async () => {
    await expect(continuarConTaller("V")).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("error de la base no se traga", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "x" } });
    await expect(continuarConTaller()).rejects.toThrow();
  });
});
