import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { cargarDatosApp } from "@/lib/server/supabase/datos-app";
import { leerSesion } from "@/lib/server/supabase/sesion";
import { ProveedorSupabase } from "./proveedor";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const db = await clienteServidor();
  const sesion = await leerSesion(db);
  if (sesion.tipo !== "taller") redirect("/entrar");
  const datos = await cargarDatosApp(db, sesion.workshopId);
  return <ProveedorSupabase datos={datos}>{children}</ProveedorSupabase>;
}
