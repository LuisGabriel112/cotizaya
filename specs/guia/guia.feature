# language: es
Característica: Guía paso a paso en cada pantalla
  La primera vez que el taller abre una pantalla, la app oscurece todo menos lo que hay que presionar
  y lo explica en una hoja, un paso a la vez. Se salta cuando quiera y no vuelve a salir sola.
  Temas: hacer una cotización, mandarla por WhatsApp, cambiar precios, plan y pago.

  Antecedentes:
    Dado un celular de 360 × 740
    Y que en este celular no he visto ninguna guía

  Escenario: La guía de la lista arranca sola la primera vez
    Cuando abro "/demo/cotizaciones"
    Entonces veo una hoja con el rótulo "Empieza aquí" y "1 de 2"
    Y todo está oscurecido menos el botón "Nueva cotización"
    Y el botón "Nueva cotización" queda dentro del recorte, con marco amarillo por fuera y tinta por dentro
    Y la hoja va abajo, justo encima del botón, sin taparlo
    Y el foco está en "Sigue"

  Escenario: Tocar lo resaltado hace la acción
    Dado que la guía de la lista está abierta en el paso 1
    Cuando toco una parte oscurecida
    Entonces no pasa nada y la guía sigue abierta
    Cuando toco "Nueva cotización" dentro del recorte
    Entonces la guía de la lista se cierra y queda vista
    Y se crea la cotización y sale la guía "Elige el trabajo"

  Escenario: Avanzar, regresar y terminar
    Dado que la guía de la lista está abierta en el paso 1
    Cuando toco "Sigue"
    Entonces veo "2 de 2" y el recorte cae sobre una cotización con total, no sobre un borrador vacío
    Y el botón principal dice "Entendido" y ya no se ofrece "Saltar guía"
    Cuando toco "Atrás"
    Entonces veo "1 de 2"
    Cuando toco "Sigue" y luego "Entendido"
    Entonces la guía se cierra y puedo tocar "Nueva cotización"

  Escenario: Los pasos sin elemento en pantalla, o con el elemento deshabilitado, se omiten
    Dado que estoy en el prototipo, que no tiene "Precios" ni aviso de cupo
    Cuando abro "/demo/cotizaciones"
    Entonces la guía de la lista tiene 2 pasos y no 4

  Escenario: Saltar la guía, con el botón o con Escape
    Cuando abro "/demo/cotizaciones"
    Y toco "Saltar guía"
    Entonces la guía se cierra
    Cuando recargo la página
    Entonces la guía no vuelve a salir
    Pero si en otro celular abro la lista y presiono Escape, también se cierra y queda vista

  Escenario: Cada pantalla tiene su guía y sale una sola vez
    Dado que ya vi la guía de la lista
    Cuando toco "Nueva cotización"
    Entonces sale la guía de la cotización, de un solo paso: "Elige el trabajo"
    Y la hoja no tapa ningún trabajo de la rejilla
    Cuando la termino y elijo "Corrediza"
    Entonces sale la guía de la medida, empezando por el campo del ancho
    Cuando la termino y capturo la partida
    Entonces sale la guía de la partida: el total, para quién es y "Ver cotización", ya activo
    Cuando la termino y toco "Ver cotización"
    Entonces sale la guía de la vista previa, empezando por "Enviar por WhatsApp" y sin el paso del estado
    Cuando regreso a la lista
    Entonces no sale ninguna guía

  Escenario: Volver a ver las guías
    Dado que ya vi todas las guías
    Cuando abro "/demo/cotizaciones" y toco "Cómo se usa", arriba de la lista
    Entonces sale la guía de la lista desde "1 de 2"
    Y al abrir otra pantalla sale de nuevo su guía

  Escenario: Si el celular no deja guardar, no se insiste
    Dado que el navegador no deja leer ni escribir en localStorage
    Cuando abro "/demo/cotizaciones"
    Entonces no sale ninguna guía y la lista funciona igual

  Escenario: La hoja va siempre abajo, al alcance del pulgar, sin tapar lo que señala
    Dado que el elemento señalado queda arriba
    Entonces la hoja va pegada abajo
    Dado que el elemento señalado está abajo, como la barra de acción
    Entonces la hoja va justo encima de él
    Dado que el elemento señalado es alto y no cabe con la hoja
    Entonces la pantalla se desplaza para subirlo y la hoja va abajo

  Esquema del escenario: Las guías de la app real
    Dado que tengo sesión de taller
    Cuando abro "<ruta>" por primera vez
    Entonces la guía empieza señalando "<primer elemento>"

    Ejemplos:
      | ruta      | primer elemento         |
      | /precios  | el primer material      |
      | /plan     | el estado de mi plan    |
