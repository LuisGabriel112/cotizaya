import { createClient } from "@supabase/supabase-js";
import { leerEntornoCobro, leerEntornoWebhook } from "./entorno";
import { verificarFirma } from "./firma";
import { crearPasarela } from "./mercadopago";
import { crearRegistrador } from "./registro";
import type { DependenciasWebhook } from "./webhook";

export function pasarelaDeCobro() {
  return crearPasarela(leerEntornoCobro(process.env));
}

export function dependenciasWebhook(): DependenciasWebhook {
  const { accessToken, secreto, urlSupabase, llaveServicio } = leerEntornoWebhook(process.env);
  // La service key solo vive aquí, en el servidor, para el webhook.
  const db = createClient(urlSupabase, llaveServicio, { auth: { persistSession: false, autoRefreshToken: false } });
  return {
    firmaValida: ({ firma, requestId, dataId }) => verificarFirma({ secreto, firma, requestId, dataId }),
    obtenerPago: crearPasarela({ accessToken, urlApp: "" }).obtenerPago,
    registrarPago: crearRegistrador(db),
  };
}
