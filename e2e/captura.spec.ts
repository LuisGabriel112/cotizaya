import { expect, test } from "@playwright/test";

test("ventana corrediza 120 × 150: de la lista al enlace del cliente", async ({ page }) => {
  await page.goto("/demo/cotizaciones");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const inicio = Date.now();

  await page.getByRole("button", { name: "Nueva cotización" }).click();
  await expect(page.getByRole("heading", { name: "¿Qué trabajo es?" })).toBeVisible();

  await page.getByRole("button", { name: /Corrediza/ }).click();
  await page.getByLabel("Ancho en centímetros").fill("120");
  await page.keyboard.press("Enter");
  await page.getByLabel("Alto en centímetros").fill("150");
  // 1.8 m² × $1,850 + $350 de mano de obra: la partida ya cae a la hoja con el total al día
  await expect(page.getByTestId("total")).toHaveText("$3,680.00");
  await page.getByRole("button", { name: "Agregar partida" }).click();

  await expect(page.getByTestId("total")).toHaveText("$3,680.00");
  const segundos = (Date.now() - inicio) / 1000;
  console.log(`Captura 120 × 150 en ${segundos.toFixed(1)} s (automatizada)`);
  expect(segundos).toBeLessThan(30);

  await page.getByRole("button", { name: "Ver cotización" }).click();
  await expect(page.getByRole("heading", { name: "Así la recibe" })).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("$3,680.00");

  await page.context().route("https://wa.me/**", (r) => r.fulfill({ body: "" }));
  const whatsapp = page.getByRole("link", { name: "Enviar por WhatsApp" });
  const [popup] = await Promise.all([page.waitForEvent("popup"), whatsapp.click()]);
  const href = decodeURIComponent((await whatsapp.getAttribute("href")) ?? "");
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=Hola\. Te mando la cotización No\. 0043 .* por \$3,680\.00\. .*\/c\/faro-0043-/);
  await popup.close();

  await page.getByRole("link", { name: "Ver el enlace del cliente" }).click();
  await page.getByRole("button", { name: "Aceptar cotización" }).click();
  await expect(page.getByRole("status")).toContainText("Aceptada.");

  await page.goto("/demo/cotizaciones");
  await expect(page.getByText("Tu cliente la aceptó")).toBeVisible();
});

test("una medida en cero no deja agregar la partida", async ({ page }) => {
  await page.goto("/demo/cotizaciones/nueva");
  await page.getByRole("button", { name: /Corrediza/ }).click();
  await page.getByLabel("Ancho en centímetros").fill("0");
  await expect(page.getByRole("button", { name: "Siguiente: alto" })).toBeDisabled();
});

test("medida con coma y dos ventanas iguales: redondea al cm y cobra dos instalaciones", async ({ page }) => {
  await page.goto("/demo/cotizaciones/nueva");
  await page.getByRole("button", { name: /Corrediza/ }).click();
  await page.getByLabel("Ancho en centímetros").fill("120,5");
  await page.keyboard.press("Enter");
  await page.getByLabel("Alto en centímetros").fill("150");
  await page.getByRole("button", { name: "Una más" }).click();
  // 1.21 × 1.50 = 1.815 m² × $1,850 × 2 = $6,715.50 + $350 × 2 = $7,415.50
  await expect(page.getByTestId("total")).toHaveText("$7,415.50");
  await page.getByRole("button", { name: "Agregar partida" }).click();
  await expect(page.getByText("1.21 × 1.50 m ×2")).toBeVisible();
});
