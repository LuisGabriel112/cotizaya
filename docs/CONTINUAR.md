# Continuar Cotiza Ya en otra máquina

Estado al 2026-10-15. Rama `main`, sincronizada con `origin/main`. Producción: https://cotizaya-gray.vercel.app

## Arrancar

1. `git clone` del repo y `corepack pnpm install`.
2. Copiar `.env.example` a `.env.local` y llenar las variables (las llaves reales viven en Supabase, Mercado Pago y Vercel; no están en el repo).
3. `corepack pnpm dev`.
4. Tests de app: `corepack pnpm vitest run src`. Tests de base (necesitan `SUPABASE_DB_URL`): `node --env-file=.env.local node_modules/vitest/vitest.mjs run supabase/tests`.
5. Vercel: `vercel link` y luego `vercel --prod --yes` para desplegar.

## Hecho

- Cotizaciones, PDF público, límite de 5 al mes en plan gratis.
- Cobro del plan fundador con Mercado Pago (webhook firmado, 200 si MP no conoce el pago). Credenciales reales activas en Vercel.
- Catálogo editable en `/precios`.
- Login por teléfono con OTP de prueba `123456`.

## Falta para el MVP (en este orden)

1. Marcar en el panel de avance los pendientes ya cumplidos.
2. Fase 6: landing con hero de cotización real (Gherkin, tests, implementación).
3. Tests de `proveedor.tsx`, `/admin` y `/entrar`.
4. Medir en celular: cotizar en menos de 3 min, legibilidad bajo el sol, Lighthouse móvil >= 90, descarga del PDF.
5. Pago real de $99 (reembolsable) para confirmar que el plan se activa.
6. SMS reales (ver decisiones abiertas).

## Decisiones abiertas

- **SMS:** Twilio trial no sirve (saldo negativo, solo números verificados) y subir de plan pide unos $20 USD. Alternativas nativas en Supabase: Vonage, Bird. Con Send SMS Hook: Plivo (la tarifa más baja vista, ~$0.005 por SMS a México, dato de 2025), Telnyx. WhatsApp también es posible (Twilio con `channel: "whatsapp"` o Meta Cloud API con hook) pero exige verificación de Meta. Sendly se descartó por precio ($0.16 por SMS). Hasta que haya un taller real, se queda `123456`.
- **Talleres duplicados** "joshi" y "taller v" en la base: revisar si son intencionales.
- **`.agents/` y `.codex/`:** sin versionar; decidir gitignore o borrar.

## Reglas del proyecto

Protocolo del usuario: Gherkin, tests, implementación mínima, refactor, verificación. Funciones de 4 a 20 líneas, archivos de máximo 500, complejidad máxima 6, cobertura 100% de líneas nuevas. Ver `CLAUDE.md` y `AGENTS.md`.
