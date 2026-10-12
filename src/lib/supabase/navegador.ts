"use client";

import { createBrowserClient } from "@supabase/ssr";
import { entornoPublico } from "./entorno";

/** Solo para entrar con OTP; los datos viajan por Server Actions. */
export const clienteNavegador = () => {
  const { url, llave } = entornoPublico();
  return createBrowserClient(url, llave);
};
