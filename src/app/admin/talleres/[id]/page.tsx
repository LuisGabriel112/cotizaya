import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { esquemaId } from "@/lib/cotizaciones/esquemas";
import { formatCentavos } from "@/lib/format";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import type { FilaMaterial } from "@/lib/server/supabase/mapeo";
import { sinError } from "@/lib/server/supabase/repositorio";
import { formatTelefono } from "@/lib/telefono";
import { FormularioCatalogo, FormularioDatos, FormularioLogo, FormularioPlan } from "../../formularios";

interface TallerAdmin {
  id: string;
  nombre: string;
  ciudad: string;
  condiciones: string;
  owner_phone: string;
  owner_id: string | null;
  logo_url: string | null;
  plan: "gratis" | "fundador";
  plan_until: string | null;
}

async function cargar(id: string) {
  const db = await clienteServidor();
  const [taller, materiales] = await Promise.all([
    db.from("workshops").select("id, nombre, ciudad, condiciones, owner_phone, owner_id, logo_url, plan, plan_until").eq("id", id).maybeSingle<TallerAdmin>(),
    db.from("materials").select("*").eq("workshop_id", id).order("nombre").returns<FilaMaterial[]>(),
  ]);
  return { taller: sinError(taller), materiales: sinError(materiales) ?? [] };
}

export default async function TallerAdmin({ params }: { params: Promise<{ id: string }> }) {
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) notFound();
  const { taller, materiales } = await cargar(id.data);
  if (!taller) notFound();

  return (
    <main>
      <Link href="/admin" className="inline-flex min-h-14 items-center underline">
        Talleres
      </Link>
      <header className="flex items-center gap-4">
        {taller.logo_url && <Image src={taller.logo_url} alt="" width={64} height={64} unoptimized className="size-16 rounded-sm border-2 border-tinta object-contain" />}
        <div>
          <h1 className="titulo text-[2.5rem] leading-none">{taller.nombre}</h1>
          <p className="text-tinta-2">
            {formatTelefono(taller.owner_phone)} · {taller.ciudad || "Sin ciudad"} · {taller.owner_id ? "ya entró" : "no ha entrado"}
          </p>
        </div>
      </header>

      <Seccion titulo="Datos del taller">
        <FormularioDatos taller={taller.id} nombre={taller.nombre} ciudad={taller.ciudad} condiciones={taller.condiciones} />
      </Seccion>
      <Seccion titulo="Plan">
        <FormularioPlan taller={taller.id} plan={taller.plan} hasta={taller.plan_until} />
      </Seccion>
      <Seccion titulo="Logo">
        <FormularioLogo taller={taller.id} />
      </Seccion>
      <Seccion titulo={`Catálogo (${materiales.length})`}>
        <ul className="mb-6 border-t border-dashed border-aluminio">
          {materiales.map((m) => (
            <li key={m.id} className="flex justify-between gap-3 border-b border-dashed border-aluminio py-2">
              <span className="min-w-0">
                {m.nombre} <span className="num block break-words text-base text-tinta-2">{m.clave}</span>
              </span>
              <span className="num">
                {formatCentavos(m.precio_centavos)}/{m.unidad === "m2" ? "m²" : m.unidad === "ml" ? "m" : (m.pieza_singular ?? "pza")}
              </span>
            </li>
          ))}
        </ul>
        <FormularioCatalogo taller={taller.id} />
      </Seccion>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t-2 border-tinta pt-4">
      <h2 className="titulo mb-4 text-3xl">{titulo}</h2>
      {children}
    </section>
  );
}
