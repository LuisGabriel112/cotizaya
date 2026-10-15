import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { RepositorioCatalogoSupabase } from "./repositorio";

type Llamada = [string, unknown[]];
function clienteFalso(data: unknown = null, error: { message: string } | null = null) {
  const llamadas: Llamada[] = [];
  const cadena: object = new Proxy({}, { get: (_, metodo) => metodo === "then"
    ? (resolver: (valor: unknown) => void) => resolver({ data, error })
    : (...args: unknown[]) => { llamadas.push([String(metodo), args]); return cadena; } });
  const db = { from: (tabla: string) => { llamadas.push(["from", [tabla]]); return cadena; } };
  return { repo: new RepositorioCatalogoSupabase(db as unknown as SupabaseClient, "w1"), llamadas };
}

describe("RepositorioCatalogoSupabase", () => {
  it("lista materiales del taller con clave y nombres de pieza", async () => {
    const fila = { id: "m1", clave: "jaladera", nombre: "Jaladera", linea: "Herrajes", unidad: "pieza", precio_centavos: 8500, pieza_singular: "jaladera", pieza_plural: "jaladeras" };
    const { repo, llamadas } = clienteFalso([fila]);
    expect(await repo.listar()).toEqual([{ id: "m1", clave: "jaladera", nombre: "Jaladera", linea: "Herrajes", unidad: "pieza", precioCentavos: 8500, pieza: ["jaladera", "jaladeras"] }]);
    expect(llamadas).toContainEqual(["eq", ["workshop_id", "w1"]]);
  });

  it("crea con el taller y los centavos", async () => {
    const { repo, llamadas } = clienteFalso();
    await repo.crear({ clave: "vidrio", nombre: "Vidrio", linea: "", unidad: "m2", precioCentavos: 12000 });
    expect(llamadas).toContainEqual(["insert", [{ workshop_id: "w1", clave: "vidrio", nombre: "Vidrio", linea: "", unidad: "m2", precio_centavos: 12000, pieza_singular: null, pieza_plural: null }]]);
  });

  it("acota cambios y bajas por id y taller", async () => {
    const { repo, llamadas } = clienteFalso();
    await repo.cambiarPrecio("m1", 230000);
    await repo.quitar("m1");
    expect(llamadas.filter(([metodo]) => metodo === "eq")).toEqual([["eq", ["id", "m1"]], ["eq", ["workshop_id", "w1"]], ["eq", ["id", "m1"]], ["eq", ["workshop_id", "w1"]]]);
  });

  it("busca plantillas globales y del taller por clave", async () => {
    const { repo, llamadas } = clienteFalso([{ nombre: "Ventana" }]);
    expect(await repo.plantillasQueUsan("vidrio")).toEqual(["Ventana"]);
    expect(llamadas).toContainEqual(["eq", ["material_clave", "vidrio"]]);
    expect(llamadas).toContainEqual(["or", ["workshop_id.is.null,workshop_id.eq.w1"]]);
  });

  it("propaga errores de base para que el caso de uso los convierta", async () => {
    const { repo } = clienteFalso(null, { message: "caída" });
    await expect(repo.listar()).rejects.toThrow("caída");
  });
});
