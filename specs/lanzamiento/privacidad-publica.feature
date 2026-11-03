# language: es
Característica: Minimizar la vista pública
  Escenario: Borrador privado
    Dado un borrador no emitido
    Entonces su dueño puede revisar el enlace pero un anónimo no recibe sus datos
  Escenario: Campos públicos explícitos
    Dada una cotización emitida
    Entonces la respuesta pública no incluye UUID de cotización, partida, material o taller
    Y añadir columnas internas al esquema no las expone automáticamente
