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
  question:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
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
  field:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  total:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
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
  button-secondary-active:
    backgroundColor: "{colors.papel-2}"
  button-disabled:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.tinta-2}"
  action-bar:
    backgroundColor: "{colors.papel}"
    padding: "12px 16px"
  field-number:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.field}"
    rounded: "{rounded.sm}"
    height: "80px"
    padding: "0 16px"
  input-text:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    height: "64px"
    padding: "0 16px"
  question-title:
    textColor: "{colors.tinta}"
    typography: "{typography.question}"
  template-ficha:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    height: "80px"
    padding: "8px"
  template-ficha-active:
    backgroundColor: "{colors.papel-2}"
  extra-toggle:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    height: "56px"
    padding: "4px 12px"
  extra-toggle-pressed:
    backgroundColor: "{colors.papel-2}"
  stepper-cell:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    size: "56px"
  quote-item:
    textColor: "{colors.tinta}"
    typography: "{typography.number}"
    padding: "12px 0"
  quote-item-en-curso:
    backgroundColor: "{colors.papel-2}"
  total:
    textColor: "{colors.tinta}"
    typography: "{typography.total}"
  status-tape:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.tinta}"
    padding: "1px 8px"
  folio-stamp:
    textColor: "{colors.rojo}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
  quote-sheet:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    padding: "20px 16px"
---

# Design System: Cotiza Ya

## Overview

**Creative North Star: "La Hoja de Obra"**

Cada pantalla es una hoja de obra bien llenada: papel claro, tinta casi negra, renglones de libreta, la cinta métrica y un marcador amarillo que señala lo único que hay que tocar. Nada flota y nada brilla. La interfaz se parece a lo que el maestro ya usa (la libreta, la nota de remisión), pero con el orden y la limpieza que su cliente no ha visto en ninguna otra cotización.

Es una herramienta de trabajo para la obra, no un producto de oficina. Densidad media, un solo flujo a la vez, diseñada primero para 360 px de ancho y para leerse bajo el sol. Los números mandan: medidas, importes y total son lo más legible de la pantalla, en mono y alineados a la derecha como en una nota de remisión. En la captura manda la señalética: la única pregunta del momento es el rótulo más grande y, mientras se teclea una medida, ese número es el más grande; fuera de eso, el TOTAL es el número más grande. El carácter vive en pocos detalles precisos (el folio sellado, la etiqueta de cinta adhesiva, la regla de cinta métrica, el croquis de línea de cada trabajo), no en decoración.

Rechazos confirmados: gradientes, glassmorphism, blobs, sombras suaves, esquinas muy redondeadas, la fuente Inter, emojis en la interfaz, grids de tres features con íconos, mockups 3D flotantes, ilustraciones genéricas de personas y barras laterales de dashboard con métricas vacías.

**Key Characteristics:**
- Papel y tinta con contraste de exterior (15.65:1 en texto principal).
- Bordes de 2 px y reglas punteadas en vez de sombras.
- Números en mono tabular, alineados a la derecha.
- Títulos condensados en mayúsculas.
- Un solo amarillo: la acción principal, fija abajo y al alcance del pulgar.
- Una pregunta a la vez en la captura; cada respuesta cae a la hoja como renglón.

## Colors

Paleta de papelería de taller: dos papeles, dos tintas, un marcador y dos colores de corrección y aprobación. Fuera de estos tokens no existe ningún color; la paleta de fábrica de Tailwind está apagada.

### Primary
- **Marcador amarillo** (amarillo): la acción principal de cada pantalla y nada más. Siempre con texto en tinta encima (10.80:1). También es el color de selección de texto.

### Secondary
- **Corrección roja** (rojo): errores, rechazos, el sello del folio y la acción destructiva "Quitar esta partida". Contraste 4.50:1 sobre papel: solo en texto grande (≥ 24 px, o ≥ 19 px en negrita), bordes, íconos o etiquetas en mayúsculas acompañadas de texto en tinta. Nunca texto corrido.
- **Verde aceptada** (verde): estado ACEPTADA y confirmaciones (borde del aviso "Aceptada." en la vista pública). Contraste 5.51:1 sobre papel: mismas restricciones que el rojo.

### Neutral
- **Papel** (papel): fondo de toda la app, con textura de ruido SVG al 3 % solo en el fondo. Fondo del PDF en blanco.
- **Papel viejo** (papel-2): superficies secundarias, estado presionado, renglón en curso, fila con aviso pendiente en la lista, etiquetas de estado tipo cinta.
- **Tinta** (tinta): texto principal, bordes de 2 px, números y títulos (15.65:1 sobre papel).
- **Tinta corrida** (tinta-2): texto secundario, ayudas, unidades (cm) y bordes punteados de lo que todavía no está elegido (8.01:1 sobre papel, 7.12:1 sobre papel viejo). Es el gris más claro permitido para texto.
- **Aluminio** (aluminio): solo reglas punteadas y líneas secundarias (2.69:1). Nunca texto ni ícono con significado.

### Named Rules
**La Regla del Marcador.** El amarillo marca una sola cosa por pantalla: la acción principal. Si hay dos cosas amarillas, una sobra.

**La Regla de Exterior.** Todo texto que haya que leer va en tinta o tinta corrida (≥ 7:1). Rojo y verde solo refuerzan; nunca cargan solos el significado ni van en texto corrido.

## Typography

**Display Font:** Barlow Condensed (con sans-serif)
**Body Font:** Barlow (con sans-serif)
**Label/Mono Font:** JetBrains Mono (con monospace)

**Character:** Barlow Condensed es la rotulación de taller: angosta, firme, en mayúsculas, cabe en 360 px sin partirse. Barlow es su hermana de texto, clara a tamaño grande. JetBrains Mono es la letra de la medida y el dinero: cada dígito del mismo ancho para que las columnas cuadren como en una nota de remisión.

Las tres se cargan con next/font (variables `--ff-display`, `--ff-body`, `--ff-num`) y se exponen como `font-display`, `font-body` y `font-num`. Utilidades listas: `titulo` (Barlow Condensed 700, mayúsculas, 0.02em) y `num` (mono tabular).

### Hierarchy
- **Question** (700, 2.5rem, 1, 0.02em, mayúsculas): la pregunta en curso de la captura (¿QUÉ TRABAJO?, ¿ANCHO?, ¿ALTO?). Una a la vez; supera al nombre de pantalla.
- **Display** (700, 2.25rem, 1, 0.02em, mayúsculas): nombre de pantalla en el encabezado. Uno por pantalla.
- **Title** (700, 1.25rem, 1.2, 0.02em, mayúsculas): botones, encabezados de sección, estados, avisos de la lista. El rótulo TOTAL sube a 1.5rem.
- **Body** (400, 1.125rem, 1.5): texto de la interfaz. Base grande por vista cansada y uso en exterior. Máximo 65ch. Las ayudas secundarias bajan a 1rem en tinta corrida.
- **Label** (500, 1rem, 1.4): etiquetas de campos y descripciones de partida.
- **Number** (mono 400, 1.125rem, tabular): medidas (`1.20 m × 1.50 m`) y cantidades; los importes por partida van en 700.
- **Field** (mono 700, 3rem, 1, tabular): el número que se está tecleando en la captura, alineado a la derecha con su unidad en mono 1.5rem tinta corrida.
- **Total** (mono 700, 2rem, 1.25, tabular): monto del TOTAL de la cotización.

### Named Rules
**La Regla del Número.** Toda medida, cantidad o monto va en mono tabular y alineado a la derecha. Ningún número de dinero en Barlow.

**La Regla de la Señalética.** En pantallas de captura, la única pregunta en curso es el rótulo más grande (por encima del nombre de pantalla) y, mientras se teclea una medida, el campo vivo es el número más grande. En todo lo demás, el TOTAL es el número más grande de la pantalla. Nunca hay dos preguntas grandes a la vez.

**La Regla del Rótulo.** Barlow Condensed solo en 600–800 y siempre en mayúsculas con 0.02em. Nunca en texto corrido.

## Layout

Una columna, pensada para 360 px. Márgenes laterales de 16 px; ancho máximo de contenido de 28rem (448 px) centrado en pantallas grandes. Escritorio es secundario: la misma columna, más aire, sin barras laterales.

Ritmo de 4 px (4, 8, 16, 24, 32). Las partidas de cotización son renglones de libreta: descripción y medidas en mono a la izquierda, importe a la derecha, separados por una regla punteada. Las secciones se separan con borde de 2 px de tinta o con la regla de cinta métrica.

La captura apila dos zonas: arriba la hoja (cliente, regla de cinta, renglones, TOTAL) que crece con cada respuesta; abajo, tras un borde de 2 px de tinta, la única pregunta en curso. Las fichas de plantilla van en una rejilla de dos columnas con 8 px de separación.

La acción principal vive fija abajo en móvil, ancho completo, sobre papel, con borde superior de 2 px de tinta y respetando el área segura inferior. El contenido deja 128 px de espacio inferior para que nunca quede tapado.

### Named Rules
**La Regla del Pulgar.** Todo lo que se toca mide al menos 56 px de alto, incluidos enlaces de texto, el regreso del encabezado y las celdas del contador. La acción principal siempre está abajo, al alcance del pulgar.

## Elevation & Depth

Plano. No existe ninguna sombra: los tokens de `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow` y `blur` están apagados en Tailwind. La profundidad se marca con bordes de 2 px de tinta, cambios de papel (papel → papel viejo) y reglas punteadas, como en papel impreso.

El movimiento es igual de seco. Hay un solo momento con autor: el renglón nuevo cae a la hoja desde 10 px arriba (220 ms, curva de salida rápida), solo si el usuario no pidió reducir movimiento. Lo demás es respuesta al toque: lo que se presiona baja 2 px en 75 ms.

### Named Rules
**La Regla del Papel.** Si algo necesita separarse, lleva una línea, no una sombra. Una hoja no flota.

**La Regla de la Caída.** Lo único que se anima es una respuesta que cae a la hoja como renglón. Ningún otro elemento entra, se desvanece ni rebota.

## Shapes

Esquinas casi rectas: radio máximo de 4 px (`rounded-sm`), que es el único radio que existe. Bordes de 2 px de tinta para contenedores y campos; reglas de 1 px punteadas en aluminio entre renglones; línea doble de 6 px sobre el TOTAL. El borde punteado en tinta corrida significa "todavía no elegido"; al elegirse se vuelve sólido en tinta. Formas de papelería: el sello del folio con borde doble y rotado −2°, la etiqueta de estado como cinta adhesiva rotada −1°, la regla de cinta métrica con marcas cada 8 px y marca larga cada 80 px. Croquis e íconos son de trazo propio, 2 px en tinta, sin relleno.

## Components

Herramientas de taller: firmes, grandes, de borde de tinta. Se presionan, no brillan.

### Buttons
- **Shape:** esquinas casi rectas (4 px), borde de 2 px de tinta, rótulo en mayúsculas (Title), mínimo 56 px de alto, 24 px de relleno lateral.
- **Primary:** marcador amarillo con texto en tinta. Uno por pantalla, normalmente dentro de la barra de acción.
- **Secondary:** papel con texto en tinta; al presionar pasa a papel viejo.
- **Press:** baja 2 px en 75 ms. No hay estado hover propio: es una app de pulgar.
- **Focus:** contorno de 3 px de tinta con 2 px de separación (global).
- **Disabled:** papel viejo, borde y texto en tinta corrida, sin hundirse. Donde el botón explica por qué no procede (la demostración de la landing), va con `aria-disabled` y sigue siendo enfocable.
- **Selección única** (elegir el trabajo): el elegido se invierte a tinta con el rótulo en papel. El salto papel → papel viejo es de 1.125:1 y no basta para señalar estado por sí solo; se reserva para cuando lo acompaña otra señal (el `?` del renglón en curso, el texto en tinta corrida del deshabilitado).
- **Destructiva:** "Quitar esta partida" es un rótulo rojo subrayado de 1.25rem, no un botón relleno.

### Barra de acción
Fija abajo, ancho completo, papel con borde superior de 2 px de tinta, 12 px arriba y área segura abajo. Apila sus botones a lo ancho con 8 px entre ellos, dentro de la columna de 448 px.

### Inputs / Fields
- **Campo de número (captura):** 80 px de alto, papel, borde de 2 px de tinta, 4 px de radio. El número en mono 700 de 3rem a la derecha y la unidad (cm, hojas) en mono 1.5rem tinta corrida. Teclado numérico; solo dígitos.
- **Campo de texto:** 64 px de alto, papel, borde de 2 px de tinta, Barlow 1.5rem; el ejemplo de relleno en tinta corrida.
- **Focus:** contorno global de 3 px de tinta; el campo de número lo pone en su marco completo.
- **Opciones (acabado, IVA):** filas de 56 px con borde de 2 px de tinta y control de 24 px; la elegida pasa a papel viejo y semibold.
- **Error:** borde y mensaje en rojo, con el mensaje en tinta junto a un ícono o rótulo rojo; nunca solo color.

### Pregunta (firma de la captura)
Rótulo Question de 2.5rem en mayúsculas, con el croquis y el nombre del trabajo debajo y "Cancelar" subrayado en tinta corrida a la derecha. Debajo, una sola cosa que contestar.

### Fichas de plantilla
Rejilla de dos columnas; cada ficha mide al menos 80 px, papel con borde de 2 px de tinta y 8 px de relleno: croquis de línea a la izquierda, nombre en rótulo 1.125rem y precio base en mono 1rem tinta corrida. Al presionar baja 2 px y pasa a papel viejo.

### Extras
Botones de 56 px para cliente, descuento, IVA y acabado, con borde punteado de 2 px en tinta corrida mientras no tienen valor; presionados (`aria-pressed`) el borde se vuelve sólido en tinta y el fondo papel viejo. Etiqueta en 1rem tinta corrida y valor en semibold.

### Contador de iguales
Tres celdas de 56 × 56 px unidas por el borde de 2 px de tinta: menos, la cantidad en mono 700 1.5rem, más. Al llegar a 1, el botón de menos se apaga en tinta corrida.

### Partida de cotización (firma)
Renglón de libreta: croquis chico y descripción en Barlow 500 arriba; medidas en mono tinta corrida a la izquierda e importe en mono 700 a la derecha; regla punteada de aluminio abajo, 12 px de relleno vertical. La partida en curso se ve en papel viejo, con `?` en la medida que falta y `—` en el importe; nunca en rojo mientras se captura. En la captura cada renglón es tocable y reabre sus preguntas.

### Folio (firma)
Sello rojo "No. 0043": Barlow Condensed 800 de 1.5rem en rojo, número en mono, borde doble rojo de 4 px, radio 4 px, rotado −2°.

### Estado (firma)
Etiqueta tipo cinta adhesiva en papel viejo, rótulo de 1rem en tinta, rotada −1°, borde de 2 px: punteado en tinta corrida para BORRADOR, tinta para ENVIADA y VISTA, y 3 px en verde (ACEPTADA) o rojo (RECHAZADA). El texto lleva el significado; el color solo refuerza.

### Separador de sección (firma)
Regla de cinta métrica: línea de tinta de 2 px con marcas cada 8 px y marca larga cada 80 px, 12 px de alto.

### Total
Línea doble de tinta de 6 px encima, rótulo TOTAL de 1.5rem a la izquierda y monto en mono 700 de 2rem a la derecha. Desglose (subtotal, descuento, IVA 16 %) en tinta corrida solo cuando hay descuento o IVA.

### Hoja de cotización
La hoja que recibe el cliente, misma composición que el PDF: borde de 2 px de tinta sobre papel, 16 px de relleno lateral y 20 px vertical. Iniciales del taller en recuadro de 48 px, nombre y ciudad; datos (Para, Fecha, Vigencia) a la izquierda y folio a la derecha; regla de cinta; partidas; recuadro de acabado; total; condiciones al pie tras una regla punteada.

### Fila de la lista
Folio en mono tinta corrida, cliente en semibold y cinta de estado arriba; fecha y número de partidas a la izquierda y total en mono 700 de 1.25rem a la derecha. Cuando el cliente la abrió o aceptó y el taller no lo ha visto, la fila va en papel viejo con un rótulo de aviso hasta que se abre.

### Navigation
Encabezado de pantalla: enlace de regreso de 56 px con flecha de trazo propio, rótulo Display y, a la derecha, el folio o la cinta de estado. No hay barra de pestañas ni menú lateral.

## Do's and Don'ts

### Do:
- **Do** usa solo los tokens de `src/styles/tokens.css` (`bg-papel`, `text-tinta`, `border-tinta`, `bg-amarillo`…).
- **Do** pon medidas y dinero en `num` y alineados a la derecha; centavos con `formatCentavos` y medidas con `formatMetros` de `src/lib/format`.
- **Do** separa con bordes de 2 px de tinta o reglas punteadas de aluminio.
- **Do** diseña primero en 360 px, con todo lo tocable de al menos 56 px (`min-h-14`) y la acción principal fija abajo.
- **Do** incluye al menos una firma (folio, cinta de estado, regla de cinta métrica) en cada pantalla principal.
- **Do** en captura, muestra una sola pregunta en rótulo de 2.5rem y deja que el campo vivo sea el número más grande.
- **Do** acompaña todo estado marcado con papel viejo de una segunda señal (texto, borde, `?`): el color solo no llega a 3:1.
- **Do** limita el movimiento a `caer` (solo con `motion-safe`) y al hundido de 2 px al presionar.

### Don't:
- **Don't** uses degradados de color, glassmorphism, blobs ni sombras de ningún tipo. (Las marcas de la regla de cinta se dibujan con gradientes de corte duro; son trazo, no degradado.)
- **Don't** redondees más de 4 px ni hagas tarjetas con sombra suave.
- **Don't** uses la fuente Inter ni emojis en la interfaz.
- **Don't** pongas texto en aluminio, ni texto corrido en rojo o verde.
- **Don't** hagas grids de tres features con íconos, heroes con mockup 3D flotante, ilustraciones genéricas de personas ni barras laterales con métricas vacías.
- **Don't** escribas un color hex suelto en componentes. Excepciones, porque no leen CSS: metadatos del manifest y del viewport (`theme_color`, `background_color`, `themeColor`), íconos generados con ImageResponse y el PDF; ahí se copian los valores de los tokens.
