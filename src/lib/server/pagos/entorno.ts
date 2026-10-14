import { z } from "zod";

const token = z.string().min(1);
const esquemaCobro = z.object({ MP_ACCESS_TOKEN: token, NEXT_PUBLIC_APP_URL: z.url() });
const esquemaWebhook = z.object({ MP_ACCESS_TOKEN: token, MP_WEBHOOK_SECRET: token, NEXT_PUBLIC_SUPABASE_URL: z.url(), SUPABASE_SERVICE_ROLE_KEY: token });
type Entorno = Record<string, string | undefined>;

function validar<T>(esquema: z.ZodType<T>, env: Entorno): T {
  const resultado = esquema.safeParse(env);
  if (resultado.success) return resultado.data;
  const nombres = resultado.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Configura en .env.local: ${nombres}`);
}

export function leerEntornoCobro(env: Entorno): { accessToken: string; urlApp: string } {
  const valores = validar(esquemaCobro, env);
  return { accessToken: valores.MP_ACCESS_TOKEN, urlApp: valores.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "") };
}

export function leerEntornoWebhook(env: Entorno): { accessToken: string; secreto: string; urlSupabase: string; llaveServicio: string } {
  const valores = validar(esquemaWebhook, env);
  return { accessToken: valores.MP_ACCESS_TOKEN, secreto: valores.MP_WEBHOOK_SECRET, urlSupabase: valores.NEXT_PUBLIC_SUPABASE_URL, llaveServicio: valores.SUPABASE_SERVICE_ROLE_KEY };
}
