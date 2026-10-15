import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { PRECIOS, referenciaDe, tituloDe, type PagoMp, type Periodo } from "@/lib/pagos/planes";

interface Configuracion { accessToken: string; urlApp: string }
interface Compra { taller: string; periodo: Periodo }

function instancia<T>(Constructor: new (cliente: MercadoPagoConfig) => T, cliente: MercadoPagoConfig): T {
  try {
    return new Constructor(cliente);
  } catch (error) {
    if (!(error instanceof TypeError) || !String(error.message).includes("not a constructor")) throw error;
    return (Constructor as unknown as (cliente: MercadoPagoConfig) => T)(cliente);
  }
}

// Un 404 no se arregla reintentando; cualquier otro error sí puede ser pasajero.
function noEncontradoComoNulo(error: unknown): null {
  if ((error as { status?: number } | null)?.status === 404) return null;
  throw error;
}

export function crearPasarela({ accessToken, urlApp }: Configuracion) {
  const cliente = new MercadoPagoConfig({ accessToken });
  const preferencias = instancia(Preference, cliente);
  const pagos = instancia(Payment, cliente);
  return {
    async crearPreferencia({ taller, periodo }: Compra): Promise<string> {
      const respuesta = await preferencias.create({ body: {
        items: [{ id: periodo, title: tituloDe(periodo), quantity: 1, unit_price: PRECIOS[periodo] / 100, currency_id: "MXN" }],
        external_reference: referenciaDe(taller, periodo),
        notification_url: `${urlApp}/api/mercadopago/webhook`,
        back_urls: { success: `${urlApp}/plan?pago=aprobado`, pending: `${urlApp}/plan?pago=pendiente`, failure: `${urlApp}/plan?pago=rechazado` },
        auto_return: "approved",
      } });
      if (!respuesta.init_point) throw new Error("Mercado Pago no devolvió URL de pago");
      return respuesta.init_point;
    },
    async obtenerPago(id: string): Promise<PagoMp | null> {
      const pago = await pagos.get({ id }).catch(noEncontradoComoNulo);
      if (!pago) return null;
      return { id: pago.id!, status: pago.status!, transactionAmount: pago.transaction_amount!, currencyId: pago.currency_id!, paymentTypeId: pago.payment_type_id!, externalReference: pago.external_reference ?? null };
    },
  };
}
