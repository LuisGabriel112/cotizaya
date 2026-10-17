import { expect, test } from "@playwright/test";

test("la landing abre con una cotización ya hecha", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Cotiza Ya" })).toBeVisible();
  const hoja = page.getByRole("article", { name: "Hoja de cotización" });
  await expect(hoja.getByText("Ventana corrediza").first()).toBeVisible();
  await expect(hoja.getByTestId("total")).toHaveText("$4,268.80");
});

test("el visitante agrega una partida y el total se mueve", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mosquitero" }).click();
  await page.getByLabel("Ancho").fill("120");
  await page.getByLabel("Alto").fill("150");
  await expect(page.getByRole("article", { name: "Hoja de cotización" }).getByTestId("total")).toHaveText("$4,268.80");
  await page.getByRole("button", { name: "Agregar partida" }).click();
  await expect(page.getByRole("article", { name: "Hoja de cotización" }).getByTestId("total")).toHaveText("$5,037.88");
  await expect(page.getByLabel("Ancho")).toHaveValue("");
  await expect(page.getByLabel("Ancho")).toBeFocused();
});

test("el botón de abajo lleva a registrarse", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Cotizar gratis" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("en un celular de 360 × 640 los controles no quedan bajo la barra fija", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  const barra = (await page.locator("div.fixed").first().boundingBox())!;
  for (const id of ["#hero-ancho", "#hero-alto", "#hero-agregar"]) {
    const caja = (await page.locator(id).boundingBox())!;
    expect(caja.y + caja.height, `${id} bajo la barra`).toBeLessThanOrEqual(barra.y);
  }
  const tocable = await page.evaluate(() => {
    const campo = document.getElementById("hero-ancho")!.getBoundingClientRect();
    return document.elementFromPoint(campo.x + campo.width / 2, campo.y + campo.height / 2)?.id;
  });
  expect(tocable).toBe("hero-ancho");
});

test("al completar la demostración el cursor queda en el cierre", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 3; i++) {
    await page.getByLabel("Ancho").fill("120");
    await page.getByLabel("Alto").fill("150");
    await page.getByRole("button", { name: "Agregar partida" }).click();
  }
  await expect(page.getByText("Ya viste cómo va.", { exact: false })).toBeVisible();
  await expect(page.locator("#hero-cierre")).toBeFocused();
  await expect(page.getByRole("link", { name: "Hacer la mía con mis precios" })).toBeVisible();
});
