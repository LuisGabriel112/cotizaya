"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { aFilasMaterial, esquemaAlta, esquemaDatos, esquemaPlan, rutaDeLogo, validarLogo } from "@/lib/admin";
import { parsearCatalogoCsv } from "@/lib/catalogo/csv";
import { esquemaId } from "@/lib/cotizaciones/esquemas";
import { nuevoUuid } from "@/lib/cotizaciones/ids";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { esAdmin } from "@/lib/server/supabase/sesion";

export interface Resultado {
  ok: boolean;
  mensaje: string;
  errores?: string[];
}

const DUPLICADO = "23505";

/** Cada acción vuelve a revisar: la página pudo abrirse antes de que le quitaran el permiso. */
async function dbDeAdmin() {
  const db = await clienteServidor();
  if (!(await esAdmin(db))) notFound();
  return db;
}

const falla = (mensaje: string, errores?: string[]): Resultado => ({ ok: false, mensaje, ...(errores ? { errores } : {}) });

export async function altaTaller(_: Resultado | null, form: FormData): Promise<Resultado> {
  const r = esquemaAlta.safeParse(Object.fromEntries(form));
  if (!r.success) return falla(r.error.issues[0]!.message);
  const { data, error } = await (await dbDeAdmin()).rpc("admin_alta_taller", {
    p_nombre: r.data.nombre,
    p_owner_phone: r.data.ownerPhone,
    p_ciudad: r.data.ciudad,
    p_condiciones: r.data.condiciones,
  });
  if (error) return falla(error.code === DUPLICADO ? "Ya hay un taller con ese teléfono." : "No se pudo dar de alta. Intenta otra vez.");
  redirect(`/admin/talleres/${data}`);
}

export async function editarDatos(id: string, _prev: Resultado | null, form: FormData): Promise<Resultado> {
  const taller = esquemaId.parse(id);
  const resultado = esquemaDatos.safeParse(Object.fromEntries(form));
  if (!resultado.success) return falla(resultado.error.issues[0]!.message);
  const { nombre, ciudad, condiciones } = resultado.data;
  const { error } = await (await dbDeAdmin()).rpc("admin_editar_taller", {
    p_taller: taller,
    p_nombre: nombre,
    p_ciudad: ciudad,
    p_condiciones: condiciones,
  });
  if (error) return falla("No se pudieron guardar los datos. Intenta otra vez.");
  revalidatePath(`/admin/talleres/${taller}`);
  return { ok: true, mensaje: "Datos guardados." };
}

export async function subirLogo(id: string, _: Resultado | null, form: FormData): Promise<Resultado> {
  const taller = esquemaId.parse(id);
  const archivo = form.get("logo");
  if (!(archivo instanceof File)) return falla("Elige un archivo.");
  const problema = validarLogo(archivo);
  if (problema) return falla(problema);
  const db = await dbDeAdmin();
  const ruta = rutaDeLogo(taller, archivo.type, nuevoUuid());
  const subida = await db.storage.from("logos").upload(ruta, archivo, { contentType: archivo.type });
  if (subida.error) return falla("No se pudo subir el logo. Intenta otra vez.");
  const url = db.storage.from("logos").getPublicUrl(ruta).data.publicUrl;
  const { error } = await db.rpc("admin_poner_logo", { p_taller: taller, p_url: url });
  if (error) return falla("El logo se subió pero no quedó en el taller. Intenta otra vez.");
  revalidatePath(`/admin/talleres/${taller}`);
  return { ok: true, mensaje: "Logo listo." };
}

export async function importarCatalogo(id: string, _: Resultado | null, form: FormData): Promise<Resultado> {
  const taller = esquemaId.parse(id);
  const { materiales, errores } = parsearCatalogoCsv(String(form.get("csv") ?? ""));
  if (materiales.length === 0) return falla("No se guardó nada.", errores);
  // Misma clave = mismo material: se actualiza en vez de duplicarse.
  const { error } = await (await dbDeAdmin()).from("materials").upsert(aFilasMaterial(taller, materiales), { onConflict: "workshop_id,clave" });
  if (error) return falla("No se pudo guardar el catálogo. Intenta otra vez.", errores);
  revalidatePath(`/admin/talleres/${taller}`);
  const mensaje = `Se guardaron ${materiales.length} materiales.`;
  return errores.length ? falla(`${mensaje} Revisa estas líneas:`, errores) : { ok: true, mensaje };
}

export async function activarPlan(id: string, _: Resultado | null, form: FormData): Promise<Resultado> {
  const taller = esquemaId.parse(id);
  const r = esquemaPlan.safeParse(Object.fromEntries(form));
  if (!r.success) return falla(r.error.issues[0]!.message);
  const { error } = await (await dbDeAdmin()).rpc("admin_activar_plan", { p_taller: taller, p_plan: r.data.plan, p_hasta: r.data.hasta });
  if (error) return falla("No se pudo cambiar el plan. Intenta otra vez.");
  revalidatePath("/admin");
  revalidatePath(`/admin/talleres/${taller}`);
  return { ok: true, mensaje: r.data.plan === "fundador" ? `Plan fundador activo hasta ${r.data.hasta}.` : "Quedó en plan gratis." };
}
