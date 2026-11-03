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
