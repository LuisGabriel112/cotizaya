import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { entornoPublico } from "@/lib/supabase/entorno";

/** Cliente con la sesión del usuario (llave pública + cookie). Uno nuevo por petición. */
export async function clienteServidor(): Promise<SupabaseClient> {
  const almacen = await cookies();
  const { url, llave } = entornoPublico();
  return createServerClient(url, llave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (nuevas) => {
        try {
          for (const { name, value, options } of nuevas) almacen.set(name, value, options);
        } catch {
          // Un Server Component no puede escribir cookies; el proxy ya refrescó la sesión.
        }
      },
    },
  });
}
