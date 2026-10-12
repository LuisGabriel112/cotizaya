# language: es
Característica: Panel de administración

  Escenario: Un no-admin no ve el panel
    Dado un usuario que no está en admins
    Cuando abre "/admin"
    Entonces recibe 404

  Escenario: Alta de taller
    Dado un admin
    Cuando da de alta "Vidrios Boca" con teléfono "229 111 2222"
    Entonces el taller existe con owner_phone "522291112222", plan "gratis" y catálogo base

  Escenario: Subir logo
    Cuando el admin sube un PNG como logo de "Vidrios Boca"
    Entonces logo_url apunta al archivo en el bucket "logos"

  Escenario: Importar catálogo desde CSV
    Dado el CSV
      """
      clave,nombre,linea,unidad,precio
      corrediza-3,Corrediza 3",3",m2,"2,150.00"
      felpa,Felpa,Mantenimiento,pieza,abc
      """
    Cuando el admin lo importa
    Entonces se guarda "corrediza-3" con 215000 centavos
    Y se reporta "Línea 3: precio no es un número"
    Y si una clave ya existe en el taller se actualiza, no se duplica

  Escenario: Activar plan
    Cuando el admin activa "fundador" hasta "2027-10-12"
    Entonces el taller queda con plan "fundador" y plan_until "2027-10-12"
