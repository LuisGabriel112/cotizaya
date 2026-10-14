import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { crearRegistrador } from "./registro";

const REGISTRO = {
  taller: "11111111-1111-4111-8111-111111111111",
  externalId: "123",
  metodo: "oxxo",
  montoCentavos: 9900,
  periodo: "mes",
  status: "pending",
} as const;

const db = (error: { message: string } | null) => ({ rpc: vi.fn().mockResolvedValue({ data: null, error }) });

describe("crearRegistrador", () => {
  it("llama a registrar_pago con los parámetros de la RPC", async () => {
    const cliente = db(null);
    await crearRegistrador(cliente as unknown as SupabaseClient)(REGISTRO);
    expect(cliente.rpc).toHaveBeenCalledWith("registrar_pago", {
      p_taller: REGISTRO.taller,
      p_external_id: "123",
      p_metodo: "oxxo",
      p_monto: 9900,
      p_periodo: "mes",
      p_status: "pending",
    });
  });

  it("un error de la base se vuelve excepción", async () => {
    const cliente = db({ message: "permiso negado" });
    await expect(crearRegistrador(cliente as unknown as SupabaseClient)(REGISTRO)).rejects.toThrow("permiso negado");
  });
});
