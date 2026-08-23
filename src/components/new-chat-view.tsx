import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PROVIDERS } from "@/lib/providers";
import { useMessenger } from "@/lib/store";
import { BottomNav } from "@/components/bottom-nav";
import { ProviderAvatar } from "@/components/provider-avatar";

export function NewChatView() {
  const navigate = useNavigate();
  const createChat = useMessenger((s) => s.createChat);

  function open(providerId: (typeof PROVIDERS)[number]["id"], botMode = false) {
    const id = createChat({ providerId, botMode });
    void navigate({ to: "/c/$chatId", params: { chatId: id } });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="flex items-center gap-1 px-1 pt-2 pb-1">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="grid size-11 place-items-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-[20px] font-semibold tracking-tight">New chat</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="mb-4 text-sm text-muted">Pick a brain. You can switch later from the header or + Connectors.</p>
        <ul className="space-y-2">
          {PROVIDERS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => open(p.id, false)}
                className="flex w-full items-center gap-3 rounded-2xl bg-elevated px-3 py-3 text-left ring-1 ring-line"
              >
                <ProviderAvatar providerId={p.id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium">{p.name}</span>
                  <span className="block text-xs text-muted">{p.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => open("hermes", true)}
          className="mt-4 h-12 w-full rounded-2xl bg-accent text-sm font-semibold text-accent-fg"
        >
          Open Hermes Bot Mode
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
