import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo/store";

export const metadata: Metadata = {
  title: "Cotización",
  robots: { index: false, follow: false },
};

export default function PublicaLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
