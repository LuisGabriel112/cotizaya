# language: es
Característica: Acreditar un pago una sola vez
  Escenario: Estados fuera de orden
    Dado un pago aprobado que ya extendió el plan
    Cuando llega pending y luego approved para el mismo pago
    Entonces la vigencia no se vuelve a extender
  Escenario: Entregas concurrentes
    Cuando dos conexiones registran a la vez el mismo pago aprobado
    Entonces ambas terminan correctamente y el plan se extiende una sola vez
  Escenario: Identidad inmutable
    Dado un external_id registrado para un taller, periodo y monto
    Cuando se intenta asociarlo a otro taller o compra
    Entonces la base lo rechaza sin activar planes
