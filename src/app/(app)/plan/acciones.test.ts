import { beforeEach, describe, expect, it, vi } from "vitest";

const { exigirTaller, crearPreferencia } = vi.hoisted(() => ({ exigirTaller: vi.fn(), crearPreferencia: vi.fn() }));

vi.mock("next/navigation", () => ({
  redirect: (ruta: string) => {
    throw new Error(`REDIRECT ${ruta}`);
  },
}));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => ({}) }));
vi.mock("@/lib/server/supabase/sesion", () => ({ exigirTaller }));
vi.mock("@/lib/server/pagos/dependencias", () => ({ pasarelaDeCobro: () => ({ crearPreferencia }) }));

import { iniciarPago } from "./acciones";

const TALLER = "11111111-1111-4111-8111-111111111111";
const formulario = (periodo: string) => {
  const f = new FormData();
  f.set("periodo", periodo);
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  exigirTaller.mockResolvedValue({ tipo: "taller", usuarioId: "u", workshopId: TALLER });
  crearPreferencia.mockResolvedValue("https://mp/checkout");
});

describe("iniciarPago", () => {
  it("crea la preferencia del taller de la sesión y lleva al checkout", async () => {
    await expect(iniciarPago(formulario("anio"))).rejects.toThrow("REDIRECT https://mp/checkout");
    expect(crearPreferencia).toHaveBeenCalledWith({ taller: TALLER, periodo: "anio" });
  });

  it("un periodo inventado no llega a Mercado Pago", async () => {
    await expect(iniciarPago(formulario("semana"))).rejects.toThrow();
    expect(crearPreferencia).not.toHaveBeenCalled();
  });

  it("sin sesión de taller no cobra", async () => {
    exigirTaller.mockRejectedValue(new Error("sin taller"));
    await expect(iniciarPago(formulario("mes"))).rejects.toThrow("sin taller");
    expect(crearPreferencia).not.toHaveBeenCalled();
  });
});
