import { describe, expect, it } from "vitest";
import { generarPdf } from "./index";
import type { DocumentoPdf, RenglonPdf } from "./tipos";

const renglon = (i: number): RenglonPdf => ({ descripcion: `Ventana corrediza ${i}`, medidas: "1.20 × 1.50 m", cantidad: "2", importe: "$3,680.00" });

const documento: DocumentoPdf = {
  folio: "0042",
  fecha: "12 de octubre de 2026",
  vigencia: "Vigencia: 15 días, hasta el 27 de octubre de 2026",
  cliente: "Sra. Lupita",
  taller: { nombre: "Aluminios El Faro", ciudad: "Boca del Río", telefono: "229 123 4567" },
  renglones: [renglon(1), renglon(2), { descripcion: "Felpa", medidas: "", cantidad: "8 pzas", importe: "$120.00" }],
  extras: ["Acabado: Anodizado", "Garantía contra salitre"],
  totales: { subtotal: "$7,480.00", descuento: { etiqueta: "Descuento 10%", importe: "-$748.00" }, iva: "$1,077.12", total: "$7,809.12" },
  condiciones: "50% de anticipo, resto contra entrega.",
  conMarca: true,
};

const MAX_BYTES = 300 * 1024;
const encabezado = (pdf: Uint8Array) => new TextDecoder().decode(pdf.slice(0, 4));

describe("generarPdf", () => {
  it("produce un PDF de menos de 300 KB", async () => {
    const pdf = await generarPdf(documento);
    expect(encabezado(pdf)).toBe("%PDF");
    expect(pdf.byteLength).toBeLessThan(MAX_BYTES);
  });

  it("también sin extras, descuento, IVA ni marca", async () => {
    const pdf = await generarPdf({ ...documento, extras: [], totales: { subtotal: "$1.00", total: "$1.00" }, conMarca: false });
    expect(encabezado(pdf)).toBe("%PDF");
  });

  it("si el logo no se puede bajar, entrega el PDF sin logo", async () => {
    const pdf = await generarPdf({ ...documento, taller: { ...documento.taller, logoUrl: "http://127.0.0.1:1/no-existe.png" } });
    expect(encabezado(pdf)).toBe("%PDF");
  });
});
