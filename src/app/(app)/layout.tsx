import { DemoProvider } from "@/lib/demo/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}
