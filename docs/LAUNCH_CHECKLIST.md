# Checklist verificable

## Antes del piloto controlado

- [ ] Corregir y reproducir A-01/A-02/A-03 con regresiones.
- [ ] Revisar cambios y migraciones; aplicarlos solo con autorización y respaldo.
- [ ] Probar aislamiento con PostgreSQL real y roles; luego con Supabase de staging.
- [ ] Acordar y probar inmutabilidad, emisión, aceptación y vigencia de cotizaciones.
- [ ] Completar suite, typecheck, lint, E2E y build; registrar omisiones.
- [ ] Integrar los cambios pendientes del checkout original por revisión separada.
- [ ] Auth de pruebas: registro/ingreso/expiración sin OTP fijo utilizable por usuarios reales.
- [ ] Sandbox MP: pago aprobado/pendiente/rechazado y reintentos, sin pagos reales.
- [ ] Taller de pruebas: catálogo→cotización→guardar/recuperar→PDF→WhatsApp→aceptación.
- [ ] Backup y restauración probados en staging con RPO/RTO acordados.
- [ ] Aviso de privacidad, términos y política comercial revisados por responsable.

## Antes de abrir públicamente

- [ ] Medir Android real: tres partidas/enviar en <3 min, bajo el sol, PDF descargable.
- [ ] Lighthouse móvil ≥90 rendimiento/accesibilidad y revisión de errores de producción.
- [ ] Autorización para configurar servicios externos, despliegue y pagos reales.
- [ ] Monitorización, alertas, límites de abuso, soporte y procedimiento de incidentes.
- [ ] Dominios, HTTPS, configuración SMS, cobro, recuperación y retención aprobados.
- [ ] Revisar reembolsos/contracargos, restauración y acceso de administradores.

Estado: **no listo todavía** para piloto ni lanzamiento público. Las verificaciones
automatizadas y cambios preparados se registran en LAUNCH_AUDIT; no sustituyen estos pasos.
