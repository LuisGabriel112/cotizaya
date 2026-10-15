import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaterialCsv } from "@/lib/catalogo/csv";
import type { MaterialGuardado, RepositorioCatalogo } from "@/lib/catalogo/casos";
import { aMaterial, type FilaMaterial } from "@/lib/server/supabase/mapeo";
import { sinError } from "@/lib/server/supabase/repositorio";

export class RepositorioCatalogoSupabase implements RepositorioCatalogo {
  constructor(private readonly db: SupabaseClient, private readonly tallerId: string) {}

  async listar(): Promise<MaterialGuardado[]> {
    const filas = sinError(await this.db.from("materials").select("*").eq("workshop_id", this.tallerId).returns<FilaMaterial[]>()) ?? [];
    return filas.map((fila) => ({ ...aMaterial(fila), clave: fila.clave }));
  }

  async crear(material: MaterialCsv): Promise<void> {
    sinError(await this.db.from("materials").insert({
      workshop_id: this.tallerId, clave: material.clave, nombre: material.nombre,
      linea: material.linea, unidad: material.unidad, precio_centavos: material.precioCentavos,
      pieza_singular: material.pieza?.[0] ?? null, pieza_plural: material.pieza?.[1] ?? null,
    }));
  }

  async cambiarPrecio(id: string, centavos: number): Promise<void> {
    sinError(await this.db.from("materials").update({ precio_centavos: centavos }).eq("id", id).eq("workshop_id", this.tallerId));
  }

  async quitar(id: string): Promise<void> {
    sinError(await this.db.from("materials").delete().eq("id", id).eq("workshop_id", this.tallerId));
  }

  async plantillasQueUsan(clave: string): Promise<string[]> {
    const filas = sinError(await this.db.from("item_templates").select("nombre")
      .eq("material_clave", clave).or(`workshop_id.is.null,workshop_id.eq.${this.tallerId}`)
      .returns<{ nombre: string }[]>()) ?? [];
    return filas.map((fila) => fila.nombre);
  }
}
