Cotiza Ya
PWA para que talleres de aluminio de Veracruz coticen desde el celular y envíen la cotización por WhatsApp.
Usuario: dueño de taller, 30–55 años, Android de gama media, usa la app en obra y bajo el sol.
Contexto de producto completo en PRODUCT.md; sistema visual en DESIGN.md.
Alcance del MVP, modelo de datos, fases y criterios de terminado en docs/GUIA.md.

Stack
Next.js (App Router) + TypeScript estricto. Server Components por defecto; "use client" solo donde haga falta.
Tailwind v4 con tokens de src/styles/tokens.css en @theme. Paleta por defecto desactivada. NO shadcn, NO librerías de UI.
Supabase: Postgres + RLS + auth por teléfono. Migraciones en supabase/migrations.
PDF con @react-pdf/renderer en src/lib/server/pdf.
Mercado Pago con el SDK oficial de Node. Zod para validación.
Reglas
Dinero siempre en centavos (int). Formato es-MX, $ con separador de miles.
Medidas en cm en la base; se muestran en m con 2 decimales.
Lógica de cálculo pura en src/lib/quote con tests en Vitest. Ningún componente calcula totales.
Toda tabla tiene workshop_id y política RLS. Nunca uses la service key en el cliente.
Textos de la interfaz en español de México, tuteo, frases cortas y concretas.
Diseño: orden de autoridad
Skill hoja-de-taller y DESIGN.md: concepto, tokens y prohibidos. Mandan sobre todo lo demás.
Impeccable (/impeccable): vocabulario de diseño, critique, audit y polish.
UI UX Pro Max: solo para guías de UX, accesibilidad y reglas específicas de Next.js o Tailwind. NO uses su generador de design system; ya tenemos uno.
frontend-design de Anthropic: principios generales.
Si dos skills chocan, gana la de número menor.

Antes de dar una pantalla por terminada
/impeccable critique y /impeccable audit sobre esa pantalla.
Skill revision-anti-ia.
npx impeccable detect src/ sin hallazgos nuevos.
Comandos
pnpm dev | pnpm test | pnpm test:e2e | pnpm typecheck | supabase db reset
Flujo
Trabaja una fase a la vez. Empieza en modo plan. Al terminar, corre test y typecheck, y resume qué cambió.