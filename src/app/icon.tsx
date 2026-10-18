import { ImageResponse } from "next/og";
import { Marca } from "./icons/marca";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Marca size={32} />, size);
}
