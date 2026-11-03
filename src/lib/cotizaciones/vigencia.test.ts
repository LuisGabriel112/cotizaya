import { describe, expect, it } from "vitest";
import { fechaDocumento, vigenciaDocumento } from "./vigencia";

describe("vigencia compartida por hoja y PDF", () => {
  const emitida = { creadaEn:"2026-10-01T18:00:00Z",enviadaEn:"2026-11-02T18:00:00Z",venceEn:"2026-11-17T18:00:00Z",estado:"enviada" as const };
  it("usa emisión, no creación, y fecha de vencimiento de la base", () => {
    expect(fechaDocumento(emitida)).toBe("2 de noviembre de 2026");
    expect(vigenciaDocumento(emitida)).toBe("15 días, hasta el 17 de noviembre de 2026");
  });
  it("un borrador no inventa fecha de vencimiento", () => {
    expect(vigenciaDocumento({creadaEn:emitida.creadaEn,estado:"borrador"})).toBe("15 días desde el primer envío");
  });
  it("un documento histórico sin evidencia pide confirmar vigencia", () => {
    expect(vigenciaDocumento({creadaEn:emitida.creadaEn,estado:"enviada"})).toBe("Pendiente de confirmar con el taller");
  });
  it("formatea en hora de México al cruzar medianoche UTC", () => {
    expect(fechaDocumento({...emitida,enviadaEn:"2026-11-03T01:00:00Z"})).toBe("2 de noviembre de 2026");
  });
});
