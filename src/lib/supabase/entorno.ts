import { z } from "zod";

const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export interface EntornoPublico {
  url: string;
  llave: string;
}

/** Solo la URL y la llave pública (anon): seguras en el navegador. La service key nunca pasa por aquí. */
export function leerEntornoPublico(env: Record<string, string | undefined>): EntornoPublico {
  const r = esquema.safeParse(env);
  if (!r.success) {
    const faltan = r.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Configura en .env.local: ${faltan}`);
  }
  return { url: r.data.NEXT_PUBLIC_SUPABASE_URL, llave: r.data.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

// Next solo inyecta NEXT_PUBLIC_* en el navegador si se leen con el nombre literal.
export const entornoPublico = () =>
  leerEntornoPublico({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
