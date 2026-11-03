# language: es
Característica: El cupo gratuito no depende de datos elegidos por el navegador
  Escenario: Antedatar altas
    Cuando el dueño inserta cotizaciones con fecha del mes anterior
    Entonces la base fija la fecha real y la sexta del mes se rechaza
  Escenario: Borrar para recuperar cupo
    Cuando el dueño intenta borrar cotizaciones directamente
    Entonces la base rechaza la operación
  Escenario: Estado de alta manipulado
    Cuando se crea una cotización solicitando estado aceptada
    Entonces nace como borrador y sin fecha de apertura
