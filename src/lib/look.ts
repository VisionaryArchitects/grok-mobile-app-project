export type ThemeId =
  | "hermes"
  | "tokyo-night"
  | "gruvbox"
  | "gruvbox-light"
  | "catppuccin-mocha"
  | "catppuccin-latte"
  | "nord"
  | "dracula"
  | "one-dark"
  | "solarized-dark"
  | "solarized-light"
  | "monokai"
  | "night-owl"
  | "rose-pine"
  | "everforest";

export type ThemeVars = {
  bg: string;
  surface: string;
  elevated: string;
  panel: string;
  fg: string;
  muted: string;
  subtle: string;
  line: string;
  accent: string;
  accentDim: string;
  accentFg: string;
  send: string;
  sendFg: string;
  danger: string;
  me: string;
  them: string;
  scheme: "dark" | "light";
};

export type ThemeDef = {
  id: ThemeId;
  name: string;
  hint: string;
  vars: ThemeVars;
};

export type FontDef = {
  id: string;
  name: string;
  hint: string;
  stack: string;
  href?: string;
  ligatures?: boolean;
};

const gf = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700&display=swap`;

export const FONTS: FontDef[] = [
  {
    id: "outfit",
    name: "Outfit",
    hint: "Hermes default",
    stack: '"Outfit", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    hint: "IDE classic",
    stack: '"JetBrains Mono", ui-monospace, monospace',
    href: gf("JetBrains Mono"),
    ligatures: true,
  },
  {
    id: "fira-code",
    name: "Fira Code",
    hint: "Ligatures",
    stack: '"Fira Code", ui-monospace, monospace',
    href: gf("Fira Code"),
    ligatures: true,
  },
  {
    id: "source-code-pro",
    name: "Source Code Pro",
    hint: "Adobe",
    stack: '"Source Code Pro", ui-monospace, monospace',
    href: gf("Source Code Pro"),
  },
  {
    id: "ibm-plex-mono",
    name: "IBM Plex Mono",
    hint: "IBM",
    stack: '"IBM Plex Mono", ui-monospace, monospace',
    href: gf("IBM Plex Mono"),
  },
  {
    id: "roboto-mono",
    name: "Roboto Mono",
    hint: "Google",
    stack: '"Roboto Mono", ui-monospace, monospace',
    href: gf("Roboto Mono"),
  },
  {
    id: "cascadia-code",
    name: "Cascadia Code",
    hint: "Windows Terminal",
    stack: '"Cascadia Code", ui-monospace, monospace',
    href: gf("Cascadia Code"),
    ligatures: true,
  },
  {
    id: "inconsolata",
    name: "Inconsolata",
    hint: "Print-friendly",
    stack: '"Inconsolata", ui-monospace, monospace',
    href: gf("Inconsolata"),
  },
  {
    id: "space-mono",
    name: "Space Mono",
    hint: "Geometric",
    stack: '"Space Mono", ui-monospace, monospace',
    href: gf("Space Mono"),
  },
  {
    id: "ubuntu-mono",
    name: "Ubuntu Mono",
    hint: "Linux",
    stack: '"Ubuntu Mono", ui-monospace, monospace',
    href: gf("Ubuntu Mono"),
  },
  {
    id: "red-hat-mono",
    name: "Red Hat Mono",
    hint: "Red Hat",
    stack: '"Red Hat Mono", ui-monospace, monospace',
    href: gf("Red Hat Mono"),
  },
  {
    id: "azeret-mono",
    name: "Azeret Mono",
    hint: "Sharp",
    stack: '"Azeret Mono", ui-monospace, monospace',
    href: gf("Azeret Mono"),
  },
  {
    id: "martian-mono",
    name: "Martian Mono",
    hint: "Industrial",
    stack: '"Martian Mono", ui-monospace, monospace',
    href: gf("Martian Mono"),
  },
  {
    id: "inter",
    name: "Inter",
    hint: "UI sans",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    href: gf("Inter"),
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    hint: "UI sans",
    stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    href: gf("IBM Plex Sans"),
  },
];

export const THEMES: ThemeDef[] = [
  {
    id: "hermes",
    name: "Hermes",
    hint: "Default",
    vars: {
      bg: "#0c0c0e",
      surface: "#161618",
      elevated: "#1c1c1f",
      panel: "#222226",
      fg: "#f4f4f5",
      muted: "#8b8b93",
      subtle: "#63636b",
      line: "#2a2a2e",
      accent: "#3dd6c6",
      accentDim: "#163834",
      accentFg: "#04221e",
      send: "#f4f4f5",
      sendFg: "#0c0c0e",
      danger: "#e0706a",
      me: "#1b3d38",
      them: "#1c1c1f",
      scheme: "dark",
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    hint: "VS Code favorite",
    vars: {
      bg: "#1a1b26",
      surface: "#16161e",
      elevated: "#1f2335",
      panel: "#24283b",
      fg: "#c0caf5",
      muted: "#a9b1d6",
      subtle: "#565f89",
      line: "#3b4261",
      accent: "#7aa2f7",
      accentDim: "#1f2a4a",
      accentFg: "#1a1b26",
      send: "#c0caf5",
      sendFg: "#1a1b26",
      danger: "#f7768e",
      me: "#283457",
      them: "#24283b",
      scheme: "dark",
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    hint: "Warm dark",
    vars: {
      bg: "#282828",
      surface: "#1d2021",
      elevated: "#3c3836",
      panel: "#32302f",
      fg: "#ebdbb2",
      muted: "#a89984",
      subtle: "#928374",
      line: "#504945",
      accent: "#fe8019",
      accentDim: "#3d2f1f",
      accentFg: "#1d2021",
      send: "#ebdbb2",
      sendFg: "#282828",
      danger: "#fb4934",
      me: "#3d4a2f",
      them: "#3c3836",
      scheme: "dark",
    },
  },
  {
    id: "gruvbox-light",
    name: "Gruvbox Light",
    hint: "Warm paper",
    vars: {
      bg: "#fbf1c7",
      surface: "#f9f5d7",
      elevated: "#ebdbb2",
      panel: "#d5c4a1",
      fg: "#3c3836",
      muted: "#7c6f64",
      subtle: "#928374",
      line: "#d5c4a1",
      accent: "#af3a03",
      accentDim: "#f2e5bc",
      accentFg: "#fbf1c7",
      send: "#3c3836",
      sendFg: "#fbf1c7",
      danger: "#9d0006",
      me: "#d8e3c5",
      them: "#ebdbb2",
      scheme: "light",
    },
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    hint: "Pastel dark",
    vars: {
      bg: "#1e1e2e",
      surface: "#181825",
      elevated: "#313244",
      panel: "#45475a",
      fg: "#cdd6f4",
      muted: "#a6adc8",
      subtle: "#6c7086",
      line: "#45475a",
      accent: "#89b4fa",
      accentDim: "#243244",
      accentFg: "#1e1e2e",
      send: "#cdd6f4",
      sendFg: "#1e1e2e",
      danger: "#f38ba8",
      me: "#1e3350",
      them: "#313244",
      scheme: "dark",
    },
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    hint: "Pastel light",
    vars: {
      bg: "#eff1f5",
      surface: "#e6e9ef",
      elevated: "#dce0e8",
      panel: "#ccd0da",
      fg: "#4c4f69",
      muted: "#6c6f85",
      subtle: "#8c8fa1",
      line: "#bcc0cc",
      accent: "#1e66f5",
      accentDim: "#d6e3fb",
      accentFg: "#eff1f5",
      send: "#4c4f69",
      sendFg: "#eff1f5",
      danger: "#d20f39",
      me: "#cce0ff",
      them: "#e6e9ef",
      scheme: "light",
    },
  },
  {
    id: "nord",
    name: "Nord",
    hint: "Arctic",
    vars: {
      bg: "#2e3440",
      surface: "#3b4252",
      elevated: "#434c5e",
      panel: "#4c566a",
      fg: "#eceff4",
      muted: "#d8dee9",
      subtle: "#81a1c1",
      line: "#4c566a",
      accent: "#88c0d0",
      accentDim: "#2e4248",
      accentFg: "#2e3440",
      send: "#eceff4",
      sendFg: "#2e3440",
      danger: "#bf616a",
      me: "#3e4e55",
      them: "#3b4252",
      scheme: "dark",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    hint: "Purple night",
    vars: {
      bg: "#282a36",
      surface: "#21222c",
      elevated: "#343746",
      panel: "#44475a",
      fg: "#f8f8f2",
      muted: "#bd93f9",
      subtle: "#6272a4",
      line: "#44475a",
      accent: "#bd93f9",
      accentDim: "#3b2f52",
      accentFg: "#282a36",
      send: "#f8f8f2",
      sendFg: "#282a36",
      danger: "#ff5555",
      me: "#3d3258",
      them: "#343746",
      scheme: "dark",
    },
  },
  {
    id: "one-dark",
    name: "One Dark",
    hint: "Atom",
    vars: {
      bg: "#282c34",
      surface: "#21252b",
      elevated: "#2c313a",
      panel: "#3e4451",
      fg: "#abb2bf",
      muted: "#828997",
      subtle: "#5c6370",
      line: "#3e4451",
      accent: "#61afef",
      accentDim: "#1e3344",
      accentFg: "#282c34",
      send: "#abb2bf",
      sendFg: "#282c34",
      danger: "#e06c75",
      me: "#1f3a4d",
      them: "#2c313a",
      scheme: "dark",
    },
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    hint: "Ethan Schoonover",
    vars: {
      bg: "#002b36",
      surface: "#073642",
      elevated: "#0a4452",
      panel: "#0d5161",
      fg: "#93a1a1",
      muted: "#839496",
      subtle: "#586e75",
      line: "#0a4452",
      accent: "#2aa198",
      accentDim: "#073f3d",
      accentFg: "#002b36",
      send: "#eee8d5",
      sendFg: "#002b36",
      danger: "#dc322f",
      me: "#0a4a4a",
      them: "#073642",
      scheme: "dark",
    },
  },
  {
    id: "solarized-light",
    name: "Solarized Light",
    hint: "Cream terminal",
    vars: {
      bg: "#fdf6e3",
      surface: "#eee8d5",
      elevated: "#e7dec7",
      panel: "#e0d6bd",
      fg: "#657b83",
      muted: "#93a1a1",
      subtle: "#839496",
      line: "#e0d6bd",
      accent: "#268bd2",
      accentDim: "#d9eaf4",
      accentFg: "#fdf6e3",
      send: "#073642",
      sendFg: "#fdf6e3",
      danger: "#dc322f",
      me: "#d6ead8",
      them: "#eee8d5",
      scheme: "light",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    hint: "Sublime",
    vars: {
      bg: "#272822",
      surface: "#1e1f1c",
      elevated: "#3e3d32",
      panel: "#49483e",
      fg: "#f8f8f2",
      muted: "#cfcfc2",
      subtle: "#75715e",
      line: "#3e3d32",
      accent: "#a6e22e",
      accentDim: "#2d3a1c",
      accentFg: "#272822",
      send: "#f8f8f2",
      sendFg: "#272822",
      danger: "#f92672",
      me: "#3a4228",
      them: "#3e3d32",
      scheme: "dark",
    },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    hint: "Sarah Drasner",
    vars: {
      bg: "#011627",
      surface: "#0b253a",
      elevated: "#1d3b53",
      panel: "#1d3b53",
      fg: "#d6deeb",
      muted: "#7e8e9e",
      subtle: "#5f7e97",
      line: "#1d3b53",
      accent: "#82aaff",
      accentDim: "#0d2a4a",
      accentFg: "#011627",
      send: "#d6deeb",
      sendFg: "#011627",
      danger: "#ef5350",
      me: "#0e3355",
      them: "#0b253a",
      scheme: "dark",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    hint: "Soft dusk",
    vars: {
      bg: "#191724",
      surface: "#1f1d2e",
      elevated: "#26233a",
      panel: "#403d52",
      fg: "#e0def4",
      muted: "#908caa",
      subtle: "#6e6a86",
      line: "#26233a",
      accent: "#c4a7e7",
      accentDim: "#2a2438",
      accentFg: "#191724",
      send: "#e0def4",
      sendFg: "#191724",
      danger: "#eb6f92",
      me: "#322c44",
      them: "#1f1d2e",
      scheme: "dark",
    },
  },
  {
    id: "everforest",
    name: "Everforest",
    hint: "Green woods",
    vars: {
      bg: "#2d353b",
      surface: "#232a2e",
      elevated: "#3d484d",
      panel: "#4a555b",
      fg: "#d3c6aa",
      muted: "#9da9a0",
      subtle: "#7a8478",
      line: "#3d484d",
      accent: "#a7c080",
      accentDim: "#333f2c",
      accentFg: "#2d353b",
      send: "#d3c6aa",
      sendFg: "#2d353b",
      danger: "#e67e80",
      me: "#3a4a34",
      them: "#3d484d",
      scheme: "dark",
    },
  },
];

export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getFont(id: string) {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

export const THEME_CSS_VARS: { key: keyof Omit<ThemeVars, "scheme">; css: string }[] = [
  { key: "bg", css: "--color-bg" },
  { key: "surface", css: "--color-surface" },
  { key: "elevated", css: "--color-elevated" },
  { key: "panel", css: "--color-panel" },
  { key: "fg", css: "--color-fg" },
  { key: "muted", css: "--color-muted" },
  { key: "subtle", css: "--color-subtle" },
  { key: "line", css: "--color-line" },
  { key: "accent", css: "--color-accent" },
  { key: "accentDim", css: "--color-accent-dim" },
  { key: "accentFg", css: "--color-accent-fg" },
  { key: "send", css: "--color-send" },
  { key: "sendFg", css: "--color-send-fg" },
  { key: "danger", css: "--color-danger" },
  { key: "me", css: "--color-me" },
  { key: "them", css: "--color-them" },
];
