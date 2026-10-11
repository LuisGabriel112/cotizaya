import type { ReactNode } from "react";

/** Acción principal fija abajo, al alcance del pulgar. La página deja `pb-28` para no taparse. */
export function BarraAccion({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-tinta bg-papel px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md flex-col gap-2 [&>*]:w-full">{children}</div>
    </div>
  );
}
