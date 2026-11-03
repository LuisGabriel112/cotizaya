# Operación necesaria antes del piloto

Esta es una preparación para revisión. No se ejecutó contra Vercel, Supabase ni Mercado
Pago productivos; no contiene credenciales ni autorización de despliegue.

## Staging aislado

Usar proyecto Supabase y aplicación/cuentas Mercado Pago de pruebas, sin usuarios ni
pagos reales. Confirmar versiones, variables requeridas en .env.example y permisos por
nombre, nunca volcando valores a logs. No copiar .env reales al entorno de agentes.
Necesita autorización para crear/configurar servicios externos y desplegar.

## Antes de migrar datos existentes

1. Guardar copia/exportación verificable y confirmar cómo restaurarla en otro proyecto.
2. Revisar el diff y conciliar pagos: los no-approved podrían haber acreditado antes;
   el esquema anterior no conserva ese dato. 0008 solo inicializa marcas approved.
3. Conciliar totales/importes históricos con fotos de materiales. 0009 protege futuras
   escrituras, no afirma reparar datos anteriores ni restaurar precios ya cambiados.
4. Revisar documentos emitidos sin evento enviada: no inventar fecha ni vencimiento.
   0011 usa el primer evento conocido. 0013 conserva el contenido disponible al migrar;
   no reconstruye una oferta histórica que ya hubiera sido alterada.
5. Probar 0008–0014 en una restauración de staging antes de cualquier aplicación remota.
6. Coordinar migración y aplicación: el cliente anterior intenta escribir status/eventos
   directamente y dejará de poder emitir con los permisos nuevos. El nuevo cliente usa RPC.
7. El migrador exige verificar TLS remoto; si el entorno requiere CA propia, provisionar
   su certificado de confianza en staging. No volver a desactivar verificación para conectarlo.

## Respaldo y restauración

Definir responsable, frecuencia, retención, almacenamiento cifrado y RPO/RTO aceptables.
Verificar qué incluye el plan Supabase contratado (DB y Storage se respaldan por separado).
En staging: exportar, restaurar en proyecto aislado, aplicar permisos/migraciones y comprobar
conteos, relaciones, RLS, cotizaciones/PDF y planes. Registrar tiempo, fecha y resultado.
No considerar un backup probado solo porque existe el archivo o se paga un servicio.

## Prueba comercial mínima de staging

- OTP real de pruebas y sesión expirada: nada de códigos fijos para usuarios reales.
- Dos talleres: registro/ingreso, configuración, catálogo y accesos cruzados denegados.
- Cotización con tres partidas: guardar/recargar, fechas, PDF y WhatsApp.
- Edición pendiente seguida inmediatamente de envío; fallo de red no emite parcialmente.
- Emisión, apertura/aceptación repetida, vencimiento, revisión e historial de versiones.
- Perfil/catálogo cambiados después: documento anterior conserva su contenido.
- Catálogo eliminado: revisión falla sin borrador parcial; usar materiales existentes
  en el piloto o crear una nueva cotización manual mientras se decide recuperación de archivo.
- Cinco altas gratis y revisión al agotar cupo: no bypass de la base.
- Mercado Pago sandbox: pending/rejected/approved, replay/concurrencia y precio/moneda incorrectos.
- Confirmar política para refunded/charged_back y soporte; no se revoca automáticamente un
  acceso ya concedido sin una decisión comercial y pruebas específicas.

## Observación y vuelta atrás

Alertas de fallos HTTP/DB, errores de pagos sin payloads privados, disponibilidad y errores
de emisión. Acordar quién responde y cómo deshabilitar cobro/altas durante un incidente.
Conservar versión anterior de la app y respaldo; no improvisar down migrations destructivas.
Tras endurecer permisos, restaurar solo la app antigua no restablece su contrato de emisión.

## Aprobaciones humanas

Privacidad/términos, responsable comercial, precios/reembolsos, SMS y límites de abuso;
prueba con taller real y Android físico. El usuario revisa el diff, mergea y autoriza push,
staging, migraciones y producción por separado. Ninguno se ejecutó en esta sesión.
