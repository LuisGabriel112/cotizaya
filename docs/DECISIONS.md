# Decisiones de preparación del lanzamiento

- 2026-11-02: trabajar desde main@74bce70 en launch/pilot-20261102, worktree separado.
  No copiar ni sobrescribir cambios sin commit del checkout original.
- La misión actual autoriza commits en ramas y documentación TASKS; prevalece sobre
  la prohibición de commits anterior de AGENTS.md. Sin push/despliegue/migración remota.
- No incorporar automáticamente las pruebas TSX sin commit ni su configuración: su
  revisión/integración con el autor queda pendiente. No contarlas como verificadas.
- Checkout Pro es pago único renovable, conforme a specs/fase-5/cobro.feature.
- Mantener HMAC local con node:crypto; no actualizar el SDK para una función que ya
  existe. Añadir reloj inyectable y tolerancia de cinco minutos, segundos/milisegundos.
  Validar reintentos del proveedor en sandbox antes de activar el cambio en producción.
- Sin dependencias nuevas. PostgreSQL local efímero para pruebas; no tocar laguna.
- TASKS describe el plan; los cierres se registran en LAUNCH_AUDIT y commits para que
  el usuario revise y marque las tareas al mergear.
- Usuario: vigencia de 15 días desde el primer envío. La fecha se registra en base y
  no se renueva al volver a compartir. No inferir envío de un timestamp de creación.
- Dependencias: elegir Next/eslint-config-next 16.4.1 (parche publicado el 14 de octubre)
  y Zod 4.6.6, sin mantener excepciones nuevas de antigüedad de paquetes. 16.4.4 se
  publicó el mismo día del trabajo; no es necesario para los advisories confirmados.
