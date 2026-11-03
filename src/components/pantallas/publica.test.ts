import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CATALOGO } from "@/lib/demo/catalogo";
import { PLANTILLAS } from "@/lib/demo/plantillas";
import { COTIZACIONES_SEMILLA,TALLER } from "@/lib/demo/semilla";
import { crearCatalogo } from "@/lib/cotizaciones/catalogo";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import { PantallaPublica } from "./publica";

const catalogo=crearCatalogo(CATALOGO,PLANTILLAS);
const pintar=(estado:Cotizacion["estado"],extras={})=>renderToStaticMarkup(createElement(PantallaPublica,{
  cotizacion:{...COTIZACIONES_SEMILLA[0]!,estado},taller:TALLER,catalogo,
  onAbierta:()=>{},onAceptar:()=>{},...extras,
}));
describe("estados visibles de aceptación",()=>{
  it("durante la confirmación deshabilita el botón e informa del progreso",()=>{
    const html=pintar("enviada",{aceptando:true});
    expect(html).toMatch(/<button[^>]*disabled=""/);
    expect(html).toContain("Confirmando aceptación");
  });
  it("el error es visible sin afirmar aceptación",()=>{
    const html=pintar("vista",{errorAceptacion:"Puede haber vencido"});
    expect(html).toContain('role="alert"'); expect(html).toContain("Puede haber vencido");
    expect(html).not.toContain("ya sabe que la aceptaste");
  });
  it.each(["borrador","rechazada"] as const)("%s real no permite aceptar",estado=>{
    const html=pintar(estado);
    expect(html).not.toContain("Aceptar cotización"); expect(html).toContain("Escribirle al taller");
  });
  it("aceptada muestra confirmación y contacto",()=>{
    expect(pintar("aceptada")).toContain("ya sabe que la aceptaste");
    expect(pintar("aceptada")).not.toContain("Aceptar cotización");
  });
  it("una oferta sustituida conserva contenido y pide la revisión vigente",()=>{
    const html=renderToStaticMarkup(createElement(PantallaPublica,{
      cotizacion:{...COTIZACIONES_SEMILLA[0]!,estado:"enviada",sustituidaEn:"2026-11-02T18:00:00Z"},
      taller:TALLER,catalogo,onAbierta:()=>{},onAceptar:()=>{},
    }));
    expect(html).toContain("El taller emitió una revisión");expect(html).not.toContain("Aceptar cotización");
  });
});
