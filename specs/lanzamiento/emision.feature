# language: es
Característica: Primera emisión y vigencia
  Escenario: Primer envío
    Cuando el dueño emite una cotización en borrador con partidas
    Entonces se fija la fecha de envío y vencimiento quince días después
    Y la misma transacción registra un solo evento enviada
  Escenario: Repetir envío
    Cuando el dueño vuelve a compartir una cotización emitida
    Entonces no cambia su fecha de envío ni su vencimiento ni duplica el evento
  Escenario: Aceptación pública
    Entonces solo se puede aceptar una cotización emitida y vigente
    Y repetir la aceptación no duplica eventos
  Escenario: Apertura repetida
    Entonces la primera apertura queda registrada una sola vez
  Escenario: Fecha y vigencia en documentos
    Dada una cotización creada días antes de enviarse
    Entonces la fecha y vencimiento del PDF y la hoja usan el primer envío
    Y un borrador dice que sus quince días comienzan al enviarse
  Escenario: Confirmación de aceptación
    Cuando el cliente toca Aceptar
    Entonces solo se muestra Aceptada tras confirmarlo el servidor
    Y un error o vencimiento conserva el estado y muestra cómo reintentar
  Escenario: Compartir sin perder cambios pendientes
    Dado que hay partidas en vuelo o edición agrupada pendiente
    Cuando el taller envía por WhatsApp
    Entonces se espera la confirmación antes de emitir el snapshot y abrir el mensaje
    Y si falla una escritura no se emite ni se comparte una oferta incompleta
