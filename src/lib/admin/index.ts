import { z } from "zod";
import type { MaterialCsv } from "@/lib/catalogo/csv";
import { normalizarTelefono } from "@/lib/telefono";

// Reglas del panel /admin. Las acciones solo validan con esto y llaman a la base.

const telefonoDeMexico = z.string().transform((texto, ctx) => {
  const tel = normalizarTelefono(texto);
  if (tel) return tel;
  ctx.addIssue({ code: "custom", message: "Escribe el celular del dueño a 10 dígitos." });
  return z.NEVER;
});

const camposDatos = {
  nombre: z.string().trim().min(1, "Escribe el nombre del taller.").max(80),
  ciudad: z.string().trim().max(80),
  condiciones: z.string().trim().max(300),
};

export const esquemaDatos = z.object(camposDatos);

export const esquemaAlta = z
  .object({ ...camposDatos, telefono: telefonoDeMexico })
  .transform(({ telefono, ...resto }) => ({ ...resto, ownerPhone: telefono }));

export const esquemaPlan = z.discriminatedUnion("plan", [
  z.object({ plan: z.literal("fundador"), hasta: z.iso.date("Pon hasta qué día queda activo.") }),
  z.object({ plan: z.literal("gratis"), hasta: z.string().transform(() => null) }),
]);

export function aFilasMaterial(workshopId: string, materiales: readonly MaterialCsv[]) {
  return materiales.map((m) => ({
    workshop_id: workshopId,
    clave: m.clave,
    nombre: m.nombre,
    linea: m.linea,
    unidad: m.unidad,
    precio_centavos: m.precioCentavos,
    pieza_singular: m.pieza?.[0] ?? null,
    pieza_plural: m.pieza?.[1] ?? null,
  }));
}

// SVG queda fuera: puede traer scripts y el bucket es público.
const EXTENSIONES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_LOGO_BYTES = 500 * 1024;

export function validarLogo(archivo: { type: string; size: number }): string | null {
  if (archivo.size === 0) return "Elige un archivo.";
  if (!EXTENSIONES[archivo.type]) return "Sube el logo en PNG, JPG o WebP.";
  if (archivo.size > MAX_LOGO_BYTES) return "El logo pesa más de 500 KB. Redúcelo y vuelve a subirlo.";
  return null;
}

export function rutaDeLogo(workshopId: string, tipo: string, nombre: string): string {
  return `${workshopId}/${nombre}.${EXTENSIONES[tipo]}`;
}
