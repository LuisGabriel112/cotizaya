import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo/store";

// Prototipo con datos de ejemplo para el video y las videollamadas. Sin login.
export const metadata: Metadata = {
  title: "Cotiza Ya · demostración",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
