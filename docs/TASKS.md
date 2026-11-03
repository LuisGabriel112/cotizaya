# Tareas de preparación comercial

Plan inicial: el usuario revisa/marca el estado al integrar. Resultados en LAUNCH_AUDIT.

### T-01 · Auditoría y verificador real
- Estado: pendiente de revisión; prioridad P0 habilitador; depende de: ninguna.
- Archivos: docs/{SPEC,ARCHITECTURE,TASKS,DECISIONS,LAUNCH_AUDIT,LAUNCH_CHECKLIST}.md;
  scripts/check.sh. Excepción documental: siete archivos, sin código de producto.
- Hacer: documentar arquitectura actual, evidencia, bloqueos y verificación con exit code.
- Aceptación: sin secretos ni falso CHECK OK; comandos de checks reales.
- Verificación: bash -n scripts/check.sh; comandos baseline registrados en auditoría.

### T-02 · Firma y frescura del webhook
- Estado: pendiente; prioridad P0; depende de T-01; paralelo con T-03 (sin compartir archivos).
- Archivos: specs/lanzamiento/webhook.feature; src/lib/server/pagos/{firma.ts,firma.test.ts}.
- Hacer: reloj inyectable; rechazar firmas antiguas/futuras y ts ambiguo; conservar HMAC.
- Aceptación: HMAC correcto fuera de ventana no pasa; segundos y ms válidos sí.
- Verificación: pnpm exec vitest run src/lib/server/pagos/firma.test.ts.

### T-03 · Pago acreditado exactamente una vez
- Estado: pendiente; prioridad P0; depende de T-01.
- Archivos: specs/lanzamiento/pagos.feature; supabase/migrations/0008_pago_idempotente.sql;
  supabase/tests/pagos-lanzamiento.test.ts.
- Hacer: crédito permanente, bloqueo por pago y taller, preservar asociación e importe.
- Aceptación: pending/rejected no activan; replay, concurrencia y estados alternados no
  duplican; RPC sigue privada; migración no ejecutada en nube.
- Verificación: pnpm exec vitest run supabase/tests/pagos-lanzamiento.test.ts con DB local.

### T-04 · Integridad transaccional de cotizaciones
- Estado: pendiente; prioridad P0; depende de T-03 (orden de migraciones).
- Archivos: specs/lanzamiento/integridad.feature; supabase/migrations/0009_integridad_cotizaciones.sql;
  supabase/tests/integridad.test.ts; supabase/tests/rls.test.ts (fixture con medidas válidas).
- Hacer: serializar por cotización; fijar foto de catálogo, calcular importes y totales en
  la misma transacción; rechazar valores inválidos y manipulación; conservar interfaz app.
- Aceptación: totales nunca dependen de una segunda petición; rollback y concurrencia coherentes.
- Verificación: pnpm exec vitest run supabase/tests.

### T-05 · Emisión y documento congelado
- Estado: pendiente; prioridad P1; depende de T-04.
- Archivos previstos: specs/lanzamiento/emision.feature; migración incremental;
  supabase/tests/emision.test.ts; repositorio y su test si hace falta.
- Hacer: capturar datos comerciales al emitir; proteger ediciones/borrado y evento de envío;
  aceptar una vez solo documentos emitidos. Revisar compatibilidad con vista previa.
- Aceptación: documento compartido no cambia con catálogo/perfil; apertura/aceptación idempotentes.
- Verificación: tests SQL + repositorio; E2E demo; bloqueos de vigencia documentados.

### T-06 · Identidad del pago y errores de integración
- Estado: pendiente; prioridad P0/P1; depende de T-02.
- Archivos previstos: webhook.ts, webhook.test.ts, route.ts, route.test.ts y spec de pagos.
- Hacer: validar ID consultado contra recurso, cuerpos/parametría inválidos y errores de configuración.
- Aceptación: no acreditar recursos distintos al firmado; 5xx recuperable sin secretos.
- Verificación: tests dirigidos de webhook/ruta.

### T-07 · Aviso comercial veraz y verificación final
- Estado: pendiente; prioridad P1; depende de T-02..T-06.
- Archivos previstos: aviso puro y tests, plan/page.tsx, spec comercial y CI.
- Hacer: no confirmar activación por query string; CI con DB y checks reales;
  consolidar riesgos/pasos manuales en informe final.
- Aceptación: pnpm test/typecheck/eslint, SQL local, Playwright y build con resultados explícitos.
- Verificación: scripts/check.sh en modo completo. Auth/sandbox y legal se registran como pendientes.

## Ampliación por hallazgos reproducidos durante la ejecución

### T-08 · Cerrar bypass del cupo mediante escrituras directas
- Estado: pendiente de revisión; prioridad P1; depende de T-04; paralelo con T-09.
- Archivos: specs/lanzamiento/cupo.feature; supabase/tests/cupo-lanzamiento.test.ts;
  supabase/migrations/0010_cupo_antibypass.sql.
- Hacer: impedir antedatar altas, alterar estado inicial y borrar para recuperar cupo.
- Aceptación: sexta alta rechazada aunque mande fecha vieja; DELETE autenticado negado.
- Verificación: pnpm exec vitest run supabase/tests con base local.

### T-09 · Parchear dependencias con advisories confirmados
- Estado: pendiente; prioridad P0; depende de T-01; paralelo con T-08.
- Archivos: package.json, pnpm-lock.yaml; evidencia en auditoría y decisiones.
- Hacer: parche de Next y Zod, alinear eslint-config-next; conservar controles pnpm.
- Aceptación: audit sin avisos altos/críticos de esos paquetes y build sin bloqueo.
- Verificación: pnpm audit --prod; pnpm build; tests y typecheck.

### T-10 · CI y base de pruebas protegida
- Estado: pendiente; prioridad P1; depende de T-09.
- Archivos previstos: workflow CI; preparador seguro de base y su test; conexión de
  tests y scripts/check.sh; excepciones documentadas si requiere dividir en subtareas.
- Hacer: restringir tests destructivos a base local aislada; CI con Postgres y checks.
- Aceptación: no usar .env real ni credenciales cloud; cero verificaciones ficticias.
- Verificación: scripts/check.sh completo contra PostgreSQL efímero; revisar workflow.
