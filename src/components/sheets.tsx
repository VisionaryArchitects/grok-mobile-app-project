import { type ReactNode, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { vtsStatus } from "@/lib/chat-api";
import { PLUGINS, type PluginId } from "@/lib/plugins";
import { PROVIDERS, getProvider, type ProviderId } from "@/lib/providers";
import { SKILL_CREATOR_ID } from "@/lib/skills-catalog";
import { useMessenger } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SkillsSheet({
  chatId,
  onCreate,
  onClose,
}: {
  chatId: string;
  onCreate: () => void;
  onClose: () => void;
}) {
  const skills = useMessenger((s) => s.skills);
  const chat = useMessenger((s) => s.chats.find((c) => c.id === chatId));
  const toggleSkill = useMessenger((s) => s.toggleSkill);
  if (!chat) return null;

  return (
    <SheetFrame title="Skills" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">
        Attached skills ride with every send, on every provider. Skill Creator stays one tap away.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mb-4 flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-fg"
      >
        Create a custom skill
      </button>
      <ul className="space-y-2">
        {skills.map((sk) => {
          const on = chat.skillIds.includes(sk.id);
          const locked = sk.id === SKILL_CREATOR_ID && on;
          return (
            <li key={sk.id}>
              <button
                type="button"
                onClick={() => {
                  if (!locked) toggleSkill(chatId, sk.id);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ring-1",
                  on ? "bg-accent-dim ring-accent/40" : "bg-elevated ring-line",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                    on ? "bg-accent text-accent-fg" : "bg-panel text-muted",
                  )}
                >
                  {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{sk.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{sk.trigger}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SheetFrame>
  );
}

export function ConnectorsSheet({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const chat = useMessenger((s) => s.chats.find((c) => c.id === chatId));
  const keys = useMessenger((s) => s.keys);
  const setChatModel = useMessenger((s) => s.setChatModel);
  const togglePlugin = useMessenger((s) => s.togglePlugin);
  const [vts, setVts] = useState<"checking" | "live" | "down">("checking");
  useEffect(() => {
    let gone = false;
    void vtsStatus().then((r) => {
      if (!gone) setVts(r.ok ? "live" : "down");
    });
    return () => {
      gone = true;
    };
  }, []);
  if (!chat) return null;

  function ready(id: ProviderId) {
    const p = getProvider(id);
    if (p.readyByDefault) return true;
    if (p.keyField === "openai") return Boolean(keys.openai);
    if (p.keyField === "anthropic") return Boolean(keys.anthropic);
    if (p.keyField === "ollama") return Boolean(keys.ollama);
    return false;
  }

  return (
    <SheetFrame title="Plugins" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">
        Same as connectors in Grok or ChatGPT. VTS rides with every model. Toggle a plugin, then
        send.
      </p>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-elevated px-3 py-2.5 ring-1 ring-line">
        <span>
          <span className="block text-sm font-medium">VTS laptop</span>
          <span className="text-[11px] text-muted">BALLER-RAZER · 96 MCP tools</span>
        </span>
        <span className={cn("text-[11px] font-semibold", vts === "live" ? "text-accent" : "text-muted")}>
          {vts === "checking" ? "Checking" : vts === "live" ? "Live" : "Proxy down"}
        </span>
      </div>
      <ul className="mb-6 space-y-2">
        {PLUGINS.map((p) => {
          const on = chat.pluginIds.includes(p.id as PluginId);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => togglePlugin(chatId, p.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ring-1",
                  on ? "bg-accent-dim ring-accent/40" : "bg-elevated ring-line",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                    on ? "bg-accent text-accent-fg" : "bg-panel text-muted",
                  )}
                >
                  {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{p.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{p.blurb}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">Model</h3>
      <ul className="space-y-2">
        {PROVIDERS.map((p) => {
          const on = chat.providerId === p.id;
          const live = ready(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setChatModel(chatId, p.id, p.defaultModel);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ring-1",
                  on ? "bg-accent-dim ring-accent/40" : "bg-elevated ring-line",
                )}
              >
                <span className="grid size-10 place-items-center rounded-full bg-panel text-sm font-semibold">
                  {p.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{p.name}</span>
                  <span className="block text-xs text-muted">{p.blurb}</span>
                </span>
                <span className={cn("text-[11px] font-medium", live ? "text-accent" : "text-subtle")}>
                  {live ? "Live" : "Key"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SheetFrame>
  );
}

export function ModelSheet({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const chat = useMessenger((s) => s.chats.find((c) => c.id === chatId));
  const setChatModel = useMessenger((s) => s.setChatModel);
  if (!chat) return null;
  const provider = getProvider(chat.providerId);

  return (
    <SheetFrame title={provider.name} onClose={onClose}>
      <ul className="space-y-2">
        {provider.models.map((m) => {
          const on = chat.modelId === m.id;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setChatModel(chatId, chat.providerId, m.id);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-3 ring-1",
                  on ? "bg-accent-dim ring-accent/40" : "bg-elevated ring-line",
                )}
              >
                <span>
                  <span className="block text-sm font-medium text-fg">{m.label}</span>
                  {m.hint ? <span className="text-xs text-muted">{m.hint}</span> : null}
                </span>
                {on ? <Check className="size-4 text-accent" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </SheetFrame>
  );
}

function SheetFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-bg/70" onClick={onClose}>
      <div
        className="max-h-[82%] overflow-y-auto rounded-t-2xl bg-surface px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 ring-1 ring-line"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full text-muted"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
