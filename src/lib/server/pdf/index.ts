import { renderToBuffer } from "@react-pdf/renderer";
import { PlantillaPdf } from "./plantilla";
import type { DocumentoPdf } from "./tipos";

export async function generarPdf(doc: DocumentoPdf): Promise<Uint8Array> {
  const buffer = await renderToBuffer(PlantillaPdf({ doc }));
  return new Uint8Array(buffer);
}
