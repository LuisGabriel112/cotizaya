import { describe, expect, it } from "vitest";
import { CLAVE_GUIA, GUIAS, IDS_GUIA, type IdGuia } from "./pasos";

const PRIMEROS: Record<IdGuia, string> = {
  lista: "nueva",
  captura: "trabajos",
  medida: "ancho",
  partida: "total",
  "vista-previa": "whatsapp",
  precios: "material",
  plan: "estado-plan",
};

describe("guías de cada pantalla", () => {
  it("hay una guía por pantalla y la lista de ids coincide", () => {
    expect([...IDS_GUIA].sort()).toEqual(Object.keys(PRIMEROS).sort());
    expect(Object.keys(GUIAS).sort()).toEqual([...IDS_GUIA].sort());
  });

  it.each(Object.entries(PRIMEROS))("la guía de %s empieza por %s", (id, primero) => {
    expect(GUIAS[id as IdGuia][0]!.objetivo).toBe(primero);
  });

  it.each([...IDS_GUIA])("la guía de %s es corta: de 1 a 4 pasos, sin elementos repetidos", (id) => {
    const objetivos = GUIAS[id].map((p) => p.objetivo);
    expect(objetivos.length).toBeGreaterThanOrEqual(1);
    expect(objetivos.length).toBeLessThanOrEqual(4);
    expect(new Set(objetivos).size).toBe(objetivos.length);
  });

  it("cada paso tiene rótulo y una explicación de frases cortas", () => {
    for (const paso of IDS_GUIA.flatMap((id) => GUIAS[id])) {
      expect(paso.titulo.trim()).not.toBe("");
      expect(paso.texto.length).toBeLessThanOrEqual(120);
      expect(paso.texto).toMatch(/\.$/);
    }
  });

  it("al entrar a cotizar solo se pide elegir el trabajo; lo demás espera a la primera partida", () => {
    expect(GUIAS.captura.map((p) => p.objetivo)).toEqual(["trabajos"]);
    expect(GUIAS.partida.map((p) => p.objetivo)).toEqual(["total", "cliente", "ver"]);
  });

  it("la vista previa no repite el estado que ya enseña la lista", () => {
    expect(GUIAS["vista-previa"].map((p) => p.objetivo)).toEqual(["whatsapp", "enlace-cliente", "corregir"]);
  });

  it("ningún paso se llama como el botón Sigue de la guía ni repite 'Siguiente'", () => {
    for (const paso of IDS_GUIA.flatMap((id) => GUIAS[id])) expect(paso.titulo).not.toMatch(/^(Sigue|Siguiente)$/);
  });

  it("la lista explica lo de la app real: precios y plan", () => {
    expect(GUIAS.lista.map((p) => p.objetivo)).toEqual(["nueva", "fila", "precios", "plan"]);
  });

  it("las guías cubren mandar por WhatsApp y el pago", () => {
    const textos = IDS_GUIA.flatMap((id) => GUIAS[id]).map((p) => `${p.titulo} ${p.texto}`).join(" ");
    for (const tema of ["WhatsApp", "OXXO", "precio"]) expect(textos).toContain(tema);
  });

  it("sin copy de relleno", () => {
    const textos = IDS_GUIA.flatMap((id) => GUIAS[id]).map((p) => `${p.titulo} ${p.texto}`).join(" ").toLowerCase();
    for (const relleno of ["fácil", "potencia", "siguiente nivel", "sin esfuerzo", "increíble", "usted"]) expect(textos).not.toContain(relleno);
  });

  it("se guarda bajo una clave propia de la app", () => {
    expect(CLAVE_GUIA).toBe("cotizaya.guia");
  });
});
