# language: es
Característica: Enlace público de la cotización

  Escenario: El cliente ve solo su cotización
    Dada una cotización con slug "faro-0042-k7m2"
    Cuando un visitante abre "/c/faro-0042-k7m2"
    Entonces ve partidas, totales, nombre, teléfono y logo del taller
    Y no recibe el teléfono del dueño, ids internos, otros clientes ni otras cotizaciones

  Escenario: El dueño revisa su propio enlace
    Dada una cotización enviada de mi taller
    Cuando abro su enlace con mi sesión iniciada
    Entonces sigue "enviada" y no se registra apertura

  Escenario: Abrir el enlace marca la cotización como vista
    Dada una cotización enviada
    Cuando el visitante abre el enlace
    Entonces la cotización queda "vista" con fecha de apertura
    Y se registra un evento "abierta"

  Escenario: Aceptar desde el enlace
    Cuando el visitante toca "Aceptar cotización"
    Entonces la cotización queda "aceptada" y se registra un evento "aceptada"

  Escenario: Slug inexistente
    Cuando un visitante abre "/c/no-existe"
    Entonces ve "Esta cotización ya no está disponible"
