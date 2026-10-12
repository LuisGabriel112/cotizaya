import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-MX",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "android-360",
      use: { ...devices["Galaxy S9+"], viewport: { width: 360, height: 740 } },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    // /demo no necesita Supabase: sirve para saber que el servidor ya levantó.
    url: `http://localhost:${PORT}/demo/cotizaciones`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
