import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verificarFirma } from "./firma";

const SECRETO = "secreto-de-prueba";
const firmar = (manifiesto: string) => createHmac("sha256", SECRETO).update(manifiesto).digest("hex");
const v1 = firmar("id:123abc;request-id:req-1;ts:1704908010;");
const AHORA = 1704908010 * 1000;
const valida = { secreto: SECRETO, firma: `ts=1704908010,v1=${v1}`, requestId: "req-1", dataId: "123abc", ahora: AHORA };

describe("verificarFirma (x-signature de Mercado Pago)", () => {
  it("acepta la firma HMAC-SHA256 del manifiesto id;request-id;ts", () => {
    expect(verificarFirma(valida)).toBe(true);
  });

  it("acepta espacios y el orden v1,ts en el encabezado", () => {
    expect(verificarFirma({ ...valida, firma: ` v1=${v1} , ts=1704908010` })).toBe(true);
  });

  it("el data.id alfanumérico va en minúsculas, como lo firma Mercado Pago", () => {
    expect(verificarFirma({ ...valida, dataId: "123ABC" })).toBe(true);
  });

  it.each([
    ["otra firma", { firma: `ts=1704908010,v1=${"0".repeat(64)}` }],
    ["otro ts", { firma: `ts=1704908011,v1=${v1}` }],
    ["otro request-id", { requestId: "req-2" }],
    ["otro data.id", { dataId: "999" }],
    ["otro secreto", { secreto: "otro" }],
    ["sin v1", { firma: "ts=1704908010" }],
    ["sin ts", { firma: `v1=${v1}` }],
    ["encabezado vacío", { firma: "" }],
    ["v1 de otro largo", { firma: "ts=1704908010,v1=abc" }],
    ["sin request-id", { requestId: "" }],
    ["sin secreto", { secreto: "" }],
  ])("rechaza con %s", (_, cambios) => {
    expect(verificarFirma({ ...valida, ...cambios })).toBe(false);
  });

  it.each([-300_001, 300_001, Number.NaN])("rechaza desfase de reloj %s", (desfase) => {
    expect(verificarFirma({ ...valida, ahora: AHORA + desfase })).toBe(false);
  });

  it.each([-300_000, 300_000])("acepta el límite de tolerancia %s", (desfase) => {
    expect(verificarFirma({ ...valida, ahora: AHORA + desfase })).toBe(true);
  });

  it("acepta timestamp en milisegundos y reloj predeterminado", () => {
    const ts = String(Date.now());
    const hash = firmar(`id:123abc;request-id:req-1;ts:${ts};`);
    expect(verificarFirma({ ...valida, ahora: undefined, firma: `ts=${ts},v1=${hash}` })).toBe(true);
  });

  it.each(["no-es-fecha", "1e12", "1704908010.0", "17049080100000000"])("rechaza ts %s aunque el HMAC coincida", (ts) => {
    const hash = firmar(`id:123abc;request-id:req-1;ts:${ts};`);
    expect(verificarFirma({ ...valida, firma: `ts=${ts},v1=${hash}` })).toBe(false);
  });

  it.each([`ts=1704908010,ts=1704908010,v1=${v1}`, `ts=1704908010,v1=${v1},v1=${v1}`])("rechaza parámetros duplicados", (firma) => {
    expect(verificarFirma({ ...valida, firma })).toBe(false);
  });
});
