# language: es
Característica: Frescura de la firma de Mercado Pago
  Escenario: Una firma auténtica antigua no autoriza otro intento
    Dada una firma HMAC válida de hace más de cinco minutos
    Cuando llega al webhook
    Entonces se rechaza antes de consultar o registrar pagos
  Escenario: El proveedor utiliza segundos o milisegundos
    Dada una firma auténtica dentro de cinco minutos del reloj del servidor
    Entonces es válida tanto con timestamp en segundos como en milisegundos
  Escenario: Encabezado ambiguo o timestamp futuro
    Dada una firma válida con ts duplicado, no numérico o fuera de ventana futura
    Entonces la firma no autoriza el pago
