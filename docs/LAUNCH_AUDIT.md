# Auditoría de lanzamiento · 2026-11-02

Base: main@74bce70. Estado inicial: 538 tests aprobados, 49 omitidos de base; typecheck
y ESLint src aprobados. No se inspeccionaron valores de secretos ni producción.

| ID | Prioridad | Evidencia y ubicación | Impacto / acción / prueba |
| --- | --- | --- | --- |
| A-01 | P0 | src/lib/server/pagos/firma.ts: verificarFirma solo compara HMAC | Acepta timestamp antiguo; añadir ventana temporal y casos de replay/futuro/milisegundos. |
| A-02 | P0 | supabase/migrations/0007_registrar_pago.sql: registrar_pago condiciona crédito al status previo | approved→pending→approved puede extender dos veces; marca permanente y serialización, test SQL con replay y concurrencia. |
| A-03 | P0 | src/lib/cotizaciones/casos.ts: guardarPartida/recalcular; 0002_rls.sql otorga totales y precios | Escrituras separadas y DML directo admiten datos manipulados/incoherentes; cálculo autoritativo transaccional en SQL y tests de rollback, aislamiento y concurrencia. |
| A-04 | P1 | 0002_rls.sql: UPDATE/DELETE sin condición de borrador; 0003_funciones.sql: cotizacion_publica lee workshops actual | Cotización/PDF emitidos cambian con edición o perfil; congelar datos y probar cambios posteriores. |
| A-05 | P1 | 0003_funciones.sql: aceptar_cotizacion acepta borrador y repite evento; registrar_apertura actualiza cada visita | Transiciones sin guarda/idempotencia; acordar reglas y añadir tests de repetición. |
| A-06 | P1 | src/app/(app)/plan/page.tsx: avisos.aprobado depende de query string | Mensaje afirma plan activo sin evidencia de webhook; reemplazar confirmación por consulta/aviso neutral. |
| A-07 | P0 operativo, sin verificar | docs/CONTINUAR.md documenta OTP de prueba 123456 | No demuestra configuración actual. Auditar dashboard Auth en entorno autorizado antes del piloto; no probar teléfonos reales. |
| A-08 | P1 | docs/CONTINUAR.md y GUIA: restauración/sandbox/móvil pendientes; sin CI versionada | Preparar checks/operación; no declarar respaldo, restauración ni pagos reales probados. |
| A-09 | P1 | src/lib/server/pdf/documento.ts: vigencia fija; 0003 aceptar no valida fecha | Resolver emisión/vencimiento y reembolso como decisiones de producto; no inventarlas. |

## Ya presente, no reportado como vulnerabilidad

HMAC constant-time, consulta Payment API, precio/moneda y referencia validados en servidor;
RLS en todas las tablas; plan y permisos admin no escribibles por dueño; FKs compuestas;
getClaims verificado; cupo con bloqueo por taller; snapshot de material por partida;
PDF pequeño en tests. Se requieren regresiones de base para confirmar el alcance real.

## Pendientes no demostrables desde repositorio

Configuración real Auth/OTP/CAPTCHA/rate limits, secretos de Vercel, aplicación de RLS y
migraciones desplegadas, backups/PITR y restauración, cuentas sandbox MP, política legal,
operación de SMS, experiencia de talleres reales. No se declaran aprobados.

## Cierres de tareas

- T-01: baseline registrado; PostgreSQL local desechable ejecutó 53/53 tests de base.
- T-02 / A-01: reproducido (9 nuevas regresiones fallaban) y corregido. 26/26 tests
  de firma; reloj inyectado, ventana ±300 s, segundos/ms y rechazo de duplicados.
  No se ha validado la cadencia de reintentos en sandbox.
  Referencia primaria: https://github.com/mercadopago/sdk-nodejs/blob/master/docs/webhooks.md
  (tolerancia de 300 s, reloj sincronizado, deduplicación y estado desde API).
- T-03 / A-02: reproducidos replay de estados y reutilización del pago para otro
  taller/periodo. Migración 0008 preparada; marca credited_at, inserción concurrente
  idempotente y comparación de identidad. 62/62 tests SQL, incluidos nueve nuevos.
  Antes de migrar producción, conciliar pagos históricos no-approved: el esquema viejo
  no permite saber si fueron aprobados anteriormente. Backfill solo marca los approved;
  no se declara resuelta la conciliación ni la política comercial de reembolsos.
- T-04 / A-03: seis regresiones fallaban antes del cambio. Migración 0009 mantiene
  foto/precio autoritativos, importes y totales en la misma transacción, con bloqueo por
  cotización. 12 nuevas pruebas de integridad aprobadas: tres unidades, half-up,
  descuento/IVA, rollback por error/desbordamiento, escritura directa y concurrencia.
  Se ajustaron medidas de los fixtures SQL existentes (rls y catálogo) para que representen
  partidas válidas. Se conserva el protocolo de la app; su recálculo adicional ya no es
  necesario para persistir y no puede sobrescribir cifras calculadas por PostgreSQL.
  Pendiente conciliar datos históricos antes de migrar: no se reescribieron cotizaciones antiguas.
- T-06: siete nuevas regresiones reproducidas y corregidas (ID de recurso distinto,
  identificadores inválidos, query duplicada y excepción de configuración). 56/56 tests
  dirigidos de pagos/ruta aprobados; el backend retorna 502/503 recuperable sin filtrar
  el error privado. El proveedor sigue simulado; no hubo consulta a Mercado Pago real.
- Decisión del usuario: la vigencia será 15 días desde el primer envío. Pendiente su
  respuesta sobre congelar emitidas frente a permitir revisiones con historial.
- T-07a / A-06: aviso neutral de retorno de Checkout y valores no reconocidos ignorados.
  Siete pruebas nuevas aprobadas. EstadoPlan sigue leyendo el plan real desde el servidor.
- A-10 / P0 dependencias: build detenido por Next.js 16.4.0 y audit confirma dos
  avisos críticos y uno alto para Next; Zod 4.6.5 tiene un aviso alto adicional.
  No se ha demostrado explotación del proyecto: se confirma versión afectada, no ataque.
  Fuentes: https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw,
  https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr y pnpm audit.
  Actualización de parche propuesta: Next/eslint-config-next 16.4.4 y Zod 4.6.6.
- Audit también reporta uuid 9.0.1 transitivo de Mercado Pago (moderado, buffers de
  v3/v5/v6). El SDK instalado usa v4() sin argumentos en dist/utils/restClient/index.js.
  No se declara explotable aquí ni se fuerza un salto mayor del SDK sin necesidad.
- T-08 / A-11 (P1): reproducidos tres bypass por DML directo: antedatar created_at
  para no contar en el mes, borrar para recuperar cupo y alta ya aceptada. Migración
  0010 fija fecha/estado/apertura e impide DELETE de quotes al dueño; la app no ofrece
  esa operación. 77/77 pruebas SQL aprobadas, incluidas tres nuevas.
- T-05a: cinco regresiones de emisión fallaban antes del cambio. Migración 0011 fija
  sent_at/expires_at desde el primer envío (15 días), registra envío/aceptación/apertura
  una vez y protege el estado por RPC. 92/92 tests dirigidos SQL+repositorio aprobados.
  El backfill de fechas solo usa eventos de envío existentes; documentos históricos sin
  evidencia quedan pendientes de conciliación y no se pueden aceptar como vigentes.
- T-05b/c: fechas de emisión/vencimiento propagadas al dominio y compartidas por hoja/PDF.
  Diez pruebas de mapeo y 19 de documentos/fechas aprobadas; pendiente inspección visual.
- T-09 / A-10: Next/eslint-config-next 16.4.1 y Zod 4.6.6 instalados con lockfile.
  Build completo aprobado. pnpm audit --prod: 0 altos, 0 críticos, 1 moderado (uuid).
  Instalación frozen validada con las políticas existentes; sin nuevas excepciones pnpm.
- T-10a: cinco pruebas del guard de DB local aprobadas; preparador seguro aplicó las 11
  migraciones desde cero en otra base efímera. La suite completa pasó 653/653 sin omisiones
  y typecheck. Tests ya no cargan .env.local; CI preparada, aún no ejecutada en GitHub.
- Playwright: primera ejecución 18/19. Falló navegación captura→vista previa en el test
  existente; se está reproduciendo de forma aislada antes de atribuir causa o cambiarlo.
