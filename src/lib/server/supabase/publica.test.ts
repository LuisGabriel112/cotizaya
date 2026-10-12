import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { esSlugValido, leerVistaPublica } from "./publica";

const JSON_PUBLICO = {
  quote: {
    id: "q1",
    folio: 42,
    cliente_nombre: "Leticia",
    status: "enviada",
    descuento_pct: 0,
    con_iva: false,
    acabado: "natural",
    garantia_salitre: true,
    public_slug: "0042-0123456789ab",
    viewed_at: null,
    created_at: "2026-10-12T00:00:00Z",
  },
  items: [],
  taller: { nombre: "El Faro", ciudad: "", telefono: "2290000001", condiciones: "", plan: "gratis", logo_url: null },
};

function db(data: unknown) {
  const rpc = vi.fn(async () => ({ data, error: null }));
  return { supabase: { rpc } as unknown as SupabaseClient, rpc };
}

describe("esSlugValido", () => {
  it.each([
    ["0042-0123456789ab", true],
    ["12345-0123456789ab", true],
    ["0042-0123456789AB", false],
    ["faro-0042-k7m2", false],
    ["0042-0123'; drop", false],
  ])("%s → %s", (slug, valido) => {
    expect(esSlugValido(slug)).toBe(valido);
  });
});

describe("leerVistaPublica", () => {
  it("slug con forma rara: ni pregunta a la base", async () => {
    const { supabase, rpc } = db(JSON_PUBLICO);
    expect(await leerVistaPublica(supabase, "../../etc")).toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("slug que no existe: null", async () => {
    expect(await leerVistaPublica(db(null).supabase, "0042-0123456789ab")).toBeNull();
  });

  it("slug válido: cotización y taller", async () => {
    const { supabase, rpc } = db(JSON_PUBLICO);
    const vista = await leerVistaPublica(supabase, "0042-0123456789ab");
    expect(rpc).toHaveBeenCalledWith("cotizacion_publica", { p_slug: "0042-0123456789ab" });
    expect(vista?.cotizacion.folio).toBe(42);
    expect(vista?.taller.nombre).toBe("El Faro");
  });
});
