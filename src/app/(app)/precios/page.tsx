import { Encabezado } from "@/components/encabezado";
import { ReglaCinta } from "@/components/ui/regla-cinta";
import { agruparPorLinea } from "@/lib/catalogo/edicion";
import { RepositorioCatalogoSupabase } from "@/lib/server/catalogo/repositorio";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { exigirTaller } from "@/lib/server/supabase/sesion";
import { EditorCatalogo } from "./editor-catalogo";

export default async function Precios() {
  const db = await clienteServidor();
  const { workshopId } = await exigirTaller(db);
  const materiales = await new RepositorioCatalogoSupabase(db, workshopId).listar();
  return <main className="mx-auto max-w-md px-4 pb-32">
    <Encabezado titulo="Precios" atras={{ href: "/cotizaciones", texto: "Cotizaciones" }} />
    <ReglaCinta className="mt-5" />
    <EditorCatalogo grupos={agruparPorLinea(materiales)} />
  </main>;
}
