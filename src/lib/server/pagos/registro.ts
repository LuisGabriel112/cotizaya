import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegistroPago } from "@/lib/pagos/planes";

export function crearRegistrador(db: SupabaseClient) {
  return async (registro: RegistroPago): Promise<void> => {
    const { error } = await db.rpc("registrar_pago", {
      p_taller: registro.taller, p_external_id: registro.externalId,
      p_metodo: registro.metodo, p_monto: registro.montoCentavos,
      p_periodo: registro.periodo, p_status: registro.status,
    });
    if (error) throw new Error(error.message);
  };
}
