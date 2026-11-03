# CotizaYa: preparación del piloto

Fuente de producto: PRODUCT.md y docs/GUIA.md. Este documento añade criterios de
lanzamiento; no sustituye sus decisiones válidas ni amplía el MVP.

## Alcance y roles

Dueño: OTP, configurar taller y catálogo, crear cotizaciones, PDF y WhatsApp, comprar
acceso fundador. Cliente: ver y aceptar la cotización compartida. Admin: alta y
configuración de talleres y planes. Un dueño por taller; sin CFDI ni inventario.

El cobro implementado es **pago único renovable**, no suscripción recurrente: Checkout
Pro compra un mes ($99 MXN) o un año ($990 MXN). La spec fase-5 confirma esta decisión;
la mención a suscripciones en la guía original no describe el código implementado.

## Criterios verificables

- US-01: JWT verificado y RLS impiden lectura/escritura entre talleres; no hay key
  privilegiada en módulos de cliente.
- US-02: solo webhooks con HMAC correcto y timestamp reciente pueden consultar pagos;
  API confiable valida identidad, moneda y monto. Una aprobación extiende una sola vez,
  incluso con concurrencia o alternancia de estados.
- US-03: guardar/quitar partidas o cambiar descuento/IVA mantiene importes y totales
  coherentes dentro de la transacción de base, con dinero entero y redondeo half-up.
- US-04: datos comerciales emitidos y datos del taller del PDF quedan congelados;
  abrir y aceptar no duplican efectos comerciales. Borradores no se aceptan públicamente.
- US-05: gratis permite cinco altas por mes en hora de México, también bajo concurrencia.
- US-06: registro, catálogo, cotización, PDF y WhatsApp funcionan en Android de 360 px;
  no se declara validado el flujo autenticado sin Supabase Auth de pruebas.
- US-07: fallos externos no activan planes; enlaces públicos no exponen campos internos.

## Decisiones que necesitan revisión humana

El usuario eligió 15 días desde el primer envío y revisiones con historial. Cada oferta
emitida conserva su contenido; corregir crea un borrador enlazado con nuevo folio/enlace.
Se reutiliza un borrador de revisión existente. Al emitirse una revisión, la anterior
conserva su registro pero no admite nuevas aceptaciones. Se mantienen cupo y precios
actuales del catálogo para la revisión. Fechas y contenido históricos sin evidencia
necesitan conciliación antes de migrar producción.

Rechazo explícito por el cliente no está implementado ni tiene criterio de aceptación
en specs/fase-3/publica.feature; definir si entra al piloto antes de ampliarlo.
No inventar políticas de reembolsos/contracargos ni textos legales aprobados.

## Fuera de esta ejecución

Push, despliegue, migraciones en nube, pagos reales y uso de servicios productivos.
Piloto requiere OTP real seguro, sandbox de pagos y validación con un taller real;
lanzamiento público añade operación, restauración probada, legal y mediciones móviles.
