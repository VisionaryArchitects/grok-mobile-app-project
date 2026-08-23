import { useEffect } from "react";
import { Check } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { FONTS, THEMES, getFont, getTheme } from "@/lib/look";
import { useMessenger } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemesView() {
  const themeId = useMessenger((s) => s.themeId);
  const fontId = useMessenger((s) => s.fontId);
  const setTheme = useMessenger((s) => s.setTheme);
  const setFont = useMessenger((s) => s.setFont);
  const theme = getTheme(themeId);
  const font = getFont(fontId);

  useEffect(() => {
    for (const f of FONTS) {
      if (!f.href) continue;
      const id = `hermes-font-${f.id}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = f.href;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="px-4 pt-3 pb-2">
        <h1 className="text-[28px] font-semibold tracking-tight">Themes</h1>
        <p className="mt-1 text-sm text-muted">
          {theme.name} · {font.name}. Tap to switch — it sticks.
        </p>
      </header>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 pb-6">
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">
            Palettes
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const on = t.id === themeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "w-full rounded-2xl p-3 text-left ring-1",
                      on ? "ring-accent bg-accent-dim" : "ring-line bg-elevated",
                    )}
                  >
                    <span className="mb-2 flex gap-1">
                      {[t.vars.bg, t.vars.accent, t.vars.fg, t.vars.me].map((c) => (
                        <span
                          key={c}
                          className="size-4 rounded-full ring-1 ring-line"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span className="flex items-center justify-between gap-1">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-fg">{t.name}</span>
                        <span className="block truncate text-[11px] text-muted">{t.hint}</span>
                      </span>
                      {on ? <Check className="size-4 shrink-0 text-accent" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">
            Fonts
          </h2>
          <ul className="overflow-hidden rounded-2xl ring-1 ring-line">
            {FONTS.map((f, i) => {
              const on = f.id === fontId;
              return (
                <li key={f.id} className={i === 0 ? "" : "border-t border-line"}>
                  <button
                    type="button"
                    onClick={() => setFont(f.id)}
                    className={cn(
                      "flex h-14 w-full items-center justify-between gap-3 px-4 text-left",
                      on ? "bg-accent-dim" : "bg-elevated",
                    )}
                  >
                    <span className="min-w-0">
                      <span
                        className="block truncate text-[16px] font-medium text-fg"
                        style={{ fontFamily: f.stack }}
                      >
                        {f.name}
                      </span>
                      <span className="block text-[11px] text-muted">{f.hint}</span>
                    </span>
                    {on ? <Check className="size-4 shrink-0 text-accent" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <p
            className="mt-4 rounded-2xl bg-elevated px-4 py-3 text-[15px] leading-relaxed text-fg ring-1 ring-line"
            style={{ fontFamily: font.stack }}
          >
            {`const hermes = "ready"; // ${font.name}`}
            <br />
            Pack my box with five dozen liquor jugs.
          </p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
