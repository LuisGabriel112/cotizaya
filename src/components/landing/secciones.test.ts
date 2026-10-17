import { createElement, type FunctionComponent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ComoSeUsa, LoQueRecibeElCliente, Pie, Precio, Preguntas } from "./secciones";

const html = (seccion: FunctionComponent) => renderToStaticMarkup(createElement(seccion));

describe("cómo se cotiza en la obra", () => {
  it("son tres pasos en palabras de taller", () => {
    const salida = html(ComoSeUsa);
    for (const texto of ["Así se cotiza en la obra", "Mides con tu cinta.", "Eliges el trabajo y tecleas las medidas.", "Lo mandas por WhatsApp."]) {
      expect(salida).toContain(texto);
    }
  });
});

describe("lo que recibe el cliente", () => {
  it("muestra una hoja de ejemplo con desglose y los enlaces para abrirla", () => {
    const salida = html(LoQueRecibeElCliente);
    for (const texto of ["Lo que le llega a tu cliente", "Ventana corrediza", "Ábrela como la ve tu cliente"]) {
      expect(salida).toContain(texto);
    }
    expect(salida).toContain('href="/demo/c/faro-0042-k7m2"');
  });

  it("deja claro que es un ejemplo", () => {
    expect(html(LoQueRecibeElCliente)).toContain("Cotización de ejemplo");
  });
});

describe("precio", () => {
  it("se lee como nota de remisión, con las dos opciones y las formas de pago", () => {
    const salida = html(Precio);
    for (const texto of ["Gratis", "5 cotizaciones al mes", "Fundador", "$99.00", "$990.00", "Pagas con tarjeta, en OXXO o por transferencia."]) {
      expect(salida).toContain(texto);
    }
  });

  it("no inventa descuentos ni urgencia", () => {
    const salida = html(Precio);
    for (const texto of ["antes", "oferta", "solo hoy", "%"]) expect(salida.toLowerCase()).not.toContain(texto);
  });
});

describe("preguntas del taller", () => {
  it("responde las cuatro dudas de siempre", () => {
    const salida = html(Preguntas);
    for (const texto of ["¿Necesito internet en la obra?", "¿Puedo cambiar mis precios?", "¿Sale mi logo?", "¿Qué pasa cuando se acaban las 5?"]) {
      expect(salida).toContain(texto);
    }
  });
});

describe("pie", () => {
  it("avisa que los datos son de ejemplo y deja probar sin registrarse", () => {
    const salida = html(Pie);
    expect(salida).toContain("Los datos de esta página son de ejemplo.");
    expect(salida).toContain("Pruébalo completo, sin registrarte");
    expect(salida).toContain('href="/demo"');
  });
});
