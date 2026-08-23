import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, MoreHorizontal } from "lucide-react";
import { Composer } from "@/components/composer";
import { MarkdownLite } from "@/components/markdown-lite";
import { ProviderAvatar } from "@/components/provider-avatar";
import { ConnectorsSheet, ModelSheet, SkillsSheet } from "@/components/sheets";
import { SkillCreator } from "@/components/skill-creator";
import { getModelLabel, getProvider } from "@/lib/providers";
import { dispatchSend } from "@/lib/send";
import { useMessenger, type Attachment, type ChatMessage } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

export function ThreadView({ chatId }: { chatId: string }) {
  const navigate = useNavigate();
  const chat = useMessenger((s) => s.chats.find((c) => c.id === chatId));
  const messages = useMessenger((s) => s.messages[chatId] ?? []);
  const sending = useMessenger((s) => Boolean(s.sending[chatId]));
  const setBotMode = useMessenger((s) => s.setBotMode);
  const clearChat = useMessenger((s) => s.clearChat);
  const deleteChat = useMessenger((s) => s.deleteChat);
  const [sheet, setSheet] = useState<"skills" | "connectors" | "model" | "create" | "more" | null>(
    null,
  );
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  if (!chat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="text-sm text-muted">This chat is gone.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="h-11 rounded-full bg-elevated px-4 text-sm font-medium"
        >
          Back to chats
        </button>
      </div>
    );
  }

  const provider = getProvider(chat.providerId);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-bg">
      <header className="flex items-center gap-1 border-b border-line px-1 py-1.5">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="grid size-11 place-items-center rounded-full text-fg"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <ProviderAvatar providerId={chat.providerId} botMode={chat.botMode} size="sm" />
        <button
          type="button"
          onClick={() => setSheet("model")}
          className="min-w-0 flex-1 px-2 text-left"
        >
          <div className="flex items-center gap-1">
            <span className="truncate text-[16px] font-semibold tracking-tight">{chat.title}</span>
            <ChevronDown className="size-4 text-muted" />
          </div>
          <span className="block truncate text-[11px] text-muted">
            {provider.short} · {getModelLabel(chat.providerId, chat.modelId)}
            {chat.botMode ? " · Bot Mode" : ""}
            {chat.pluginIds.includes("vts") ? " · VTS" : ""}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setBotMode(chat.id, !chat.botMode)}
          className={cn(
            "h-8 rounded-full px-3 text-[11px] font-semibold",
            chat.botMode ? "bg-accent text-accent-fg" : "bg-elevated text-muted ring-1 ring-line",
          )}
        >
          Bot
        </button>
        <button
          type="button"
          onClick={() => setSheet(sheet === "more" ? null : "more")}
          className="grid size-11 place-items-center rounded-full text-fg"
          aria-label="More"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <EmptyThread title={chat.title} botMode={chat.botMode} />
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {sending ? <Typing /> : null}
          </div>
        )}
      </div>

      <Composer
        disabled={sending}
        onSend={(text, atts) => void dispatchSend(chat.id, text, atts)}
        onCreateSkill={() => setSheet("create")}
        onSkills={() => setSheet("skills")}
        onConnectors={() => setSheet("connectors")}
      />

      {sheet === "create" ? (
        <SkillCreator chatId={chat.id} onClose={() => setSheet(null)} />
      ) : null}
      {sheet === "skills" ? (
        <SkillsSheet
          chatId={chat.id}
          onCreate={() => setSheet("create")}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === "connectors" ? (
        <ConnectorsSheet chatId={chat.id} onClose={() => setSheet(null)} />
      ) : null}
      {sheet === "model" ? <ModelSheet chatId={chat.id} onClose={() => setSheet(null)} /> : null}
      {sheet === "more" ? (
        <div className="absolute right-3 top-14 z-30 w-48 overflow-hidden rounded-2xl bg-elevated py-1 ring-1 ring-line">
          <MoreBtn
            label={chat.botMode ? "Turn Bot Mode off" : "Turn Bot Mode on"}
            onClick={() => {
              setBotMode(chat.id, !chat.botMode);
              setSheet(null);
            }}
          />
          <MoreBtn
            label="Clear messages"
            onClick={() => {
              clearChat(chat.id);
              setSheet(null);
            }}
          />
          <MoreBtn
            label="Delete chat"
            danger
            onClick={() => {
              deleteChat(chat.id);
              setSheet(null);
              void navigate({ to: "/" });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MoreBtn({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 w-full items-center px-4 text-left text-sm",
        danger ? "text-danger" : "text-fg",
      )}
    >
      {label}
    </button>
  );
}

function EmptyThread({ title, botMode }: { title: string; botMode: boolean }) {
  return (
    <div className="mx-auto max-w-[280px] pt-16 text-center">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {botMode
          ? "Bot Mode is on. Skills are attached. Tap + to create another skill, then send the job."
          : "Send a message. Tap + for camera, files, skills, plugins, or Create skill. VTS is already on."}
      </p>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-them px-4 py-3 ring-1 ring-line">
        <span className="flex gap-1">
          <i className="size-1.5 animate-pulse rounded-full bg-muted" />
          <i className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:120ms]" />
          <i className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:240ms]" />
        </span>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const mine = msg.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5",
          mine
            ? "rounded-br-md bg-me text-fg"
            : msg.error
              ? "rounded-bl-md bg-them ring-1 ring-danger/40"
              : "rounded-bl-md bg-them ring-1 ring-line",
        )}
      >
        {msg.attachments?.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {msg.attachments.map((a: Attachment) =>
              a.kind === "image" ? (
                <img
                  key={a.id}
                  src={a.dataUrl}
                  alt={a.name}
                  className="max-h-40 rounded-lg object-cover"
                />
              ) : (
                <span key={a.id} className="text-xs text-muted">
                  {a.name}
                </span>
              ),
            )}
          </div>
        ) : null}
        {mine ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
        ) : (
          <MarkdownLite text={msg.content} />
        )}
        {msg.toolRuns?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {msg.toolRuns.map((run, i) => (
              <span
                key={`${run.name}-${i}`}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  run.ok ? "bg-accent-dim text-accent" : "bg-panel text-danger",
                )}
              >
                {run.name}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-subtle">{formatClock(msg.createdAt)}</span>
          {msg.routedVia === "grok-relay" ? (
            <span className="text-[10px] text-accent">Hermes via Grok</span>
          ) : null}
          {msg.error === "needs-key" ? (
            <span className="text-[10px] text-danger">Needs a key</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
