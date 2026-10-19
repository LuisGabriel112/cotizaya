import { expect, test, type Locator, type Page } from "@playwright/test";

const guia = (page: Page) => page.getByRole("dialog");

async function abrirListaLimpia(page: Page) {
  await page.goto("/demo/cotizaciones");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** El marco amarillo envuelve al elemento señalado. */
async function esperarRecorteSobre(page: Page, objetivo: Locator) {
  const marco = await page.locator("#guia-marco").boundingBox();
  const caja = await objetivo.boundingBox();
  expect(marco && caja).toBeTruthy();
  expect(marco!.x).toBeLessThanOrEqual(caja!.x);
  expect(marco!.y).toBeLessThanOrEqual(caja!.y);
  expect(marco!.x + marco!.width).toBeGreaterThanOrEqual(caja!.x + caja!.width);
  expect(marco!.y + marco!.height).toBeGreaterThanOrEqual(caja!.y + caja!.height);
}

async function terminar(page: Page) {
  const siguiente = page.locator("#guia-siguiente");
  while ((await siguiente.textContent()) !== "Entendido") await siguiente.click();
  await siguiente.click();
  await expect(guia(page)).toBeHidden();
}

test("la guía de la lista arranca sola, señala Nueva cotización y se recorre", async ({ page }) => {
  await abrirListaLimpia(page);
  const nueva = page.getByRole("button", { name: "Nueva cotización" });

  await expect(guia(page)).toBeVisible();
  await expect(guia(page)).toContainText("1 de 2");
  await expect(page.locator("#guia-siguiente")).toBeFocused();
  await esperarRecorteSobre(page, nueva);
  // El botón señalado está en la barra de abajo: la hoja va justo encima, sin taparlo.
  await expect(page.locator("#guia-hoja")).toHaveAttribute("data-lado", "encima");
  const hoja = await page.locator("#guia-hoja").boundingBox();
  const boton = await nueva.boundingBox();
  expect(hoja!.y + hoja!.height).toBeLessThanOrEqual(boton!.y);

  await page.locator("#guia-siguiente").click();
  await expect(guia(page)).toContainText("2 de 2");
  await expect(page.locator("#guia-siguiente")).toHaveText("Entendido");
  await page.locator("#guia-atras").click();
  await expect(guia(page)).toContainText("1 de 2");

  await terminar(page);
  await nueva.click();
  await expect(page.getByRole("heading", { name: "¿Qué trabajo es?" })).toBeVisible();
});

test("tocar lo resaltado hace la acción y cierra la guía; tocar lo oscuro no hace nada", async ({ page }) => {
  await abrirListaLimpia(page);
  await expect(guia(page)).toBeVisible();

  await page.mouse.click(180, 60);
  await expect(guia(page)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();

  await page.getByRole("button", { name: "Nueva cotización" }).click();
  await expect(page.getByRole("heading", { name: "¿Qué trabajo es?" })).toBeVisible();
  await expect(guia(page)).toContainText("Elige el trabajo");
  await expect(guia(page)).toContainText("1 de 1");

  await page.getByRole("button", { name: /Corrediza/ }).click();
  await expect(page.getByLabel("Ancho en centímetros")).toBeVisible();
  await expect(guia(page)).toContainText("Teclea la medida");
});

test("la rejilla de trabajos no queda tapada por la hoja", async ({ page }) => {
  await abrirListaLimpia(page);
  await terminar(page);
  await page.getByRole("button", { name: "Nueva cotización" }).click();
  await expect(guia(page)).toBeVisible();
  const hoja = await page.locator("#guia-hoja").boundingBox();
  const rejilla = await page.locator('[data-guia="trabajos"]').boundingBox();
  expect(rejilla!.y + rejilla!.height).toBeLessThanOrEqual(hoja!.y);
});

test("con teclado el foco no se va a lo que está bajo lo oscuro", async ({ page }) => {
  await abrirListaLimpia(page);
  await expect(page.locator("#guia-siguiente")).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const dentro = await page.evaluate(() => {
      const activo = document.activeElement;
      return !!activo && (!!activo.closest("dialog") || !!activo.closest('[data-guia="nueva"]'));
    });
    expect(dentro).toBe(true);
  }
});

test("saltar la deja vista: no vuelve a salir al recargar", async ({ page }) => {
  await abrirListaLimpia(page);
  await page.getByRole("button", { name: "Saltar guía" }).click();
  await expect(guia(page)).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();
  await expect(guia(page)).toBeHidden();
});

test("Escape la cierra y también queda vista", async ({ page }) => {
  await abrirListaLimpia(page);
  await expect(guia(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(guia(page)).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();
  await expect(guia(page)).toBeHidden();
});

test("cada pantalla trae su guía una sola vez: lista, cotización, medida y vista previa", async ({ page }) => {
  await abrirListaLimpia(page);
  await terminar(page);

  await page.getByRole("button", { name: "Nueva cotización" }).click();
  await expect(guia(page)).toBeVisible();
  await esperarRecorteSobre(page, page.locator('[data-guia="trabajos"]'));
  await terminar(page);

  await page.getByRole("button", { name: /Corrediza/ }).click();
  await expect(guia(page)).toBeVisible();
  await esperarRecorteSobre(page, page.getByLabel("Ancho en centímetros"));
  await terminar(page);

  await page.getByLabel("Ancho en centímetros").fill("120");
  await page.keyboard.press("Enter");
  await page.getByLabel("Alto en centímetros").fill("150");
  await page.getByRole("button", { name: "Agregar partida" }).click();

  // Con la primera partida ya hay total y "Ver cotización" sirve: hasta entonces se explican.
  await expect(guia(page)).toBeVisible();
  await expect(guia(page)).toContainText("1 de 3");
  await esperarRecorteSobre(page, page.locator('[data-guia="total"]'));
  await terminar(page);
  await page.getByRole("button", { name: "Ver cotización" }).click();

  await expect(guia(page)).toBeVisible();
  await esperarRecorteSobre(page, page.getByRole("link", { name: "Enviar por WhatsApp" }));
  await terminar(page);

  await page.getByRole("link", { name: "Cotizaciones" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();
  await expect(guia(page)).toBeHidden();
});

test("Cómo se usa vuelve a mostrar las guías", async ({ page }) => {
  await abrirListaLimpia(page);
  await terminar(page);
  await page.getByRole("button", { name: "Cómo se usa" }).click();
  await expect(guia(page)).toBeVisible();
  await expect(guia(page)).toContainText("1 de 2");
});

test("si el navegador no deja guardar, no sale la guía y la lista funciona", async ({ page }) => {
  // Solo se bloquea la clave de la guía: el prototipo guarda sus cotizaciones en el mismo localStorage.
  await page.addInitScript(() => {
    const { getItem, setItem } = Storage.prototype;
    Storage.prototype.getItem = function (clave: string) {
      if (clave === "cotizaya.guia") throw new Error("bloqueado");
      return getItem.call(this, clave);
    };
    Storage.prototype.setItem = function (clave: string, valor: string) {
      if (clave === "cotizaya.guia") throw new Error("bloqueado");
      setItem.call(this, clave, valor);
    };
  });
  await page.goto("/demo/cotizaciones");
  await expect(page.getByRole("heading", { level: 1, name: "Cotizaciones" })).toBeVisible();
  await expect(guia(page)).toBeHidden();
});
