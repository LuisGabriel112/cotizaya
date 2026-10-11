import { ImageResponse } from "next/og";
import { Marca } from "../marca";

const ICONOS = {
  "192": { size: 192, margen: 0 },
  "512": { size: 512, margen: 0 },
  // Zona segura de maskable: 80 % central.
  maskable: { size: 512, margen: 51 },
} as const;

type Clave = keyof typeof ICONOS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONOS).map((size) => ({ size }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const icono = ICONOS[size as Clave];
  if (!icono) return new Response("No existe", { status: 404 });
  return new ImageResponse(<Marca size={icono.size} margen={icono.margen} />, {
    width: icono.size,
    height: icono.size,
  });
}
