import { describe, expect, it } from "vitest";
import { leerEntornoPublico } from "./entorno";

describe("leerEntornoPublico", () => {
  it("regresa url y llave pública", () => {
    const env = { NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "llave-publica-de-prueba-123" };
    expect(leerEntornoPublico(env)).toEqual({ url: "https://abc.supabase.co", llave: "llave-publica-de-prueba-123" });
  });

  it("explica qué falta en vez de fallar a medias", () => {
    expect(() => leerEntornoPublico({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/s);
    expect(() => leerEntornoPublico({ NEXT_PUBLIC_SUPABASE_URL: "no-es-url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "x".repeat(30) })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});
