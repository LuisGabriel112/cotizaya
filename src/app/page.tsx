import { redirect } from "next/navigation";

// La landing llega en la fase 6; por ahora la entrada es la app.
export default function Home() {
  redirect("/cotizaciones");
}
