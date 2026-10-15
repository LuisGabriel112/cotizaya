# language: es
Característica: Pagar el plan fundador con Mercado Pago
  Pago único con Checkout Pro (tarjeta, OXXO o transferencia) que extiende el plan
  1 mes ($99) o 1 año ($990). El plan se activa solo cuando Mercado Pago confirma.

  Antecedentes:
    Dado que el taller "El Faro" está en plan gratis

  Escenario: Elegir periodo e ir a pagar
    Cuando abre /plan
    Entonces ve "$99 al mes" y "$990 al año"
    Cuando elige "1 año" y toca "Pagar con Mercado Pago"
    Entonces llega al checkout de Mercado Pago por $990.00 MXN

  Escenario: El aviso de cupo lleva a /plan
    Dado que este mes lleva 3 cotizaciones
    Cuando abre la lista
    Entonces el aviso de cupo trae el enlace "Pasar a fundador"

  Escenario: Pago con tarjeta aprobado activa el plan
    Cuando Mercado Pago notifica un pago aprobado de $99.00 MXN con tarjeta para "El Faro" por 1 mes
    Entonces el taller queda en plan fundador hasta dentro de 1 mes
    Y queda un pago "tarjeta" de 9900 centavos aprobado

  Escenario: OXXO pendiente no activa; al pagarse sí
    Cuando Mercado Pago notifica un pago OXXO pendiente
    Entonces el taller sigue en plan gratis
    Y queda un pago "oxxo" pendiente
    Cuando Mercado Pago notifica ese mismo pago ya aprobado
    Entonces el taller queda en plan fundador

  Escenario: Una notificación repetida no extiende dos veces
    Dado que ya se procesó el pago aprobado "123"
    Cuando Mercado Pago vuelve a notificar el pago "123" aprobado
    Entonces la vigencia no cambia

  Escenario: Pagar antes de vencer suma al tiempo que queda
    Dado que el taller es fundador hasta el 30 de noviembre
    Cuando se aprueba un pago de 1 mes
    Entonces queda fundador hasta el 30 de diciembre

  Escenario: Pagar ya vencido cuenta desde hoy
    Dado que el taller fue fundador hasta el 30 de septiembre
    Y hoy es 14 de octubre
    Cuando se aprueba un pago de 1 mes
    Entonces queda fundador hasta el 14 de noviembre

  Escenario: Firma inválida se rechaza sin consultar el pago
    Cuando llega una notificación con x-signature que no corresponde
    Entonces responde 401
    Y no consulta a Mercado Pago ni toca la base

  Escenario: Monto que no corresponde al periodo se ignora
    Cuando Mercado Pago confirma un pago aprobado de $50.00 MXN para 1 mes
    Entonces no se activa el plan
    Y responde 200 para que Mercado Pago no reintente

  Escenario: Pago que Mercado Pago no conoce se ignora sin reintentos
    Cuando llega una notificación firmada con un id de pago que Mercado Pago no encuentra
    Entonces no se activa el plan
    Y responde 200 para que Mercado Pago no reintente

  Escenario: Si Mercado Pago o la base fallan, se pide reintento
    Cuando llega una notificación firmada y la consulta o el registro fallan
    Entonces responde 500 para que Mercado Pago reintente

  Escenario: Notificaciones que no son de pagos se ignoran
    Cuando llega una notificación de tipo "merchant_order"
    Entonces responde 200 sin consultar nada

  Escenario: Nadie más que el webhook registra pagos
    Dado que soy el dueño del taller con sesión
    Cuando llamo directo a registrar_pago
    Entonces la base lo niega
