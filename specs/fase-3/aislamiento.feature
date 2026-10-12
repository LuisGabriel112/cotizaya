# language: es
Característica: Aislamiento entre talleres
  Cada taller solo ve y cambia sus propios datos.

  Antecedentes:
    Dado el taller "El Faro" con dueño "A" y una cotización
    Y el taller "La Costa" con dueño "B" y una cotización

  Escenario: Un taller no lee cotizaciones de otro
    Cuando "A" pide la lista de cotizaciones
    Entonces solo recibe las cotizaciones de "El Faro"

  Escenario: Un taller no lee partidas, clientes ni materiales de otro
    Cuando "A" consulta partidas, clientes y materiales
    Entonces ningún renglón trae el workshop_id de "La Costa"

  Escenario: Un taller no escribe en otro
    Cuando "A" intenta insertar una cotización con el workshop_id de "La Costa"
    Entonces la base rechaza la escritura

  Escenario: Un taller no edita la cotización de otro
    Cuando "A" intenta cambiar el cliente de la cotización de "La Costa"
    Entonces no se modifica ningún renglón

  Escenario: Un anónimo no lee tablas directo
    Cuando un visitante sin sesión consulta quotes, workshops o materials
    Entonces la base le niega el acceso

  Escenario: Un usuario normal no ve la tabla de admins
    Cuando "A" consulta admins
    Entonces recibe cero renglones
