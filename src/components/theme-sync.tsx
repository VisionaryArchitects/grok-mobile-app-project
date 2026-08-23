import { useEffect } from "react";
import { getFont, getTheme, THEME_CSS_VARS } from "@/lib/look";
import { useMessenger } from "@/lib/store";

export function ThemeSync() {
  const themeId = useMessenger((s) => s.themeId);
  const fontId = useMessenger((s) => s.fontId);

  useEffect(() => {
    const theme = getTheme(themeId);
    const font = getFont(fontId);
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.style.colorScheme = theme.vars.scheme;
    for (const { key, css } of THEME_CSS_VARS) {
      root.style.setProperty(css, theme.vars[key]);
    }
    root.style.setProperty("--font-sans", font.stack);
    document.body.style.fontFamily = font.stack;
    document.body.style.fontVariantLigatures = font.ligatures ? "contextual" : "normal";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.vars.bg);

    if (font.href) {
      let link = document.getElementById("hermes-font") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = "hermes-font";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      if (link.href !== font.href) link.href = font.href;
    }
  }, [themeId, fontId]);

  return null;
}
