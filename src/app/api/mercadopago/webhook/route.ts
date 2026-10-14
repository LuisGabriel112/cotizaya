import { dependenciasWebhook } from "@/lib/server/pagos/dependencias";
import { procesarNotificacion } from "@/lib/server/pagos/webhook";

export const dynamic = "force-dynamic";

async function leerCuerpo(req: Request): Promise<{ type?: string; data?: { id?: string | number } }> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export async function POST(req: Request): Promise<Response> {
  const parametros = new URL(req.url).searchParams;
  const cuerpo = await leerCuerpo(req);
  const tipo = parametros.get("type") ?? parametros.get("topic") ?? cuerpo?.type ?? "";
  const dataId = parametros.get("data.id") ?? parametros.get("id") ?? String(cuerpo?.data?.id ?? "");
  const firma = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const status = await procesarNotificacion({ tipo, dataId, firma, requestId }, dependenciasWebhook());
  return new Response(null, { status });
}
