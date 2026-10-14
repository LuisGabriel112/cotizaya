import { describe, expect, it } from "vitest";
import { leerEntornoCobro, leerEntornoWebhook } from "./entorno";

const TOKEN = "APP_USR-0000000000000000-000000-abcdef";
const BASE = {
  MP_ACCESS_TOKEN: TOKEN,
  NEXT_PUBLIC_APP_URL: "https://cotizaya.mx",
  MP_WEBHOOK_SECRET: "secreto-webhook",
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "eyJ-service-role-de-prueba-larga",
};

describe("entorno de pagos", () => {
  it("cobro: token y URL de la app, sin la barra final", () => {
    expect(leerEntornoCobro({ ...BASE, NEXT_PUBLIC_APP_URL: "https://cotizaya.mx/" })).toEqual({ accessToken: TOKEN, urlApp: "https://cotizaya.mx" });
  });

  it("webhook: token, secreto y service key", () => {
    expect(leerEntornoWebhook(BASE)).toEqual({
      accessToken: TOKEN,
      secreto: "secreto-webhook",
      urlSupabase: "https://x.supabase.co",
      llaveServicio: "eyJ-service-role-de-prueba-larga",
    });
  });

  it("dice qué falta", () => {
    expect(() => leerEntornoCobro({ ...BASE, MP_ACCESS_TOKEN: undefined })).toThrow("Configura en .env.local: MP_ACCESS_TOKEN");
    expect(() => leerEntornoWebhook({ ...BASE, MP_WEBHOOK_SECRET: "" })).toThrow("MP_WEBHOOK_SECRET");
    expect(() => leerEntornoWebhook({ ...BASE, SUPABASE_SERVICE_ROLE_KEY: undefined })).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("el error nunca incluye el token", () => {
    expect(() => leerEntornoCobro({ ...BASE, NEXT_PUBLIC_APP_URL: "no-es-url" })).toThrow(/^(?!.*APP_USR).*$/s);
  });
});
