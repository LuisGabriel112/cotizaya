import Link from "next/link";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { sinError } from "@/lib/server/supabase/repositorio";
import { formatTelefono } from "@/lib/telefono";
import { FormularioAlta } from "./formularios";

interface FilaTallerAdmin {
  id: string;
  nombre: string;
  owner_phone: string;
  owner_id: string | null;
  plan: "gratis" | "fundador";
  plan_until: string | null;
}

export default async function Admin() {
  const db = await clienteServidor();
  const talleres = sinError(
    await db.from("workshops").select("id, nombre, owner_phone, owner_id, plan, plan_until").order("created_at", { ascending: false }).returns<FilaTallerAdmin[]>(),
  ) ?? [];

  return (
    <main>
      <h1 className="titulo text-[2.5rem] leading-none">Talleres</h1>
      <ul className="mt-4 border-t-2 border-tinta">
        {talleres.map((t) => (
          <li key={t.id} className="border-b border-dashed border-aluminio">
            <Link href={`/admin/talleres/${t.id}`} className="flex min-h-14 flex-wrap items-baseline justify-between gap-x-4 py-2 no-underline">
              <span className="font-semibold">{t.nombre}</span>
              <span className="num text-tinta-2">{formatTelefono(t.owner_phone)}</span>
              <span className="text-base text-tinta-2">
                {t.plan === "fundador" ? `Fundador hasta ${t.plan_until ?? "—"}` : "Gratis"} · {t.owner_id ? "ya entró" : "no ha entrado"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {talleres.length === 0 && <p className="mt-4 text-lg">Aún no hay talleres.</p>}

      <section className="mt-10">
        <h2 className="titulo text-3xl">Dar de alta un taller</h2>
        <p className="mt-1 text-tinta-2">El dueño entra con ese celular y su taller ya lo espera, con el catálogo base.</p>
        <div className="mt-4">
          <FormularioAlta />
        </div>
      </section>
    </main>
  );
}
