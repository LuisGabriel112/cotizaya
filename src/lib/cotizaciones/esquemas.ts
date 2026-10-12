import { z } from "zod";

// Lo que llega del navegador a las Server Actions no se cree: se valida aquí.

export const esquemaId = z.uuid();

const centimetros = z.int().min(0).max(100_000);

/** El precio del material no viaja: el servidor toma la foto del catálogo. */
export const esquemaPartida = z.object({
  id: esquemaId,
  plantillaId: z.string().max(40),
  descripcion: z.string().trim().min(1).max(200),
  materialId: esquemaId,
  anchoCm: centimetros,
  altoCm: centimetros,
  cantidad: z.int().min(1).max(99),
  manoObraCentavos: z.int().min(0).max(100_000_000),
});

export const esquemaCambios = z
  .object({
    cliente: z.string().max(120),
    descuentoPct: z.int().min(0).max(100),
    conIva: z.boolean(),
    acabado: z.enum(["natural", "anodizado", "electrostatica"]),
    garantiaSalitre: z.boolean(),
  })
  .partial()
  .strict();
