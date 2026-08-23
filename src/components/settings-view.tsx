import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { getFont, getTheme } from "@/lib/look";
import { PROVIDERS } from "@/lib/providers";
import { useMessenger } from "@/lib/store";

export function SettingsView() {
  const navigate = useNavigate();
  const keys = useMessenger((s) => s.keys);
  const setKeys = useMessenger((s) => s.setKeys);
  const theme = getTheme(useMessenger((s) => s.themeId));
  const font = getFont(useMessenger((s) => s.fontId));
  const [openai, setOpenai] = useState(keys.openai);
  const [anthropic, setAnthropic] = useState(keys.anthropic);
  const [ollama, setOllama] = useState(keys.ollama);
  const [host, setHost] = useState(keys.ollamaHost);
  const [vtsHost, setVtsHost] = useState(keys.vtsHost ?? "");
  const [githubToken, setGithubToken] = useState(keys.githubToken ?? "");
  const [saved, setSaved] = useState(false);

  function save() {
    setKeys({
      openai: openai.trim(),
      anthropic: anthropic.trim(),
      ollama: ollama.trim(),
      ollamaHost: host.trim(),
      vtsHost: vtsHost.trim(),
      githubToken: githubToken.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="px-4 pt-3 pb-2">
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Keys stay on this device. Grok is already live.</p>
      </header>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6">
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">Look</h2>
          <button
            type="button"
            onClick={() => navigate({ to: "/themes" })}
            className="flex w-full items-center justify-between rounded-2xl bg-elevated px-4 py-3 text-left ring-1 ring-line"
          >
            <span>
              <span className="block text-sm font-medium">Theme & font</span>
              <span className="text-xs text-muted">
                {theme.name} · {font.name}
              </span>
            </span>
            <span className="flex gap-1">
              {[theme.vars.bg, theme.vars.accent, theme.vars.fg].map((c) => (
                <span
                  key={c}
                  className="size-4 rounded-full ring-1 ring-line"
                  style={{ background: c }}
                />
              ))}
            </span>
          </button>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">Providers</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-elevated ring-1 ring-line">
            {PROVIDERS.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <span>
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted">{p.blurb}</span>
                </span>
                <span className="text-[11px] font-medium text-muted">{p.short}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">API keys</h2>
          <Field
            label="OpenAI"
            value={openai}
            onChange={setOpenai}
            placeholder="sk-..."
          />
          <Field
            label="Anthropic"
            value={anthropic}
            onChange={setAnthropic}
            placeholder="sk-ant-..."
          />
          <Field
            label="Ollama Cloud"
            value={ollama}
            onChange={setOllama}
            placeholder="Cloud API key"
          />
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">Ollama host (optional)</span>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="https://ollama.com"
              className="h-12 w-full rounded-xl bg-elevated px-3 text-[15px] text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">VTS host (optional)</span>
            <input
              value={vtsHost}
              onChange={(e) => setVtsHost(e.target.value)}
              placeholder="https://api.visionaryarchitects.dev"
              className="h-12 w-full rounded-xl bg-elevated px-3 text-[15px] text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
            />
          </label>
          <Field
            label="GitHub token (optional)"
            value={githubToken}
            onChange={setGithubToken}
            placeholder="ghp_…"
          />
          <button
            type="button"
            onClick={save}
            className="h-12 w-full rounded-xl bg-send text-sm font-semibold text-send-fg"
          >
            {saved ? "Saved" : "Save keys"}
          </button>
        </section>

        <section className="space-y-2 pb-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">About</h2>
          <p className="text-sm leading-relaxed text-muted">
            Hermes Messenger is an Android-first chat for Visionary Architects. VTS plugins are on
            for every model from the jump. Grok replies live. Claude, ChatGPT, and Ollama join when
            you paste a key. Create skill is inside every + menu.
          </p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl bg-elevated px-3 text-[15px] text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
      />
    </label>
  );
}
