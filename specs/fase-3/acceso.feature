# language: es
Característica: Entrar con teléfono
  El dueño entra con su número y un código, sin contraseña.

  Escenario: Sin sesión no se ve la app
    Dado que no hay sesión
    Cuando abro "/cotizaciones"
    Entonces me lleva a "/entrar"

  Escenario: Teléfono con taller dado de alta por admin
    Dado un taller con owner_phone "522290000001" y sin dueño
    Cuando entro con "229 000 0001" y el código correcto
    Entonces el taller queda ligado a mi usuario
    Y veo mis cotizaciones

  Escenario: Teléfono nuevo
    Dado que ningún taller tiene mi teléfono
    Cuando entro con el código correcto y escribo "Aluminio Veracruz"
    Entonces se crea el taller "Aluminio Veracruz" a mi nombre
    Y su catálogo trae los materiales base

  Escenario: Código equivocado
    Cuando entro con un código incorrecto
    Entonces veo "Ese código no es. Revisa el mensaje y vuelve a escribirlo."

  Esquema del escenario: El teléfono se normaliza a 52 + 10 dígitos
    Cuando escribo "<escrito>"
    Entonces se usa "<normalizado>"
    Ejemplos:
      | escrito           | normalizado  |
      | 229 000 0001      | 522290000001 |
      | +52 229-000-0001  | 522290000001 |
      | 52 2290000001     | 522290000001 |
      | 22900             | inválido     |
