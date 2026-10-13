# language: es
Característica: PDF de la cotización

  Antecedentes:
    Dado el taller "Aluminios El Faro" de Boca del Río, teléfono "229 123 4567", plan "gratis"
    Y la cotización 0042 para "Sra. Lupita", creada el 12 de octubre de 2026
    Y una corrediza de 120 × 150 cm, 2 piezas, y 8 piezas de felpa

  Escenario: Contenido del PDF
    Cuando se arma el documento
    Entonces trae folio "0042", cliente "Sra. Lupita" y fecha "12 de octubre de 2026"
    Y dice "Vigencia: 15 días, hasta el 27 de octubre de 2026"
    Y la corrediza sale con medidas "1.20 × 1.50 m" y cantidad "2"
    Y la felpa sale sin medidas y con cantidad "8 pzas"
    Y el total coincide al centavo con calcularTotales

  Escenario: Acabado y garantía
    Dada la cotización con acabado "anodizado" y garantía contra salitre
    Cuando se arma el documento
    Entonces trae el recuadro con "Anodizado" y "Garantía contra salitre"

  Escenario: Sin acabado especial no hay recuadro
    Dada la cotización con acabado "natural" y sin garantía
    Entonces el documento no trae recuadro de extras

  Escenario: Marca solo en plan gratis
    Entonces el pie dice "Hecho con Cotiza Ya" en plan "gratis"
    Y no lo dice en plan "fundador"

  Escenario: Partida con error no se cobra
    Dada una partida cuyo material ya no tiene precio
    Entonces no aparece en el PDF ni en el total

  Escenario: PDF ligero para WhatsApp
    Cuando se genera el PDF con 3 partidas
    Entonces empieza con "%PDF" y pesa menos de 300 KB

  Escenario: Descarga desde el enlace público
    Cuando el cliente abre "/c/0042-a1b2c3d4e5f6/pdf"
    Entonces recibe un "application/pdf" llamado "cotizacion-0042.pdf"

  Escenario: Enlace inválido o cotización inexistente
    Cuando abre "/c/no-existe/pdf"
    Entonces recibe 404 sin consultar la base
