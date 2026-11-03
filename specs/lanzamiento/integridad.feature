# language: es
Característica: Persistencia transaccional de importes
  Escenario: Guardar una partida sin segunda petición
    Cuando se inserta una corrediza 120 por 150 cm con mano de obra de 35000 centavos
    Entonces la misma transacción deja 368000 centavos en partida y cotización
  Escenario: No confiar en importes enviados por cliente
    Cuando el dueño manda precio, importe o total manipulados por acceso directo a la base
    Entonces la base usa la foto autorizada del catálogo y recalcula el total
  Escenario: Error de cálculo
    Cuando una partida tiene medidas inválidas o su total desborda el entero de la base
    Entonces se revierte el cambio completo sin partidas o totales parciales
  Escenario: Dos cambios concurrentes
    Cuando se guardan dos partidas a la vez en la misma cotización
    Entonces se conservan las dos y el total refleja ambas
