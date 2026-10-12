import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { leerSesion } from "@/lib/server/supabase/sesion";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar · Cotiza Ya" };

export default async function Entrar() {
  const sesion = await leerSesion(await clienteServidor());
  if (sesion.tipo === "taller") redirect("/cotizaciones");
  return (
    <main className="mx-auto max-w-md px-4 pt-8 pb-32">
      <h1 className="titulo text-[2.5rem] leading-none">Cotiza Ya</h1>
      <p className="mt-2 text-lg text-tinta-2">Entra con tu número de celular. Te mandamos un código por mensaje.</p>
      <FormularioEntrar conSesion={sesion.tipo === "sin-taller"} />
    </main>
  );
}
