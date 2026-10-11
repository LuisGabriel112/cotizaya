import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cotiza Ya",
  description: "Cotiza trabajos de aluminio desde el celular y mándalos por WhatsApp.",
  applicationName: "Cotiza Ya",
  appleWebApp: { capable: true, title: "Cotiza Ya", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161616",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
