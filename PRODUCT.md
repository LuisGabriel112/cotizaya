# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

PWA instalable. No hay app nativa en el MVP.

## Users

**Principal:** dueño de taller de aluminio y vidrio en Veracruz, 30–55 años. Usa un Android de gama media. Cotiza en la obra o en la casa del cliente, de pie, muchas veces bajo el sol, con una mano libre y la otra con la cinta métrica o el lápiz. Su trabajo es medir, sacar el precio y mandarlo antes de que el cliente pida otra cotización.

**Quien recibe la cotización** (por WhatsApp, abre un enlace o un PDF):
- Dueño de casa que quiere ventanas, cancel de baño o mosquiteros.
- Constructora o arquitecto que compara varias cotizaciones de una obra más grande.
- Negocio o local: fachadas, puertas, cancelería comercial.

## Product Purpose

Cotizar un trabajo de aluminio en menos de 3 minutos desde el celular y enviarlo por WhatsApp con un PDF que se ve más serio que el de cualquier taller de la zona. Éxito: un taller real crea y envía una cotización de 3 partidas en menos de 3 minutos sin que nadie le explique cómo.

## Positioning

Hoy los talleres cotizan de tres maneras: apuntan medidas en libreta o nota de remisión y mandan foto; escriben el precio suelto en un mensaje de WhatsApp sin desglose; o lo pasan a Excel o Word al regresar al taller. Cotiza Ya junta las tres: se captura en la obra, con el catálogo y las plantillas del taller ya cargados, sale con desglose por partida y llega al cliente en el mismo WhatsApp, en el momento. Es para aluminio de costa (salitre, corrosión, anodizado, pintura electrostática), no un cotizador genérico.

## Operating Context

- Medidas en centímetros con cinta métrica; partidas típicas: ventana corrediza, cancel de baño, mosquitero, puerta abatible, cambio de felpa y rodamientos, reemplazo por corrosión.
- Catálogo de perfiles, vidrios y herrajes comunes en Veracruz, con precio por m², metro lineal o pieza.
- El cliente compara contra otras cotizaciones; la de libreta o mensaje suelto es la referencia a superar.
- WhatsApp es el canal único de envío y seguimiento.
- Seguimiento: abierta, vista o aceptada, con aviso cuando el cliente abre el enlace.

## Capabilities and Constraints

- MVP: registro por teléfono (OTP), perfil del taller con logo y condiciones de pago, catálogo editable, plantillas de partida de un toque, cotización con descuento e IVA opcional, PDF con nota de acabado y garantía contra salitre, enlace público, plan gratis de 5 al mes y pago con Mercado Pago (tarjeta, OXXO, transferencia), panel /admin para dar de alta talleres.
- No entra: CFDI, inventario, varios usuarios por taller, agenda, app nativa.
- Dinero en centavos; medidas en cm, mostradas en m con 2 decimales; formato es-MX.
- Rendimiento para gama media: poco JavaScript en cliente.
- PDF menor de 300 KB y legible en blanco y negro.
- Precio fundador $99/mes o $990/año (ver docs/GUIA.md). Detalle completo en docs/GUIA.md.

## Brand Commitments

- Nombre: Cotiza Ya.
- Voz: español de México, tuteo, frases cortas y concretas, lenguaje de taller (canceles, ventanas, obra, material). Nada de "potencia", "siguiente nivel" ni "sin esfuerzo".
- Sistema visual vinculante en `.claude/skills/hoja-de-taller` y `src/styles/tokens.css` (lo documenta DESIGN.md).
- Sin logo definitivo; el ícono actual es provisional.

## Evidence on Hand

Nada todavía: no hay talleres usuarios, testimonios, cotizaciones reales, métricas ni prensa. No se debe inventar ninguno. Los datos de demo deben verse como datos de ejemplo, no como clientes reales.

## Product Principles

1. Tres minutos o no sirve: cada pantalla se mide contra el tiempo de captura en obra.
2. Los números son el producto: medidas, importes y total se leen primero y sin error.
3. Más serio que la libreta: lo que recibe el cliente debe ganarle a cualquier cotización local.
4. Hablar como el taller: términos de su oficio, nada de jerga de software.
5. Hacer una cosa: cotizar y enviar. Lo demás espera a que haya 10 fundadores pagando.

## Accessibility & Inclusion

- Uso en exterior bajo el sol: contraste mínimo de 7:1 en texto principal.
- Uso con una mano y el pulgar: objetivos táctiles de 56 px y acción principal fija abajo.
- Usuarios de 30–55 años, posible vista cansada: texto base grande, sin grises claros.
- Android de gama media y datos móviles: carga ligera.
