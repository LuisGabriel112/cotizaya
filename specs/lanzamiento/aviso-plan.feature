# language: es
Característica: Confirmaciones comerciales verificables
  Escenario: La redirección de Checkout no prueba activación
    Cuando alguien abre /plan?pago=aprobado
    Entonces se informa que debe consultar el estado real del plan
    Y no se afirma que ya está activo por el parámetro de URL
  Escenario: Valor de URL desconocido
    Cuando el parámetro pago no es un resultado reconocido
    Entonces no se renderiza un aviso de pago
