"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { pasarelaDeCobro } from "@/lib/server/pagos/dependencias";
import { clienteServidor } from "@/lib/server/supabase/cliente";
import { exigirTaller } from "@/lib/server/supabase/sesion";

export async function iniciarPago(form: FormData): Promise<void> {
  const periodo = z.enum(["mes", "anio"]).parse(form.get("periodo"));
  const { workshopId } = await exigirTaller(await clienteServidor());
  const url = await pasarelaDeCobro().crearPreferencia({ taller: workshopId, periodo });
  redirect(url);
}
