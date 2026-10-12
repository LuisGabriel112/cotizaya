import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { PartidaConFoto } from "@/lib/cotizaciones/puerto";
import { RepositorioSupabase } from "./repositorio";

type Llamada = [string, unknown[]];

/** Query builder encadenable que anota cada método y al final resuelve con `resultado`. */
function dbFalsa(resultado: { data: unknown; error: { message: string } | null } = { data: null, error: null }) {
  const llamadas: Llamada[] = [];
  const cadena: object = new Proxy(
    {},
    {
      get: (_, metodo) =>
        metodo === "then"
          ? (resolver: (v: unknown) => void) => resolver(resultado)
          : (...args: unknown[]) => {
              llamadas.push([String(metodo), args]);
              return cadena;
            },
    },
  );
  const db = { from: (tabla: string) => (llamadas.push(["from", [tabla]]), cadena) };
  return { repo: new RepositorioSupabase(db as unknown as SupabaseClient, "w1"), llamadas };
}

const PARTIDA: PartidaConFoto = {
  id: "p1",
  plantillaId: "corrediza",
  descripcion: "Ventana",
  materialId: "m1",
  anchoCm: 120,
  altoCm: 150,
  cantidad: 1,
  manoObraCentavos: 35_000,
  material: { unidad: "m2", precioCentavos: 185_000 },
};

const metodos = (ll: Llamada[]) => ll.map(([m]) => m);

describe("RepositorioSupabase", () => {
  it("partida nueva: insert con su id, cotización y taller", async () => {
    const { repo, llamadas } = dbFalsa();
    await repo.guardarPartida("q1", PARTIDA, 0, 368_000, true);
    expect(llamadas[0]).toEqual(["from", ["quote_items"]]);
    expect(llamadas[1]![0]).toBe("insert");
    expect(llamadas[1]![1][0]).toMatchObject({ id: "p1", quote_id: "q1", workshop_id: "w1", precio_centavos: 185_000, importe_centavos: 368_000 });
  });

  it("partida existente: update sin tocar quote_id ni workshop_id, acotado a esa cotización", async () => {
    const { repo, llamadas } = dbFalsa();
    await repo.guardarPartida("q1", PARTIDA, 2, 1, false);
    const [, [fila]] = llamadas[1]!;
    expect(llamadas[1]![0]).toBe("update");
    expect(fila).not.toHaveProperty("quote_id");
    expect(fila).not.toHaveProperty("workshop_id");
    expect(llamadas.slice(2)).toEqual([
      ["eq", ["id", "p1"]],
      ["eq", ["quote_id", "q1"]],
    ]);
  });

  it("marcarEnviada solo avanza desde borrador y deja evento", async () => {
    const { repo, llamadas } = dbFalsa();
    await repo.marcarEnviada("q1");
    expect(llamadas).toEqual([
      ["from", ["quotes"]],
      ["update", [{ status: "enviada" }]],
      ["eq", ["id", "q1"]],
      ["eq", ["status", "borrador"]],
      ["from", ["quote_events"]],
      ["insert", [{ quote_id: "q1", workshop_id: "w1", tipo: "enviada" }]],
    ]);
  });

  it("guardarTotales escribe los centavos calculados", async () => {
    const { repo, llamadas } = dbFalsa();
    await repo.guardarTotales("q1", { subtotalCentavos: 10, descuentoCentavos: 1, baseCentavos: 9, ivaCentavos: 2, totalCentavos: 11, partidasConError: [] });
    expect(llamadas[1]).toEqual(["update", [{ subtotal_centavos: 10, descuento_centavos: 1, iva_centavos: 2, total_centavos: 11 }]]);
  });

  it("editar, quitar y apagar aviso", async () => {
    const { repo, llamadas } = dbFalsa();
    await repo.editar("q1", { cliente: "Ramón" });
    await repo.quitarPartida("q1", "p1");
    await repo.apagarAviso("q1");
    expect(metodos(llamadas)).toEqual(["from", "update", "eq", "from", "delete", "eq", "eq", "from", "update", "eq"]);
    expect(llamadas[1]).toEqual(["update", [{ cliente_nombre: "Ramón" }]]);
  });

  it("crear inserta en el taller de la sesión y regresa la cotización", async () => {
    const fila = { id: "q1", folio: 7, cliente_nombre: "", status: "borrador", descuento_pct: 0, con_iva: false, acabado: "natural", garantia_salitre: true, public_slug: "0007-a", viewed_at: null, aviso_pendiente: false, created_at: "2026-10-12T00:00:00Z", quote_items: [] };
    const { repo, llamadas } = dbFalsa({ data: fila, error: null });
    expect(await repo.crear()).toMatchObject({ id: "q1", folio: 7, slug: "0007-a" });
    expect(llamadas[1]).toEqual(["insert", [{ workshop_id: "w1" }]]);
  });

  it("porId y material regresan null si no hay fila", async () => {
    const { repo } = dbFalsa();
    expect(await repo.porId("q1")).toBeNull();
    expect(await repo.material("m1")).toBeNull();
  });

  it("un error de la base se vuelve excepción", async () => {
    const { repo } = dbFalsa({ data: null, error: { message: "permiso negado" } });
    await expect(repo.apagarAviso("q1")).rejects.toThrow("permiso negado");
  });
});
