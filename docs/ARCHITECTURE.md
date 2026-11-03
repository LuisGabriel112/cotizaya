# Arquitectura existente y verificación de lanzamiento

Next.js 16.4 App Router, React 19.3, TypeScript estricto, Tailwind 4, Supabase Auth/DB,
Mercado Pago SDK 2.12, Zod 4, React PDF 4.9. Gestor pnpm y pnpm-lock.yaml existentes.
Vitest 5 y Playwright 1.64. Versiones comprobadas en package.json y lockfile.

## Estructura y flujos

- src/lib/quote: cálculo puro en centavos, medidas cm, redondeo half-up; tests reales.
- src/lib/cotizaciones: casos, puertos, reductor y agrupación de edición optimista.
- src/app/(app)/acciones.ts: valida Zod, exige taller de sesión, usa repositorio Supabase.
- src/lib/server/supabase: cliente de cookies, getClaims, mapeo y repositorios con RLS.
- src/app/c/[slug]: lectura pública por RPC limitada al slug y generación PDF en servidor.
- src/lib/server/pagos: HMAC, consulta Payment API, interpretación y RPC registrar_pago.
- supabase/migrations: esquema, privilegios por columnas, RLS y funciones security definer.
- src/app/admin: autorización en layout y funciones SQL que vuelven a exigir admin.

Entidades: workshops(owner_id único, plan/plan_until); materials; item_templates;
clients; quotes(workshop_id, folio único por taller, slug único, estado y totales);
quote_items(FK compuesta a cotización/material del taller, foto de precio);
quote_events; payments(external_id único); admins. Esquema exacto en migraciones.

## Límites de confianza

La llave anon es pública; RLS y permisos SQL son la frontera incluso si se omiten Server
Actions. service_role solo en dependencias del webhook. Claims de sesión se verifican;
no basta leer cookies. Funciones privilegiadas fijan search_path y limitan execute.
Mercado Pago se consulta server-side: la redirección de Checkout no prueba un pago.

## Estrategia de corrección

Conservar puertos y convenciones existentes; endurecer firma e idempotencia con pruebas.
Añadir migraciones incrementales, nunca reescribir las ya aplicadas. Los cambios de base
se ejecutan exclusivamente en PostgreSQL local desechable con stub de Auth/Storage;
esto prueba PostgreSQL/RLS, no equivale a probar Supabase Auth o PostgREST completos.

Migraciones preparadas 0008–0014: credited_at permanente por pago; cálculo y bloqueos
transaccionales; cupo con altas no antedatables; sent_at/expires_at; respuesta pública
con lista positiva; issued_snapshot por emisión; revision_of_id/revision_root_id y
superseded_at. RPCs emitir/revisar/historial validan el taller server-side. La revisión
conserva versiones previas, toma precios actuales y exige materiales aún existentes;
fallos revierten toda la creación. Ninguna migración se aplicó en nube.

La emisión espera confirmaciones de partidas y del debounce de edición. WhatsApp solo
navega tras confirmar la emisión. Se conserva el flujo optimista durante la captura;
el fallo de una escritura impide compartir y se recuperan datos del servidor.

## Verificación

scripts/check.sh: ESLint src, typecheck, Vitest y, en modo completo, base local,
Playwright y build. Guarda logs fuera del código y conserva los códigos de salida.
Sin base configurada el modo completo falla explícitamente. Para tareas: comandos
dirigidos en TASKS.md. No cargar .env.local productivo en tests.

Servicios externos: pruebas unitarias con dependencias inyectadas; sandbox MP y OTP
requieren un entorno de pruebas autorizado. Build y E2E demo no demuestran pagos reales.
