# language: es
Característica: Límite de cotizaciones en el plan gratis
  El plan gratis permite 5 cotizaciones por mes calendario (hora de Veracruz).
  El taller se entera antes de topar, sin sorpresas, y la base es la que manda.

  Antecedentes:
    Dado que el taller "El Faro" está en plan gratis

  Escenario: Sin aviso mientras sobra cupo
    Dado que este mes lleva 2 cotizaciones
    Cuando abre la lista de cotizaciones
    Entonces no ve ningún aviso de cupo
    Y puede crear una cotización nueva

  Escenario: Aviso honesto cuando faltan 2
    Dado que este mes lleva 3 cotizaciones
    Cuando abre la lista de cotizaciones
    Entonces ve "Te quedan 2 cotizaciones este mes en el plan gratis."

  Escenario: Aviso en singular cuando falta 1
    Dado que este mes lleva 4 cotizaciones
    Cuando abre la lista de cotizaciones
    Entonces ve "Te queda 1 cotización este mes en el plan gratis."

  Escenario: Cupo agotado
    Dado que este mes lleva 5 cotizaciones
    Cuando abre la lista de cotizaciones
    Entonces ve "Ya usaste tus 5 cotizaciones de este mes. Se renuevan el 1 de noviembre."
    Y el botón "Nueva cotización" está desactivado
    Y sigue pudiendo abrir, editar y enviar las que ya tiene

  Escenario: La base rechaza la sexta aunque la pantalla esté vieja
    Dado que este mes lleva 5 cotizaciones creadas desde otro celular
    Cuando intenta crear otra
    Entonces la base la rechaza con el código "CY429"
    Y la app vuelve a la lista con el aviso de cupo agotado, sin el aviso de "sin señal"

  Escenario: Las del mes pasado no cuentan
    Dado que el mes pasado hizo 5 cotizaciones
    Y este mes lleva 0
    Cuando intenta crear una
    Entonces se crea

  Escenario: El mes se corta en hora de Veracruz
    Dado que una cotización se creó el 31 de octubre a las 23:30 hora de Veracruz
    Cuando se cuenta el cupo de noviembre
    Entonces esa cotización no cuenta

  Escenario: Plan fundador vigente no tiene límite
    Dado que el taller está en plan fundador hasta el 30 de noviembre
    Y este mes lleva 5 cotizaciones
    Cuando intenta crear otra
    Entonces se crea
    Y no ve ningún aviso de cupo

  Escenario: Plan fundador vencido vuelve al límite gratis
    Dado que el taller está en plan fundador hasta el 30 de septiembre
    Y hoy es 13 de octubre
    Y este mes lleva 5 cotizaciones
    Cuando intenta crear otra
    Entonces la base la rechaza con el código "CY429"

  Escenario: El prototipo no tiene límite
    Dado que estoy en /demo
    Cuando abro la lista
    Entonces no veo avisos de cupo
