import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cotizaya.guia", JSON.stringify(["lista", "captura", "medida", "partida", "vista-previa", "precios", "plan"])));
});

test("el prototipo abre la lista de ejemplo en español de México, sin login", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo\/cotizaciones$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();
});

test("es instalable: manifest e íconos responden", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.lang).toBe("es-MX");

  for (const icono of manifest.icons as { src: string }[]) {
    const img = await request.get(icono.src);
    expect(img.ok(), icono.src).toBe(true);
    expect(img.headers()["content-type"]).toContain("image/png");
  }
});
