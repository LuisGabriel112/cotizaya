# language: es
Característica: Landing con una cotización que se llena de verdad
  La página de entrada le demuestra el producto a un dueño de taller en 10 segundos:
  elige el trabajo, teclea las medidas con su cinta y ve salir el precio.
  No hay mockups, ni testimonios, ni cifras de talleres: todavía no hay un solo taller usuario.

  Antecedentes:
    Dado que no tengo sesión
    Y el catálogo de ejemplo cobra la corrediza a $1,850.00 el m² y el mosquitero a $95.00 el metro

  Escenario: La hoja ya trae una partida al abrir
    Cuando abro "/"
    Entonces veo el rótulo "Cotiza Ya"
    Y veo "Mide, saca el precio y mándalo por WhatsApp sin bajarte de la obra."
    Y la hoja muestra "Ventana corrediza" de "1.20 × 1.50 m" en $3,680.00
    Y el total dice $4,268.80
    Y veo la instrucción "Pruébalo: elige el trabajo y teclea las medidas."
    Y no veo ningún renglón vacío ni ninguna corrección por adelantado

  Escenario: Los cuatro trabajos están arriba de la hoja, con su precio de ejemplo
    Cuando abro "/"
    Entonces puedo elegir "Corrediza", "Mosquitero", "Cancel de baño" o "Puerta abatible"
    Y el elegido es "Corrediza" y se ve invertido en tinta, no solo con otro papel
    Y veo "Precio de ejemplo: $1,850.00 por m². En tu cuenta va el tuyo."
    Y la hoja lleva su sello de folio

  Escenario: Agregar la partida es lo que mueve el total
    Cuando elijo "Mosquitero"
    Y escribo el ancho "120"
    Y escribo el alto "150"
    Entonces el renglón en curso dice "1.20 × 1.50 m" todavía sin importe
    Y el total sigue en $4,268.80
    Cuando toco "Agregar partida"
    Entonces la hoja muestra "Mosquitero" de "1.20 × 1.50 m" en $663.00
    Y el total dice $5,037.88
    Y los campos de medida quedan vacíos para la siguiente
    Y el cursor regresa al ancho
    Y se avisa "Partida agregada. Total $5,037.88."

  Escenario: Mientras tecleo, la partida en curso se ve sin monto inventado
    Cuando elijo "Cancel de baño"
    Y escribo el ancho "90"
    Entonces la hoja muestra un renglón en curso de "0.90 × ? m" sin importe
    Y el total sigue en $4,268.80

  Escenario: Sin las dos medidas no se agrega nada, y se dice por qué
    Dado que abro "/"
    Entonces veo "Elige el trabajo y pon las dos medidas en centímetros."
    Cuando elijo "Mosquitero"
    Y escribo el ancho "120"
    Entonces veo "Pon las dos medidas en centímetros."
    Y "Agregar partida" no hace nada, aunque sigue siendo enfocable
    Cuando escribo el alto "0"
    Entonces "Agregar partida" sigue sin hacer nada
    Cuando escribo el alto "150"
    Entonces veo "Listo: toca Agregar partida."

  Escenario: Las medidas con coma se entienden
    Cuando elijo "Mosquitero"
    Y escribo el ancho "120,5"
    Y escribo el alto "150"
    Y toco "Agregar partida"
    Entonces la hoja muestra "Mosquitero" de "1.21 × 1.50 m"

  Escenario: Cambiar de trabajo limpia lo tecleado
    Cuando elijo "Mosquitero"
    Y escribo el ancho "120"
    Y elijo "Cancel de baño"
    Entonces el ancho queda vacío
    Y el renglón en curso dice "Cancel de baño"

  Escenario: La demostración se detiene en 4 partidas, sin callejón sin salida
    Dado que la hoja ya tiene 4 partidas
    Entonces ya no veo los campos de medida
    Y la hoja queda sin ningún renglón vacío
    Y veo "Ya viste cómo va. En tu cuenta van tus precios, tu logo y tus condiciones."
    Y puedo tocar "Hacer la mía con mis precios" para ir a "/entrar"
    Y el cursor queda en el texto de cierre, no en el aire

  Escenario: Los controles caben en un celular de 360 × 640
    Cuando abro "/" en un celular de 360 × 640
    Entonces veo la instrucción, los cuatro trabajos y los dos campos sin hacer scroll
    Y la barra fija de "Cotizar gratis" no tapa ningún campo

  Escenario: Me equivoqué y vuelvo a empezar
    Dado que ya agregué una partida
    Cuando toco "Empezar de nuevo"
    Entonces la hoja vuelve a su única partida de arranque
    Y el total vuelve a $4,268.80

  Escenario: El único botón amarillo lleva a registrarse
    Cuando abro "/"
    Entonces el botón amarillo fijo abajo dice "Cotizar gratis"
    Y me lleva a "/entrar"
    Y es el único amarillo de la página

  Escenario: Así se cotiza en la obra
    Cuando abro "/"
    Entonces veo "Así se cotiza en la obra"
    Y veo los tres pasos "Mides con tu cinta.", "Eliges el trabajo y tecleas las medidas." y "Lo mandas por WhatsApp."
    Y no veo ninguna rejilla de tres tarjetas con iconos

  Escenario: Lo que le llega al cliente
    Cuando abro "/"
    Entonces veo "Lo que le llega a tu cliente"
    Y veo una hoja de cotización de ejemplo con desglose por partida
    Y puedo abrir "Ábrela como la ve tu cliente"

  Escenario: El precio se lee como una nota de remisión
    Cuando abro "/"
    Entonces veo "Gratis" con "5 cotizaciones al mes"
    Y veo "Fundador" con "$99.00" al mes y "$990.00" al año
    Y veo "Pagas con tarjeta, en OXXO o por transferencia."
    Y no veo tarjetas de precios con sombra

  Escenario: Las preguntas del taller
    Cuando abro "/"
    Entonces veo "¿Necesito internet en la obra?"
    Y veo "¿Puedo cambiar mis precios?"
    Y veo "¿Sale mi logo?"
    Y veo "¿Qué pasa cuando se acaban las 5?"

  Escenario: Nada de evidencia inventada
    Cuando abro "/"
    Entonces no veo testimonios, ni nombres de talleres clientes, ni contadores de usuarios
    Y el pie avisa "Los datos de esta página son de ejemplo."
    Y el pie deja probar el prototipo sin registrarse

  Escenario: Al taller con sesión no se le vuelve a vender
    Dado que soy el dueño del taller "El Faro" con sesión
    Cuando abro "/"
    Entonces caigo en "/cotizaciones"

  Escenario: La landing abre aunque la base no responda
    Dado que las variables de Supabase no están configuradas
    Cuando abro "/"
    Entonces veo la landing completa
    Y no veo ningún error
