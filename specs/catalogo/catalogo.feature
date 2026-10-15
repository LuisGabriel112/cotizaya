# language: es
Característica: El taller edita su propio catálogo de materiales
  El dueño cambia precios y agrega materiales desde el celular, sin CSV y sin pedirle nada a nadie.
  Cambiar un precio solo afecta cotizaciones nuevas. Las ya hechas conservan el precio con que se cotizaron.

  Antecedentes:
    Dado que soy el dueño del taller "El Faro" con sesión
    Y mi catálogo tiene "Corrediza 3 pulgadas" a $2,150.00 el m², en la línea "Corredizas"

  Escenario: Ver el catálogo ordenado por línea
    Cuando abro "Precios"
    Entonces veo mis materiales agrupados por línea
    Y cada uno muestra su nombre, su unidad en palabras ("por m²", "por metro", "por pieza") y su precio

  Escenario: Cambiar un precio, el caso de todos los días
    Cuando toco "Corrediza 3 pulgadas"
    Y cambio el precio a "2,300"
    Y toco "Guardar"
    Entonces el catálogo muestra $2,300.00
    Y la próxima cotización que haga usa $2,300.00

  Escenario: Una cotización ya enviada no cambia con el precio nuevo
    Dado que tengo una cotización enviada con "Corrediza 3 pulgadas" a $2,150.00
    Cuando cambio el precio a $2,300.00
    Entonces esa cotización sigue mostrando $2,150.00 en la lista, en el enlace público y en el PDF

  Escenario: Agregar un material nuevo
    Cuando toco "Agregar material"
    Y escribo el nombre "Vidrio filtrasol 6 mm"
    Y elijo "Por m²"
    Y escribo el precio "$1,480.50"
    Y toco "Guardar"
    Entonces aparece en mi catálogo a $1,480.50 por m²
    Y puedo elegirlo al cotizar

  Escenario: Un material por pieza pide cómo se llama la pieza
    Cuando toco "Agregar material"
    Y elijo "Por pieza"
    Entonces me pregunta "¿Cómo se llama la pieza?" en singular y en plural
    Y esos nombres salen en la cotización ("1 jaladera", "3 jaladeras")

  Escenario: Los datos incompletos se avisan sin perder lo escrito
    Cuando toco "Agregar material" y guardo sin nombre
    Entonces veo "Ponle un nombre al material."
    Y lo que ya había escrito sigue en pantalla
    Cuando pongo un precio vacío o en cero
    Entonces veo "Escribe un precio mayor a cero."

  Escenario: Un nombre repetido se detecta
    Cuando agrego otro material llamado "corrediza 3 pulgadas"
    Entonces veo "Ya tienes un material con ese nombre."
    Y no se crea el duplicado

  Escenario: Quitar un material pide confirmación
    Cuando toco "Quitar" en un material que ya no vendo
    Entonces me pregunta "¿Quitar este material?"
    Y si confirmo desaparece del catálogo
    Y las cotizaciones donde lo usé siguen mostrándose igual

  Escenario: Un material que usa una plantilla de un toque no se quita
    Dado que una plantilla de un toque usa "Corrediza 3 pulgadas"
    Cuando intento quitarlo
    Entonces me avisa cuál plantilla lo usa
    Y no se quita

  Escenario: Cada taller solo ve y edita lo suyo
    Dado que otro taller tiene sus propios materiales
    Cuando abro "Precios"
    Entonces no veo ninguno de los suyos
    Y no puedo cambiar ninguno por más que conozca su identificador

  Escenario: Sin señal se dice claro y no se pierde nada
    Dado que no tengo conexión
    Cuando intento guardar un cambio de precio
    Entonces veo "Sin señal. Tu cambio no se guardó, inténtalo cuando tengas internet."
    Y el precio anterior sigue vigente
