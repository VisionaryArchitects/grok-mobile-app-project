import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Palette, Pencil, Search } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { ProviderAvatar } from "@/components/provider-avatar";
import { getModelLabel } from "@/lib/providers";
import { useMessenger } from "@/lib/store";
import { formatDay } from "@/lib/utils";

export function InboxView() {
  const navigate = useNavigate();
  const chats = useMessenger((s) => s.chats);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = [...chats].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
    );
    if (!term) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.preview.toLowerCase().includes(term) ||
        c.providerId.includes(term),
    );
  }, [chats, q]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold tracking-tight">Hermes</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/themes" })}
              className="grid size-11 place-items-center rounded-full bg-elevated text-fg"
              aria-label="Themes"
            >
              <Palette className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/new" })}
              className="grid size-11 place-items-center rounded-full bg-elevated text-fg"
              aria-label="New chat"
            >
              <Pencil className="size-5" />
            </button>
          </div>
        </div>
        <label className="mt-3 flex h-11 items-center gap-2 rounded-full bg-elevated px-3 ring-1 ring-line">
          <Search className="size-4 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-full w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
          />
        </label>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted">No chats match that search.</p>
        ) : (
          <ul>
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/c/$chatId", params: { chatId: c.id } })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <ProviderAvatar providerId={c.providerId} botMode={c.botMode} />
                  <span className="min-w-0 flex-1 border-b border-line pb-3">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[16px] font-medium">{c.title}</span>
                      <span className="shrink-0 text-[11px] text-subtle">{formatDay(c.updatedAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">
                      {c.botMode ? "Bot · " : ""}
                      {getModelLabel(c.providerId, c.modelId)}
                      {" · "}
                      {c.preview}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
