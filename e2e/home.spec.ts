import { expect, test } from "@playwright/test";

test("la entrada lleva a la lista en español de México", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/cotizaciones$/);
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
