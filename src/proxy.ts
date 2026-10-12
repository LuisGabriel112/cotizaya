import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { entornoPublico } from "@/lib/supabase/entorno";

// Refresca la sesión en cada visita a la app y manda a /entrar a quien no la tiene.
// La autorización de verdad la hacen RLS y los layouts; esto solo evita pantallas vacías.
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const { url, llave } = entornoPublico();
  const supabase = createServerClient(url, llave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (nuevas) => {
        for (const { name, value } of nuevas) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of nuevas) respuesta.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (!data && request.nextUrl.pathname !== "/entrar") return NextResponse.redirect(new URL("/entrar", request.url));
  return respuesta;
}

// /demo y /c/[slug] quedan fuera: el prototipo y el cliente del taller no tienen cuenta.
export const config = {
  matcher: ["/cotizaciones/:path*", "/admin/:path*", "/entrar"],
};
