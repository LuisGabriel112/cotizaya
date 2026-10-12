# language: es
Característica: La app responde al instante y confirma con el servidor

  Escenario: Guardar partida se ve al momento y queda la foto del precio
    Dada una cotización abierta
    Cuando guardo una partida
    Entonces la partida aparece sin esperar al servidor
    Y al responder el servidor se reemplaza por la que trae la foto del precio

  Escenario: Sin señal se avisa
    Dado que el servidor no responde
    Cuando marco la cotización como enviada
    Entonces aparece el aviso "No se guardó el último cambio"
    Y la app vuelve a pedir los datos al servidor

  Escenario: El nombre del cliente se manda una sola vez
    Cuando escribo el nombre del cliente letra por letra
    Entonces se manda al servidor un solo cambio al dejar de teclear

  Escenario: Datos inválidos del navegador no llegan a la base
    Cuando una acción recibe un id que no es UUID
    Entonces se rechaza antes de abrir la conexión

  Escenario: Taller nuevo pide nombre
    Dado un teléfono sin taller dado de alta
    Cuando termina de poner el código
    Entonces se le pide el nombre del taller

  Escenario: Alta con teléfono repetido
    Dado un taller con teléfono "229 111 2222"
    Cuando el admin da de alta otro con el mismo teléfono
    Entonces ve "Ya hay un taller con ese teléfono."

  Escenario: Acción de admin sin permiso
    Dado un usuario al que le quitaron el permiso de admin con el panel abierto
    Cuando envía un formulario del panel
    Entonces recibe 404 y no se toca la base
