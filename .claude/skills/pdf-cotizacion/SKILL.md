---
name: pdf-cotizacion
description: Diseño y generación del PDF de cotización. Úsala al modificar src/lib/server/pdf o la vista pública /c/[slug].
---
# PDF de cotización

- Tamaño carta, márgenes de 18 mm, imprimible en blanco y negro sin perder información.
- Encabezado: logo del taller a la izquierda y folio tipo sello a la derecha.
- Tabla de partidas: descripción, medidas (mono), cantidad e importe, con renglones punteados.
- Total grande abajo a la derecha, en mono, con una línea doble encima.
- Pie: condiciones de pago, vigencia de 15 días y teléfono del taller.
- Si la cotización trae acabado o garantía contra salitre, muéstralos en un recuadro antes del total.
- Pie discreto: "Hecho con Cotiza Ya" solo en el plan gratis.
- Pesa menos de 300 KB para que WhatsApp lo envíe rápido.
- La vista pública /c/[slug] registra un evento "abierta" y nunca expone otros datos del taller.
