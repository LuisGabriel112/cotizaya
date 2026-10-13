import { formatFolio } from "@/lib/format";
import { armarDocumento } from "@/lib/server/pdf/documento";
import { generarPdf } from "@/lib/server/pdf";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { esSlugValido, leerVistaPublica } from "@/lib/server/supabase/publica";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  if (!esSlugValido(slug)) return new Response(null, { status: 404 });
  const vista = await leerVistaPublica(await clienteServidor(), slug);
  if (!vista) return new Response(null, { status: 404 });
  const pdf = await generarPdf(armarDocumento(vista));
  return new Response(Uint8Array.from(pdf), { headers: {
    "content-type": "application/pdf",
    "content-disposition": `inline; filename="cotizacion-${formatFolio(vista.cotizacion.folio)}.pdf"`,
    "cache-control": "private, no-store",
  } });
}
