import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { ComoSeUsa, LoQueRecibeElCliente, Pie, Precio, Preguntas } from "@/components/landing/secciones";
import { BarraAccion } from "@/components/ui/barra-accion";
import { BotonEnlace } from "@/components/ui/boton";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { leerSesion } from "@/lib/server/supabase/sesion";

const PROMESA = "Mide, saca el precio y mándalo por WhatsApp sin bajarte de la obra.";

export const metadata: Metadata = {
  title: "Cotiza Ya · Cotiza aluminio desde el celular",
  description: PROMESA,
  openGraph: { title: "Cotiza Ya", description: PROMESA, locale: "es_MX", type: "website" },
};

/** Si la base no responde (o no hay llaves), la landing se sirve igual: es la cara pública del producto. */
async function tieneTaller(): Promise<boolean> {
  try {
    return (await leerSesion(await clienteServidor())).tipo === "taller";
  } catch {
    return false;
  }
}

export default async function Inicio() {
  if (await tieneTaller()) redirect("/cotizaciones");
  return (
    <>
      {/* El hero va antes de cualquier texto largo: a 360 × 640 los controles tienen que caber sin scroll. */}
      <main className="mx-auto max-w-md px-4 pt-8">
        <h1 className="titulo text-[2.5rem] leading-none">Cotiza Ya</h1>
        <p className="mt-2 text-xl">{PROMESA}</p>
        <Hero />
        <p className="mt-8 text-lg text-tinta-2">
          Para talleres de aluminio y vidrio de la costa: corredizas, canceles, mosquiteros y reemplazos por corrosión.
        </p>
        <ComoSeUsa />
        <LoQueRecibeElCliente />
        <Precio />
        <Preguntas />
      </main>
      <Pie />
      <BarraAccion>
        <BotonEnlace href="/entrar">Cotizar gratis</BotonEnlace>
      </BarraAccion>
    </>
  );
}
