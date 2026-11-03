import { chromium, expect, request } from "@playwright/test";

const origen = new URL(process.env.PREVIEW_URL ?? "http://127.0.0.1:3100").origin;
const api = await request.newContext({ baseURL: origen });
try {
  const respuesta = await api.get("/entrar", { maxRedirects: 0 });
  expect(respuesta.status()).toBe(302);
  const destino = new URL(respuesta.headers().location, origen);
  expect(destino.origin).toBe(origen);
  expect(destino.pathname).toBe("/demo/cotizaciones");
} finally { await api.dispose(); }

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage({ viewport: { width: 360, height: 800 } });
  await pagina.goto(origen);
  await pagina.getByRole("link", { name: "Cotizar gratis", exact: true }).last().click();
  await expect(pagina).toHaveURL(`${origen}/demo/cotizaciones`);
  await expect(pagina.getByRole("heading", { name: "Cotizaciones", exact: true })).toBeVisible();
  console.log("Preview: redirección y clic inferior conservan origen/puerto; lista visible.");
} finally { await navegador.close(); }
