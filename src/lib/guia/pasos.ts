export type IdGuia = "lista" | "captura" | "medida" | "partida" | "vista-previa" | "precios" | "plan";

export interface Paso { objetivo: string; titulo: string; texto: string }

export const CLAVE_GUIA = "cotizaya.guia";
export const IDS_GUIA: readonly IdGuia[] = ["lista", "captura", "medida", "partida", "vista-previa", "precios", "plan"];

export const GUIAS: Record<IdGuia, readonly Paso[]> = {
  lista: [
    { objetivo: "nueva", titulo: "Empieza aquí", texto: "Tócalo y cotiza en la obra, con la cinta en la mano." },
    { objetivo: "fila", titulo: "Tus cotizaciones", texto: "Cada una con su total. La etiqueta te dice si tu cliente ya la abrió o la aceptó." },
    { objetivo: "precios", titulo: "Tus precios", texto: "Aquí cambias el precio de cada material. Lo que cotices después sale con el precio nuevo." },
    { objetivo: "plan", titulo: "Tu plan", texto: "Gratis son 5 cotizaciones al mes. Fundador no tiene tope y se paga con tarjeta u OXXO." },
  ],
  captura: [
    { objetivo: "trabajos", titulo: "Elige el trabajo", texto: "Toca el que vas a cotizar y te pide las medidas." },
  ],
  medida: [
    { objetivo: "ancho", titulo: "Teclea la medida", texto: "En centímetros, como la lees en tu cinta." },
    { objetivo: "seguir", titulo: "Luego el alto", texto: "Con este botón pasas al alto y la partida cae a la hoja con su precio." },
  ],
  partida: [
    { objetivo: "total", titulo: "Ya tienes total", texto: "Sale de tus precios. Descuento, IVA y acabado se ajustan más abajo." },
    { objetivo: "cliente", titulo: "Para quién es", texto: "Toca aquí y pon el nombre de tu cliente." },
    { objetivo: "ver", titulo: "Revísala", texto: "Cuando acabes de agregar trabajos, ábrela antes de mandarla." },
  ],
  "vista-previa": [
    { objetivo: "whatsapp", titulo: "Envíala por WhatsApp", texto: "Tu cliente recibe un enlace con el desglose y el PDF." },
    { objetivo: "enlace-cliente", titulo: "Lo que ve tu cliente", texto: "Ábrelo para ver la cotización tal como le llega." },
    { objetivo: "corregir", titulo: "Corregir", texto: "Si cambió una medida, la corriges y el total se rehace." },
  ],
  precios: [
    { objetivo: "material", titulo: "Cambia un precio", texto: "Toca un material para cambiar su precio. Las cotizaciones ya mandadas no cambian." },
    { objetivo: "agregar", titulo: "Agrega material", texto: "Si te falta un perfil o un vidrio, agrégalo aquí." },
  ],
  plan: [
    { objetivo: "estado-plan", titulo: "Tu plan", texto: "Aquí ves qué plan tienes y cuántas cotizaciones te da." },
    { objetivo: "periodo", titulo: "Mes o año", texto: "El año sale a precio de 10 meses." },
    { objetivo: "pagar", titulo: "Paga", texto: "Con tarjeta, OXXO o transferencia en Mercado Pago. El plan se activa solo al confirmarse." },
  ],
};
