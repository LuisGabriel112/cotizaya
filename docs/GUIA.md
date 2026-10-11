# Cotiza Ya — Guía de construcción

11 oct 2026 · Luis Gabriel Venegas Saucedo

## Alcance del MVP

Una sola cosa bien: cotizar un trabajo de aluminio en menos de 3 minutos desde el celular y enviarlo por WhatsApp. Todo lo demás espera a que haya 10 fundadores pagando.

Entra:
1. Registro con número de teléfono (OTP por SMS o WhatsApp).
2. Perfil del taller: nombre, logo, teléfono y condiciones de pago.
3. Catálogo de materiales y precios, editable y precargado con perfiles, vidrios y herrajes comunes en Veracruz.
4. Plantillas de partida de un toque: ventana corrediza, cancel de baño, mosquitero, cambio de felpa y rodamientos, reemplazo por corrosión.
5. Cotización: cliente, partidas (medidas × material + mano de obra), descuento, IVA opcional y total.
6. PDF con logo, nota opcional de acabado (anodizado o pintura electrostática) y garantía contra salitre, más enlace público para WhatsApp.
7. Seguimiento: abierta, vista o aceptada, y aviso cuando el cliente abre el enlace.
8. Plan gratis (5 al mes) y pago con Mercado Pago: tarjeta, OXXO o transferencia.
9. Panel /admin mínimo: dar de alta talleres, cargar logo y catálogo y activar plan sin que ellos hagan nada.

No entra: CFDI, inventario, varios usuarios, agenda, app nativa. Es PWA instalable.

Orden: primero prototipo clicable (fase 1) para video demo y videollamadas. El resto solo si la preventa funciona.

## Stack

| Capa | Elección |
|---|---|
| Frontend | Next.js App Router + TS estricto, PWA. Server Components y poco JS en cliente (gama baja). |
| Estilos | Tailwind v4, tokens propios en @theme, paleta por defecto desactivada. Sin shadcn ni librerías. |
| BD y auth | Supabase (Postgres + RLS + OTP por teléfono) |
| PDF | @react-pdf/renderer en Route Handler |
| Pagos | Mercado Pago SDK Node: suscripción con tarjeta y pago único OXXO/transferencia (verificar medios por modalidad en docs) |
| Validación | Zod |
| Tests | Vitest (cálculo), Playwright (cotizar y enviar) |
| Hosting | Vercel |

```
cotiza-ya/
├─ CLAUDE.md
├─ PRODUCT.md / DESIGN.md   # los genera /impeccable init
├─ .claude/skills/          # skills externas y del proyecto
├─ src/styles/tokens.css    # tokens expuestos en @theme
├─ src/components/ui/       # componentes base propios
├─ src/lib/quote/           # cálculo (lógica pura + tests)
├─ src/lib/server/          # pdf, pagos, supabase admin
├─ src/app/(app)/           # app autenticada
├─ src/app/admin/           # panel de administración
├─ src/app/c/[slug]/        # vista pública de cotización
└─ supabase/migrations/
```

## Modelo de datos

Cada tabla lleva workshop_id y RLS al dueño del taller. Montos en centavos (int).

| Tabla | Campos clave |
|---|---|
| workshops | id, owner_id, nombre, logo_url, teléfono, condiciones, plan, plan_until, quotes_this_month, is_founder |
| materials | id, workshop_id, nombre, línea, unidad (m, m², pieza), precio_centavos |
| item_templates | id, workshop_id (null = global), nombre, partidas predefinidas (jsonb) |
| clients | id, workshop_id, nombre, teléfono |
| quotes | id, workshop_id, client_id, folio, status (borrador, enviada, vista, aceptada, rechazada), subtotal, descuento, iva, total, acabado, nota_garantia, public_slug, viewed_at |
| quote_items | id, quote_id, descripción, ancho_cm, alto_cm, material_id, cantidad, mano_obra_centavos, importe_centavos |
| quote_events | id, quote_id, tipo (enviada, abierta, aceptada), created_at |
| payments | id, workshop_id, proveedor, método (tarjeta, oxxo, transferencia), monto_centavos, periodo, status, external_id |
| admins | user_id. Panel protegido con RLS sobre esta tabla. |

/c/[slug] registra evento "abierta" y nunca expone otros datos del taller.

## Diseño

Ver skill `.claude/skills/hoja-de-taller`.

## Skills externas

| Skill | Uso | Instalación |
|---|---|---|
| Impeccable | init, critique, audit, polish, harden, detector | `npx impeccable install` o `/plugin marketplace add pbakaus/impeccable` |
| UI UX Pro Max | Consultas UX, a11y, Next.js/Tailwind | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` + `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`. Requiere Python 3. |
| frontend-design | Principios generales | Plugin oficial Anthropic |

Riesgo: UI UX Pro Max genera su propio design system. Solo consultas puntuales (`search.py "form validation" --stack nextjs` o `--domain ux`), nunca `--design-system`.

## Fases

Un prompt por sesión, en modo plan. Commit al final de cada fase.

- **Fase 0 — Base.** Next.js App Router, TS estricto, Tailwind v4, Vitest, Playwright, estructura de carpetas. tokens.css en @theme, paleta por defecto desactivada. Barlow, Barlow Condensed y JetBrains Mono con next/font. PWA instalable. Sin librerías de UI.
- **Fase 0b — Contexto de diseño.** Instalar skills externas y reiniciar. `/impeccable init` (Cotiza Ya: cotizador para talleres de aluminio en Veracruz, en obra, bajo el sol, una mano; modo producto, no marca). Luego DESIGN.md con tokens, principios, firmas y prohibidos de hoja-de-taller.
- **Fase 1 — Prototipo clicable (sin backend).** Datos falsos en memoria: lista de cotizaciones, nueva cotización (partidas con medidas), vista previa PDF, vista pública. Plantillas de costa. Capturar ventana 120 × 150 cm en menos de 30 s (se graba para video demo de 60 s). Luego /impeccable critique y polish en las cuatro, revision-anti-ia, y corregir.
- **Fase 2 — Cálculo.** Skill calculo-cotizacion. src/lib/quote puro con tests; 10 casos reales (corrediza, cancel de baño, puerta abatible, con/sin IVA, con descuento). Conectar prototipo.
- **Fase 3 — Datos y auth.** Migraciones del modelo, RLS por workshop_id, auth por teléfono. Reemplazar datos falsos. Test: un taller no lee cotizaciones de otro. Panel /admin (tabla admins): alta de taller, logo, catálogo desde CSV, activar plan.
- **Fase 4 — PDF y envío.** Skill pdf-cotizacion. PDF en servidor. /c/[slug] con evento de apertura. Botón "Enviar por WhatsApp" con mensaje prellenado y enlace.
- **Fase 5 — Cobro y límites.** Mercado Pago: suscripción tarjeta + pago único OXXO/transferencia que extiende plan_until 1 mes o 1 año. Webhook a payments con verificación de firma. Precio fundador $99/mes o $990/año. Límite 5/mes en gratis con aviso honesto cuando falten 2.
- **Fase 6 — Landing.** hoja-de-taller + copys del plan de marketing. Hero con cotización real llenándose, no mockup flotante. /impeccable critique landing y polish, luego revision-anti-ia.

## Criterios de terminado

- [ ] Taller real crea y envía cotización de 3 partidas en menos de 3 min, sin explicación.
- [ ] Totales coinciden al centavo con cálculo a mano en 10 casos.
- [ ] PDF legible en blanco y negro y menor de 300 KB.
- [ ] Interfaz legible bajo el sol en Android de gama media.
- [ ] Un taller no ve datos de otro (test RLS en verde).
- [ ] Desde /admin se configura taller nuevo con logo y catálogo en menos de 10 min.
- [ ] Pago OXXO activa el plan automáticamente al confirmarse.
- [ ] Pantallas principales pasaron revision-anti-ia.
- [ ] Lighthouse móvil ≥ 90 en rendimiento y accesibilidad.
