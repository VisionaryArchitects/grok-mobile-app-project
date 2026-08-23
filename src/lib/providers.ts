export type ProviderId =
  | "hermes"
  | "grok"
  | "claude"
  | "openai"
  | "ollama-local"
  | "ollama-cloud";

export type KeyField = "openai" | "anthropic" | "ollama";

export type ModelDef = {
  id: string;
  label: string;
  hint?: string;
};

export type ProviderDef = {
  id: ProviderId;
  name: string;
  short: string;
  blurb: string;
  initial: string;
  readyByDefault: boolean;
  keyField?: KeyField;
  models: ModelDef[];
  defaultModel: string;
};

export const PROVIDERS: ProviderDef[] = [
  {
    id: "hermes",
    name: "Hermes",
    short: "Nous",
    blurb: "Custom-built for you. Hermes 3 plus Bot Mode.",
    initial: "H",
    readyByDefault: true,
    keyField: "ollama",
    defaultModel: "hermes3:8b",
    models: [
      { id: "hermes3:8b", label: "Hermes 3 8B", hint: "Local · relayed until Ollama is linked" },
    ],
  },
  {
    id: "grok",
    name: "Grok",
    short: "xAI",
    blurb: "xAI frontier. Live in this app.",
    initial: "G",
    readyByDefault: true,
    defaultModel: "grok-4.5",
    models: [
      { id: "grok-4.5", label: "Grok 4.5" },
      { id: "grok-4", label: "Grok 4" },
      { id: "grok-3", label: "Grok 3" },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    short: "Anthropic",
    blurb: "Paste an Anthropic key in Settings to go live.",
    initial: "C",
    readyByDefault: false,
    keyField: "anthropic",
    defaultModel: "claude-sonnet-4-5",
    models: [
      { id: "claude-sonnet-4-5", label: "Sonnet 4.5" },
      { id: "claude-opus-4-1", label: "Opus 4.1" },
      { id: "claude-haiku-4-5", label: "Haiku 4.5" },
    ],
  },
  {
    id: "openai",
    name: "ChatGPT",
    short: "OpenAI",
    blurb: "Paste an OpenAI key in Settings to go live.",
    initial: "O",
    readyByDefault: false,
    keyField: "openai",
    defaultModel: "gpt-4.1",
    models: [
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "o3", label: "o3" },
    ],
  },
  {
    id: "ollama-local",
    name: "Ollama Local",
    short: "RTX",
    blurb: "Your 4090 catalog. Link a reachable host or Cloud key.",
    initial: "L",
    readyByDefault: false,
    keyField: "ollama",
    defaultModel: "gemma4:latest",
    models: [
      { id: "hermes3:8b", label: "Hermes 3 8B" },
      { id: "gemma4:latest", label: "Gemma 4" },
      { id: "qwen3.5:9b", label: "Qwen 3.5 9B" },
      { id: "gpt-oss:20b", label: "GPT-OSS 20B" },
      { id: "mistral-small:24b", label: "Mistral Small 24B" },
      { id: "qwen2.5-coder:7b", label: "Qwen 2.5 Coder" },
    ],
  },
  {
    id: "ollama-cloud",
    name: "Ollama Cloud",
    short: "Pro",
    blurb: "Cloud Pro brains. Add your Ollama API key.",
    initial: "P",
    readyByDefault: false,
    keyField: "ollama",
    defaultModel: "glm-5.2:cloud",
    models: [
      { id: "glm-5.2:cloud", label: "GLM 5.2" },
      { id: "kimi-k3:cloud", label: "Kimi K3" },
      { id: "deepseek-v4-pro:cloud", label: "DeepSeek V4 Pro" },
      { id: "gemma4:cloud", label: "Gemma 4 Cloud" },
      { id: "minimax-m2.7:cloud", label: "MiniMax M2.7" },
      { id: "gpt-oss:120b-cloud", label: "GPT-OSS 120B" },
    ],
  },
];

export function getProvider(id: ProviderId) {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export function getModelLabel(providerId: ProviderId, modelId: string) {
  const p = getProvider(providerId);
  return p.models.find((m) => m.id === modelId)?.label ?? modelId;
}
