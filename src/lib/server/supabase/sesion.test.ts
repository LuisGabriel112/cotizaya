import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { esAdmin, exigirTaller, leerSesion } from "./sesion";

interface Falso {
  sub?: string;
  taller?: { id: string } | null;
  errorTaller?: Error;
  admin?: boolean;
}

/** Imita solo las piezas del cliente que usa sesion.ts. */
function clienteFalso({ sub, taller = null, errorTaller, admin = false }: Falso) {
  const eq = vi.fn(() => ({ maybeSingle: async () => ({ data: taller, error: errorTaller ?? null }) }));
  const cliente = {
    auth: { getClaims: async () => ({ data: sub ? { claims: { sub } } : null, error: null }) },
    from: vi.fn(() => ({ select: () => ({ eq }) })),
    rpc: vi.fn(async () => ({ data: admin, error: null })),
  };
  return { supabase: cliente as unknown as SupabaseClient, eq, cliente };
}

describe("leerSesion", () => {
  it("sin sesión", async () => {
    expect(await leerSesion(clienteFalso({}).supabase)).toEqual({ tipo: "sin-sesion" });
  });

  it("con sesión pero sin taller todavía", async () => {
    expect(await leerSesion(clienteFalso({ sub: "u1" }).supabase)).toEqual({ tipo: "sin-taller", usuarioId: "u1" });
  });

  it("con taller: busca por owner_id, no se fía de lo que RLS le deje ver a un admin", async () => {
    const { supabase, eq } = clienteFalso({ sub: "u1", taller: { id: "w1" } });
    expect(await leerSesion(supabase)).toEqual({ tipo: "taller", usuarioId: "u1", workshopId: "w1" });
    expect(eq).toHaveBeenCalledWith("owner_id", "u1");
  });

  it("si la base falla, el error sube", async () => {
    await expect(leerSesion(clienteFalso({ sub: "u1", errorTaller: new Error("caída") }).supabase)).rejects.toThrow("caída");
  });
});

describe("exigirTaller", () => {
  it("regresa la sesión con taller o lanza", async () => {
    await expect(exigirTaller(clienteFalso({ sub: "u1", taller: { id: "w1" } }).supabase)).resolves.toMatchObject({ workshopId: "w1" });
    await expect(exigirTaller(clienteFalso({ sub: "u1" }).supabase)).rejects.toThrow("sin-taller");
  });
});

describe("esAdmin", () => {
  it("pregunta a es_admin() de la base", async () => {
    const { supabase, cliente } = clienteFalso({ sub: "u1", admin: true });
    expect(await esAdmin(supabase)).toBe(true);
    expect(cliente.rpc).toHaveBeenCalledWith("es_admin");
    expect(await esAdmin(clienteFalso({ sub: "u1" }).supabase)).toBe(false);
  });
});
