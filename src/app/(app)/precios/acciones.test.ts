import { beforeEach, describe, expect, it, vi } from "vitest";

const { exigirTaller, casos, revalidatePath, Repositorio } = vi.hoisted(() => ({
  exigirTaller: vi.fn(), revalidatePath: vi.fn(), Repositorio: vi.fn(),
  casos: { agregar: vi.fn(), cambiarPrecio: vi.fn(), quitar: vi.fn() },
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => ({}) }));
vi.mock("@/lib/server/supabase/sesion", () => ({ exigirTaller }));
vi.mock("@/lib/server/catalogo/repositorio", () => ({ RepositorioCatalogoSupabase: Repositorio }));
vi.mock("@/lib/catalogo/casos", () => ({ crearCasosCatalogo: () => casos }));

import { agregarMaterial, cambiarPrecio, quitarMaterial } from "./acciones";

const ID = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
  vi.clearAllMocks();
  exigirTaller.mockResolvedValue({ workshopId: ID });
  casos.agregar.mockResolvedValue({ ok: true });
  casos.cambiarPrecio.mockResolvedValue({ ok: true });
  casos.quitar.mockResolvedValue({ ok: true });
});

describe("acciones de precios", () => {
  it("agrega desde la sesión y revalida si tuvo éxito", async () => {
    const entrada = { nombre: "Vidrio", unidad: "m2" as const, precio: "100" };
    expect(await agregarMaterial(entrada)).toEqual({ ok: true });
    expect(Repositorio).toHaveBeenCalledWith({}, ID);
    expect(casos.agregar).toHaveBeenCalledWith(entrada);
    expect(revalidatePath).toHaveBeenCalledWith("/precios");
  });

  it("valida el id antes de cambiar y quitar", async () => {
    await expect(cambiarPrecio("ajeno", "100")).rejects.toThrow();
    await expect(quitarMaterial("ajeno")).rejects.toThrow();
    expect(casos.cambiarPrecio).not.toHaveBeenCalled();
    expect(casos.quitar).not.toHaveBeenCalled();
  });

  it("manda id válido y revalida al guardar", async () => {
    await cambiarPrecio(ID, "200");
    await quitarMaterial(ID);
    expect(casos.cambiarPrecio).toHaveBeenCalledWith(ID, "200");
    expect(casos.quitar).toHaveBeenCalledWith(ID);
    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });

  it("no revalida al fallar el caso de uso", async () => {
    casos.quitar.mockResolvedValue({ ok: false, mensaje: "No encontramos ese material." });
    expect(await quitarMaterial(ID)).toEqual({ ok: false, mensaje: "No encontramos ese material." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("sin sesión no guarda", async () => {
    exigirTaller.mockRejectedValue(new Error("sin taller"));
    await expect(agregarMaterial({ nombre: "Vidrio", unidad: "m2", precio: "100" })).rejects.toThrow("sin taller");
    expect(casos.agregar).not.toHaveBeenCalled();
  });
});
