import { cn } from "@/lib/utils";
import { getProvider, type ProviderId } from "@/lib/providers";

const TONE: Record<ProviderId, string> = {
  hermes: "bg-accent-dim text-accent",
  grok: "bg-elevated text-fg",
  claude: "bg-panel text-fg",
  openai: "bg-panel text-fg",
  "ollama-local": "bg-elevated text-muted",
  "ollama-cloud": "bg-elevated text-muted",
};

export function ProviderAvatar({
  providerId,
  botMode,
  size = "md",
}: {
  providerId: ProviderId;
  botMode?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const p = getProvider(providerId);
  const dim = size === "sm" ? "size-10 text-sm" : size === "lg" ? "size-14 text-lg" : "size-12 text-base";
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "grid place-items-center rounded-full font-semibold tracking-tight",
          dim,
          TONE[providerId],
        )}
      >
        {p.initial}
      </div>
      {botMode ? (
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-bg bg-accent" />
      ) : null}
    </div>
  );
}
