import { useEffect, type ReactNode } from "react";
import { ThemeSync } from "@/components/theme-sync";
import { useMessenger } from "@/lib/store";

export function PhoneShell({ children }: { children: ReactNode }) {
  const hydrate = useMessenger((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-dvh bg-bg md:grid md:place-items-center md:py-6">
      <ThemeSync />
      <div className="relative mx-auto flex h-dvh w-full max-w-full flex-col overflow-hidden bg-bg md:h-[844px] md:w-[390px] md:rounded-[28px] md:border md:border-line md:shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-8 items-center justify-between px-6 text-[11px] font-medium text-fg md:flex">
          <span className="tabular-nums">9:41</span>
          <span className="absolute left-1/2 top-2 h-4 w-24 -translate-x-1/2 rounded-full bg-elevated" />
          <span className="tabular-nums text-muted">LTE</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)] md:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
