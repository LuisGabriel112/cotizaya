import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { cargarDatosApp } from "./datos-app";

/** Cada tabla resuelve con su propia respuesta; cualquier método encadenado se ignora. */
function dbPorTabla(respuestas: Record<string, { data: unknown; error: { message: string } | null }>) {
  const filtros: string[] = [];
  const cadena = (tabla: string): object =>
    new Proxy(
      {},
      {
        get: (_, metodo) =>
          metodo === "then"
            ? (resolver: (v: unknown) => void) => resolver(respuestas[tabla])
            : (...args: unknown[]) => {
                if (metodo === "select" && tabla === "workshops") filtros.push(`workshops.select(${args[0]})`);
                if (metodo === "or" || metodo === "eq") filtros.push(`${tabla}.${String(metodo)}(${args.join(",")})`);
                return cadena(tabla);
              },
      },
    );
  return { db: { from: cadena } as unknown as SupabaseClient, filtros };
}

const ok = (data: unknown) => ({ data, error: null });

const MATERIAL = { id: "m1", clave: "corrediza-2-6mm", nombre: "Corrediza", linea: "", unidad: "m2", precio_centavos: 185_000, pieza_singular: null, pieza_plural: null };
const PLANTILLA = { workshop_id: null, clave: "corrediza", nombre: "Corrediza", descripcion: "Ventana", material_clave: "corrediza-2-6mm", mano_obra_centavos: 35_000, croquis: "corrediza", orden: 1 };
const TALLER = { nombre: "El Faro", ciudad: "", telefono: "", condiciones: "", plan: "fundador", logo_url: null, plan_until: "2026-11-30" };

describe("cargarDatosApp", () => {
  it("trae taller, catálogo, plantillas y cotizaciones ya en forma de dominio", async () => {
    const { db, filtros } = dbPorTabla({
      workshops: ok(TALLER),
      materials: ok([MATERIAL]),
      item_templates: ok([PLANTILLA]),
      quotes: ok([]),
    });

    const datos = await cargarDatosApp(db, "w1");

    expect(datos.taller.nombre).toBe("El Faro");
    expect(datos.taller.planHasta).toBe("2026-11-30");
    expect(datos.materiales).toEqual([{ id: "m1", nombre: "Corrediza", linea: "", unidad: "m2", precioCentavos: 185_000 }]);
    expect(datos.plantillas.map((p) => p.materialId)).toEqual(["m1"]);
    expect(datos.cotizaciones).toEqual([]);
    // Un admin ve todo por RLS: se filtra explícito al taller de la sesión.
    expect(filtros).toEqual(
      expect.arrayContaining(["workshops.eq(id,w1)", "materials.eq(workshop_id,w1)", "quotes.eq(workshop_id,w1)", "item_templates.or(workshop_id.is.null,workshop_id.eq.w1)"]),
    );
  });

  it("pide la vigencia del plan para calcular el cupo", async () => {
    const { db, filtros } = dbPorTabla({ workshops: ok(TALLER), materials: ok([]), item_templates: ok([]), quotes: ok([]) });
    await cargarDatosApp(db, "w1");
    expect(filtros.find((f) => f.startsWith("workshops.select"))).toContain("plan_until");
  });

  it("si una consulta falla, falla la carga", async () => {
    const { db } = dbPorTabla({ workshops: ok(TALLER), materials: { data: null, error: { message: "caída" } }, item_templates: ok([]), quotes: ok([]) });
    await expect(cargarDatosApp(db, "w1")).rejects.toThrow("caída");
  });
});
