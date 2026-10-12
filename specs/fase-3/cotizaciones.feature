# language: es
Característica: Cotizaciones con datos reales

  Escenario: Folio consecutivo por taller
    Dado que "El Faro" tiene la cotización 0042
    Cuando crea una nueva
    Entonces su folio es 0043
    Y el folio de "La Costa" no cambia

  Escenario: Guardar partida recalcula totales
    Dada una cotización en borrador
    Cuando guardo una corrediza de 120 × 150 cm con mano de obra de $350
    Entonces el total guardado es $3,680.00
    Y coincide con calcularTotales

  Escenario: Quitar partida recalcula totales
    Dada una cotización con dos partidas
    Cuando quito una
    Entonces el total guardado solo suma la que queda

  Escenario: Marcar enviada solo desde borrador
    Dada una cotización aceptada
    Cuando la marco enviada
    Entonces sigue aceptada
