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
  Escenario: El recurso consultado no coincide con el firmado
    Dado que la API devuelve un ID de pago distinto al ID firmado
    Entonces no se registra el pago y se responde con un error recuperable
  Escenario: Error de configuración
    Dado que las dependencias del webhook no se pueden crear
    Entonces se devuelve 503 sin incluir secretos en el cuerpo ni los logs
