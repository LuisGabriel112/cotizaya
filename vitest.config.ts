import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// La base de pruebas se pasa explícitamente; nunca cargar secretos reales de .env.local.

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // UTC a propósito: la máquina de desarrollo está en hora de México y ocultaría errores de zona.
    env: { TZ: "UTC" },
    include: ["src/**/*.test.ts", "supabase/tests/**/*.test.ts"],
    // La base remota tarda más que los tests puros.
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
