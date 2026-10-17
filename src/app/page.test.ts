import { beforeEach, describe, expect, it, vi } from "vitest";
import { recorrer } from "@/test-utils/arbol-react";

const redirect = vi.hoisted(() => vi.fn((destino: string) => { throw new Error(`redirect:${destino}`); }));
const leerSesion = vi.hoisted(() => vi.fn());
const clienteServidor = vi.hoisted(() => vi.fn().mockResolvedValue("db"));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor }));
vi.mock("@/lib/server/supabase/sesion", () => ({ leerSesion }));
vi.mock("@/components/landing/hero", () => ({ Hero: () => null }));

import Inicio from "./page";

beforeEach(() => {
  vi.clearAllMocks();
  clienteServidor.mockResolvedValue("db");
  leerSesion.mockResolvedValue({ tipo: "sin-sesion" });
});

describe("/", () => {
  it("al taller con sesión lo manda a sus cotizaciones", async () => {
    leerSesion.mockResolvedValue({ tipo: "taller", usuarioId: "u1", workshopId: "t1" });
    await expect(Inicio()).rejects.toThrow("redirect:/cotizaciones");
  });

  it("sin sesión muestra la landing", async () => {
    const textos = recorrer(await Inicio()).flatMap((n) => (typeof n.props.children === "string" ? [n.props.children] : []));
    expect(redirect).not.toHaveBeenCalled();
    expect(textos).toContain("Cotiza Ya");
    expect(textos).toContain("Cotizar gratis");
  });

  it("abre aunque falten las variables de Supabase", async () => {
    clienteServidor.mockRejectedValue(new Error("Falta NEXT_PUBLIC_SUPABASE_URL"));
    await expect(Inicio()).resolves.toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("si la base falla tampoco tumba la landing", async () => {
    leerSesion.mockRejectedValue(new Error("sin red"));
    await expect(Inicio()).resolves.toBeTruthy();
  });
});
