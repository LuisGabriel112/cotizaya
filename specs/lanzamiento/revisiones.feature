# language: es
Característica: Revisiones con historial de ofertas
  Escenario: Corregir una oferta emitida
    Cuando el dueño crea una revisión
    Entonces obtiene un borrador con nuevo folio y enlace, vinculado a la oferta anterior
    Y la oferta anterior conserva contenido, PDF, aceptación y vencimiento
  Escenario: Cambiar perfil o catálogo
    Entonces una oferta ya emitida conserva los datos del taller y precios que mostraba
    Y la revisión nueva usa los precios actuales del catálogo
  Escenario: Historial y aislamiento
    Entonces el taller puede recorrer las versiones vinculadas
    Y un taller ajeno no puede crear revisiones ni alterar versiones anteriores
  Escenario: Cupo y materiales eliminados
    Entonces una revisión respeta el cupo de altas existente
    Y si no puede copiar materiales se rechaza sin crear un borrador parcial
