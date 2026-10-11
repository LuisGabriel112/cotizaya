---
name: hoja-de-taller
description: Sistema de diseño de Cotiza Ya. Úsala antes de crear o modificar cualquier componente, pantalla, landing o PDF.
---
# Hoja de taller

Concepto: hoja de obra bien hecha. Papel, tinta, cinta métrica y marcador amarillo.

## Siempre
- Usa solo los tokens de src/styles/tokens.css, expuestos en @theme de Tailwind. Nunca un color hex suelto ni la paleta por defecto de Tailwind.
- Títulos en Barlow Condensed 700, en mayúsculas, con letter-spacing 0.02em.
- Números y dinero en JetBrains Mono, con tabular-nums y alineados a la derecha.
- Separa con bordes de 2 px de tinta o reglas punteadas. Sin box-shadow.
- Radio máximo de 4 px.
- Acción principal: botón amarillo con texto en tinta, 56 px de alto, fijo abajo en móvil.
- Diseña primero para 360 px de ancho. Escritorio es secundario.
- Contraste mínimo de 7:1 para el texto principal (uso en exterior).

## Tokens
```css
:root {
  --papel: #F3EEE4;
  --papel-2: #E8E1D3;
  --tinta: #161616;
  --tinta-2: #4A4740;
  --amarillo: #F2C230;   /* marcador: acción principal */
  --rojo: #C8372D;       /* corrección: errores y rechazos */
  --verde: #2F6B3F;      /* aceptada */
  --aluminio: #8C9399;   /* líneas secundarias */
  --linea: 2px solid var(--tinta);
  --regla: 1px dashed var(--aluminio);
  --radio: 4px;
  --font-display: 'Barlow Condensed', sans-serif;  /* 600–800, mayúsculas */
  --font-body: 'Barlow', sans-serif;
  --font-num: 'JetBrains Mono', monospace;        /* medidas y dinero */
}
```

## Principios
1. Los números mandan. Medidas y totales grandes, en mono, alineados como en una nota de remisión.
2. Contraste de exterior. Tinta casi negra sobre papel claro. Sin texto gris claro.
3. Botones de pulgar. Altura mínima de 56 px y acción principal fija abajo.
4. Bordes, no sombras. Líneas de 2 px y reglas punteadas, como renglones de libreta.
5. El PDF es el producto. Debe verse mejor que la cotización de cualquier competidor local.

## Componentes con carácter
- Folio: sello rojo "No. 0042", rotado -2°, borde doble.
- Estado: etiqueta tipo cinta adhesiva, en mayúsculas (VISTA, ACEPTADA).
- Separador de sección: regla de cinta métrica con marcas cada 8 px.
- Partida de cotización: un renglón de libreta con medidas en mono a la izquierda e importe a la derecha.
- Fondo: textura de papel muy sutil (ruido SVG al 3 %), solo en el fondo.

## Nunca
- Gradientes (sobre todo morados o azules), glassmorphism, blobs, la fuente Inter, emojis en la interfaz.
- Tarjetas con sombra suave y esquinas muy redondeadas (rounded-2xl).
- Grids de tres features con iconos ("Rápido / Seguro / Fácil").
- Hero con mockup 3D flotante o ilustraciones genéricas de personas.
- Barra lateral de dashboard con métricas vacías.
- Copy genérico: "potencia", "lleva al siguiente nivel", "sin esfuerzo".
