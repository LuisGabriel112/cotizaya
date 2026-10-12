import { clienteServidor } from "@/lib/server/supabase/cliente";
import { leerVistaPublica } from "@/lib/server/supabase/publica";
import { VistaPublica } from "./vista";

// Lo que ve el cliente al abrir el enlace. Solo esta cotización; nada más del taller.
export default async function Publica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vista = await leerVistaPublica(await clienteServidor(), slug);
  return <VistaPublica slug={slug} vista={vista} />;
}
