---
name: Cotiza Ya
description: Cotizador de aluminio para el celular, hecho como una hoja de obra bien llenada.
colors:
  papel: "#F3EEE4"
  papel-2: "#E8E1D3"
  tinta: "#161616"
  tinta-2: "#4A4740"
  amarillo: "#F2C230"
  rojo: "#C8372D"
  verde: "#2F6B3F"
  aluminio: "#8C9399"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  number:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  total:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "tnum"
rounded:
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.tinta}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    height: "56px"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    height: "56px"
    padding: "0 24px"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.number}"
    rounded: "{rounded.sm}"
    height: "56px"
    padding: "0 16px"
  status-tape:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.tinta}"
    typography: "{typography.title}"
    padding: "2px 8px"
  folio-stamp:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.rojo}"
    typography: "{typography.title}"
    padding: "4px 10px"
---

# Design System: Cotiza Ya

## Overview

**Creative North Star: "La Hoja de Obra"**

Cada pantalla es una hoja de obra bien llenada: papel claro, tinta casi negra, renglones de libreta, la cinta métrica y un marcador amarillo que señala lo único que hay que tocar. Nada flota y nada brilla. La interfaz se parece a lo que el maestro ya usa (la libreta, la nota de remisión), pero con el orden y la limpieza que su cliente no ha visto en ninguna otra cotización.

Es una herramienta de trabajo para la obra, no un producto de oficina. Densidad media, un solo flujo a la vez, diseñada primero para 360 px de ancho y para leerse bajo el sol. Los números mandan: medidas, importes y total son lo más grande y lo más legible de la pantalla, alineados a la derecha como en una nota de remisión. El carácter vive en pocos detalles precisos (el folio sellado, la etiqueta de cinta adhesiva, la regla de cinta métrica), no en decoración.

Rechazos confirmados: gradientes, glassmorphism, blobs, sombras suaves, esquinas muy redondeadas, la fuente Inter, emojis en la interfaz, grids de tres features con íconos, mockups 3D flotantes, ilustraciones genéricas de personas y barras laterales de dashboard con métricas vacías.

**Key Characteristics:**
- Papel y tinta con contraste de exterior (15.65:1 en texto principal).
- Bordes de 2 px y reglas punteadas en vez de sombras.
- Números en mono tabular, alineados a la derecha.
- Títulos condensados en mayúsculas.
- Un solo amarillo: la acción principal, fija abajo y al alcance del pulgar.

## Colors

Paleta de papelería de taller: dos papeles, dos tintas, un marcador y dos colores de corrección y aprobación. Fuera de estos tokens no existe ningún color; la paleta de fábrica de Tailwind está apagada.

### Primary
- **Marcador amarillo** (amarillo): la acción principal de cada pantalla y nada más. Siempre con texto en tinta encima (10.80:1).

### Secondary
- **Corrección roja** (rojo): errores, rechazos y el sello del folio. Contraste 4.50:1 sobre papel: solo en texto grande (≥ 24 px, o ≥ 19 px en negrita), bordes, íconos o etiquetas en mayúsculas acompañadas de texto en tinta. Nunca texto corrido.
- **Verde aceptada** (verde): estado ACEPTADA y confirmaciones. Contraste 5.51:1 sobre papel: mismas restricciones que el rojo.

### Neutral
- **Papel** (papel): fondo de toda la app, con textura de ruido SVG al 3 % solo en el fondo. Fondo del PDF en blanco.
- **Papel viejo** (papel-2): superficies secundarias, renglones alternos, etiquetas de estado tipo cinta.
- **Tinta** (tinta): texto principal, bordes de 2 px, números y títulos (15.65:1 sobre papel).
- **Tinta corrida** (tinta-2): texto secundario y ayudas (8.01:1 sobre papel, 7.12:1 sobre papel viejo). Es el gris más claro permitido para texto.
- **Aluminio** (aluminio): solo reglas punteadas y líneas secundarias (2.69:1). Nunca texto ni ícono con significado.

### Named Rules
**La Regla del Marcador.** El amarillo marca una sola cosa por pantalla: la acción principal. Si hay dos cosas amarillas, una sobra.

**La Regla de Exterior.** Todo texto que haya que leer va en tinta o tinta corrida (≥ 7:1). Rojo y verde solo refuerzan; nunca cargan solos el significado ni van en texto corrido.

## Typography

**Display Font:** Barlow Condensed (con sans-serif)
**Body Font:** Barlow (con sans-serif)
**Label/Mono Font:** JetBrains Mono (con monospace)

**Character:** Barlow Condensed es la rotulación de taller: angosta, firme, en mayúsculas, cabe en 360 px sin partirse. Barlow es su hermana de texto, clara a tamaño grande. JetBrains Mono es la letra de la medida y el dinero: cada dígito del mismo ancho para que las columnas cuadren como en una nota de remisión.

Las tres se cargan con next/font (variables `--ff-display`, `--ff-body`, `--ff-num`) y se exponen como `font-display`, `font-body` y `font-num`. Utilidades listas: `titulo` y `num`.

### Hierarchy
- **Display** (700, 2.25rem, 1.1, 0.02em, mayúsculas): nombre de pantalla. Uno por pantalla.
- **Title** (700, 1.25rem, 1.2, 0.02em, mayúsculas): encabezados de sección, botones, etiqueta TOTAL, estados.
- **Body** (400, 1.125rem, 1.5): texto de la interfaz. Base grande por vista cansada y uso en exterior. Máximo 65ch.
- **Label** (500, 1rem, 1.4): etiquetas de campos y descripciones de partida.
- **Number** (mono 400, 1.125rem, tabular): medidas (`1.20 m × 1.50 m`), cantidades, importes por partida.
- **Total** (mono 700, 1.5rem o más, tabular): total de la cotización. El número más grande de la pantalla.

### Named Rules
**La Regla del Número.** Toda medida, cantidad o monto va en mono tabular y alineado a la derecha. Ningún número de dinero en Barlow.

**La Regla del Rótulo.** Barlow Condensed solo en 600–800 y siempre en mayúsculas con 0.02em. Nunca en texto corrido.

## Layout

Una columna, pensada para 360 px. Márgenes laterales de 16 px; ancho máximo de contenido de 28rem (448 px) centrado en pantallas grandes. Escritorio es secundario: la misma columna, más aire, sin barras laterales.

Ritmo de 4 px (4, 8, 16, 24, 32). Las partidas de cotización son renglones de libreta: descripción y medidas en mono a la izquierda, importe a la derecha, separados por una regla punteada. Las secciones se separan con borde de 2 px de tinta o con la regla de cinta métrica.

La acción principal vive fija abajo en móvil, a 56 px de alto y ancho completo, sobre papel, con borde superior de 2 px de tinta. El contenido deja espacio inferior para que nunca quede tapado.

### Named Rules
**La Regla del Pulgar.** Todo lo que se toca mide al menos 56 px de alto. La acción principal siempre está abajo, al alcance del pulgar.

## Elevation & Depth

Plano. No existe ninguna sombra: los tokens de `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow` y `blur` están apagados en Tailwind. La profundidad se marca con bordes de 2 px de tinta, cambios de papel (papel → papel viejo) y reglas punteadas, como en papel impreso.

### Named Rules
**La Regla del Papel.** Si algo necesita separarse, lleva una línea, no una sombra. Una hoja no flota.

## Shapes

Esquinas casi rectas: radio máximo de 4 px (`rounded-sm`), que es el único radio que existe. Bordes de 2 px de tinta para contenedores y campos; reglas de 1 px punteadas en aluminio entre renglones. Formas de papelería: el sello del folio con borde doble y rotado −2°, la etiqueta de estado como cinta adhesiva, la regla de cinta métrica con marcas cada 8 px.

## Components

Aún no existen en código (fase 1). Lo siguiente es la especificación vinculante de la skill hoja-de-taller.

### Buttons
- **Shape:** esquinas casi rectas (4 px).
- **Primary:** marcador amarillo con texto en tinta, rótulo en mayúsculas, 56 px de alto, ancho completo en móvil, borde de 2 px de tinta. Uno por pantalla.
- **Secondary:** papel con borde de 2 px de tinta y texto en tinta, mismo alto.
- **Focus:** contorno de 3 px de tinta con 2 px de separación (global).
- **Active:** se hunde con cambio de fondo (papel → papel viejo, o amarillo con borde más grueso); nunca con sombra.

### Inputs / Fields
- **Style:** papel con borde de 2 px de tinta, 4 px de radio, 56 px de alto. Medidas y precios en mono, alineados a la derecha, con la unidad visible (cm, m, $).
- **Focus:** contorno global de 3 px de tinta.
- **Error:** borde y mensaje en rojo, con el mensaje en tinta junto a un ícono o rótulo rojo; nunca solo color.

### Partida de cotización (firma)
Renglón de libreta: descripción arriba en Barlow, medidas en mono a la izquierda e importe en mono a la derecha, regla punteada abajo.

### Folio (firma)
Sello rojo "No. 0042": Barlow Condensed en rojo, borde doble rojo, rotado −2°.

### Estado (firma)
Etiqueta tipo cinta adhesiva en papel viejo, en mayúsculas (BORRADOR, ENVIADA, VISTA, ACEPTADA, RECHAZADA). ACEPTADA lleva el verde; RECHAZADA, el rojo; ambas con texto en tinta legible.

### Separador de sección (firma)
Regla de cinta métrica: línea de tinta con marcas cada 8 px.

### Total
Borde doble de tinta encima, rótulo TOTAL a la izquierda y monto en mono 700 a la derecha. Es lo más legible de la pantalla.

## Do's and Don'ts

### Do:
- **Do** usa solo los tokens de `src/styles/tokens.css` (`bg-papel`, `text-tinta`, `border-tinta`, `bg-amarillo`…).
- **Do** pon medidas y dinero en `num` y alineados a la derecha; centavos con `formatCentavos` y medidas con `formatMetros` de `src/lib/format`.
- **Do** separa con bordes de 2 px de tinta o reglas punteadas de aluminio.
- **Do** diseña primero en 360 px, con botones de 56 px y la acción principal fija abajo.
- **Do** incluye al menos una firma (folio, cinta de estado, regla de cinta métrica) en cada pantalla principal.

### Don't:
- **Don't** uses gradientes, glassmorphism, blobs ni sombras de ningún tipo.
- **Don't** redondees más de 4 px ni hagas tarjetas con sombra suave.
- **Don't** uses la fuente Inter ni emojis en la interfaz.
- **Don't** pongas texto en aluminio, ni texto corrido en rojo o verde.
- **Don't** hagas grids de tres features con íconos, heroes con mockup 3D flotante, ilustraciones genéricas de personas ni barras laterales con métricas vacías.
- **Don't** escribas un color hex suelto en componentes (excepción: ImageResponse y PDF, que no leen CSS; ahí se copian los valores de los tokens).
