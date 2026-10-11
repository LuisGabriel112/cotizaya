---
version: 1
slug: "src-app-app-cotizaciones-nueva-page-tsx"
primary_target: "src/app/(app)/cotizaciones/nueva/page.tsx"
related_targets: ["src/app/(app)/cotizaciones/page.tsx","src/app/(app)/cotizaciones/[id]/page.tsx","src/app/c/[slug]/page.tsx"]
---

# Captura de cotización (app)

Alcance: flujo de la app en fase 1 — lista de cotizaciones, nueva cotización (captura), vista previa y vista pública. Modo: Operate. Mundo: DESIGN.md "La Hoja de Obra".

Usuario y tarea: dueño de taller en obra, una mano, bajo el sol. Capturar una ventana corrediza 120 × 150 en menos de 30 s y mandar la cotización por WhatsApp. Riesgos que el usuario nombró: teclear mucho, parecer app de oficina, letra chica.

## Direction contract

THESIS: La cotización se arma contestando una pregunta a la vez, como en el ida y vuelta de WhatsApp; cada respuesta cae a la hoja como renglón. Rechaza el formulario de oficina con todos los campos a la vista.

OWN-WORLD: Papel y tinta, rótulos Barlow Condensed en mayúsculas, medidas y dinero en JetBrains Mono a la derecha, bordes de 2 px, reglas punteadas, amarillo solo en la acción principal. Firmas: folio sellado, cinta de estado, regla de cinta métrica.

STORY: El maestro ve la hoja crecer arriba con su total; abajo contesta lo único que se le pregunta. Entiende que en tres toques y dos números ya tiene la partida, y manda.

FIRST VIEWPORT: Arriba, hoja con folio, renglones de partidas y TOTAL en mono grande con línea doble. Debajo, una sola pregunta en rótulo grande (¿QUÉ TRABAJO? / ¿ANCHO? / ¿ALTO?) con fichas de plantilla de 56 px o un campo numérico de 56 px con unidad cm y botón SIGUIENTE. Lo ya contestado aparece como renglón chico en la hoja. Acción fija abajo: VER COTIZACIÓN (amarillo). Raise (señalética): solo la siguiente decisión, en grande. Raise (tablero de salidas): en la lista, VISTA queda marcada hasta que se abre.

FORM: Conversación de obra; posición 6 de 6 en mi lista ordenada; seed key aa436e9c.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Pendientes
- Editar una partida ya contestada: tocar su renglón reabre las preguntas con sus valores.
- Cliente y descuento/IVA: preguntas opcionales al final, no bloquean.

## Registro de la ronda
- Seed aa436e9c (concept-seed --scope surface --mode operate). La página de decisión no era alcanzable (usuario en remote-control); la elección se tomó con la herramienta de preguntas y bocetos ASCII. Elegida: Conversación de obra (assigned).
- Revisión final: fix → fix (2 rondas, presupuesto agotado). Lo que quedó después se corrigió sin tercera ronda: bandas dentro de la columna, folios alineados en la lista, unidad "hoja" consistente.
