import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// .env.local trae SUPABASE_DB_URL para los tests de RLS; sin él, esa suite se salta.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

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
