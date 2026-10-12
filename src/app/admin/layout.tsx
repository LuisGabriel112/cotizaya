import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { esAdmin } from "@/lib/server/supabase/sesion";

export const metadata: Metadata = { title: "Admin · Cotiza Ya", robots: { index: false, follow: false } };

// Quien no es admin ve un 404: ni siquiera se entera de que el panel existe.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await esAdmin(await clienteServidor()))) notFound();
  return <div className="mx-auto max-w-2xl px-4 pt-6 pb-16">{children}</div>;
}
