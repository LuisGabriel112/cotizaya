# language: es
Característica: Navegación de la vista previa en un puerto publicado
  Escenario: Abrir la demo desde el botón inferior de la landing
    Dado que la landing se visita en el puerto 3100
    Cuando se toca Cotizar gratis
    Entonces se abre /demo/cotizaciones en el mismo origen y puerto
    Y la lista de cotizaciones se muestra sin error de conexión
