import { create } from "zustand";
import { getFont, getTheme, type ThemeId } from "@/lib/look";
import { DEFAULT_PLUGIN_IDS, normalizePluginIds, type PluginId } from "@/lib/plugins";
import { BUILTIN_SKILLS, SKILL_CREATOR_ID, type Skill } from "@/lib/skills-catalog";
import { getProvider, type ProviderId } from "@/lib/providers";
import { uid } from "@/lib/utils";

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  dataUrl: string;
  kind: "image" | "file";
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  routedVia?: string;
  error?: string;
  toolRuns?: { name: string; ok: boolean; detail: string }[];
};

export type Chat = {
  id: string;
  title: string;
  providerId: ProviderId;
  modelId: string;
  botMode: boolean;
  skillIds: string[];
  pluginIds: PluginId[];
  updatedAt: number;
  pinned?: boolean;
  preview: string;
};

export type Keys = {
  openai: string;
  anthropic: string;
  ollama: string;
  ollamaHost: string;
  vtsHost: string;
  githubToken: string;
};

type PersistShape = {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  skills: Skill[];
  keys: Keys;
  themeId: ThemeId;
  fontId: string;
};

const STORAGE_KEY = "hermes.messenger.v1";

const SEED_AT = Date.UTC(2026, 7, 23, 17, 0, 0);

function seedChats(): PersistShape {
  const welcome = (id: string, text: string): ChatMessage => ({
    id,
    role: "assistant",
    content: text,
    createdAt: SEED_AT,
  });

  const chats: Chat[] = [
    {
      id: "hermes",
      title: "Hermes",
      providerId: "hermes",
      modelId: "hermes3:8b",
      botMode: false,
      skillIds: [SKILL_CREATOR_ID, "visionary-house"],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT,
      pinned: true,
      preview: "Ready. Bot Mode is one tap away.",
    },
    {
      id: "hermes-bot",
      title: "Hermes Bot Mode",
      providerId: "hermes",
      modelId: "hermes3:8b",
      botMode: true,
      skillIds: [SKILL_CREATOR_ID, "bot-playbook", "visionary-house"],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT - 60_000,
      pinned: true,
      preview: "Agent loop with skills. Create a skill in +.",
    },
    {
      id: "grok",
      title: "Grok",
      providerId: "grok",
      modelId: "grok-4.5",
      botMode: false,
      skillIds: [SKILL_CREATOR_ID],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT - 120_000,
      preview: "Live on Grok 4.5.",
    },
    {
      id: "claude",
      title: "Claude",
      providerId: "claude",
      modelId: "claude-sonnet-4-5",
      botMode: false,
      skillIds: [SKILL_CREATOR_ID],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT - 180_000,
      preview: "Add an Anthropic key in Settings.",
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      providerId: "openai",
      modelId: "gpt-4.1",
      botMode: false,
      skillIds: [SKILL_CREATOR_ID],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT - 240_000,
      preview: "Add an OpenAI key in Settings.",
    },
    {
      id: "ollama-cloud",
      title: "Ollama Cloud",
      providerId: "ollama-cloud",
      modelId: "glm-5.2:cloud",
      botMode: false,
      skillIds: [SKILL_CREATOR_ID],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: SEED_AT - 300_000,
      preview: "Cloud Pro · add your Ollama key.",
    },
  ];

  const messages: Record<string, ChatMessage[]> = {
    hermes: [
      welcome(
        "m-hermes",
        "Hermes online. VTS plugins are on — laptop MCP, GitHub, web, and browser. Flip Bot Mode in the header, or tap + for skills and connectors.",
      ),
    ],
    "hermes-bot": [
      welcome(
        "m-hermes-bot",
        "Bot Mode is on. Skills are attached. Tap + → Create skill anytime — Skill Creator is one tap from every composer. Tell me the job and I will run it as an agent loop.",
      ),
    ],
    grok: [
      welcome(
        "m-grok",
        "Grok 4.5 is connected. Ask anything, attach a photo from +, or switch models from the header.",
      ),
    ],
    claude: [
      welcome(
        "m-claude",
        "Claude is ready as soon as you paste an Anthropic API key in Settings. Skills still attach here so the thread is waiting.",
      ),
    ],
    chatgpt: [
      welcome(
        "m-chatgpt",
        "ChatGPT is ready as soon as you paste an OpenAI API key in Settings.",
      ),
    ],
    "ollama-cloud": [
      welcome(
        "m-ollama",
        "Ollama Cloud Pro models (GLM, Kimi, DeepSeek, Gemma) light up when you add your Ollama API key in Settings.",
      ),
    ],
  };

  return {
    chats,
    messages,
    skills: BUILTIN_SKILLS,
    keys: {
      openai: "",
      anthropic: "",
      ollama: "",
      ollamaHost: "",
      vtsHost: "",
      githubToken: "",
    },
    themeId: "hermes",
    fontId: "outfit",
  };
}

function loadPersist(): PersistShape {
  if (typeof window === "undefined") return seedChats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedChats();
    const parsed = JSON.parse(raw) as PersistShape;
    const builtins = BUILTIN_SKILLS;
    const custom = (parsed.skills ?? []).filter((s) => !s.builtin);
    return {
      chats: (parsed.chats?.length ? parsed.chats : seedChats().chats).map((c) => ({
        ...c,
        pluginIds: normalizePluginIds(c.pluginIds),
      })),
      messages: parsed.messages ?? {},
      skills: [...builtins, ...custom],
      keys: { ...seedChats().keys, ...parsed.keys },
      themeId: getTheme(parsed.themeId ?? "hermes").id,
      fontId: getFont(parsed.fontId ?? "outfit").id,
    };
  } catch {
    return seedChats();
  }
}

type State = PersistShape & {
  hydrated: boolean;
  sending: Record<string, boolean>;
  hydrate: () => void;
  persist: () => void;
  setKeys: (patch: Partial<Keys>) => void;
  setTheme: (id: ThemeId) => void;
  setFont: (id: string) => void;
  createChat: (opts: { providerId: ProviderId; modelId?: string; botMode?: boolean }) => string;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  setChatModel: (id: string, providerId: ProviderId, modelId: string) => void;
  setBotMode: (id: string, botMode: boolean) => void;
  toggleSkill: (chatId: string, skillId: string) => void;
  togglePlugin: (chatId: string, pluginId: PluginId) => void;
  addSkill: (skill: Omit<Skill, "id" | "createdAt" | "builtin">, attachToChatId?: string) => string;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  appendMessage: (chatId: string, msg: ChatMessage) => void;
  patchMessage: (chatId: string, msgId: string, patch: Partial<ChatMessage>) => void;
  setSending: (chatId: string, value: boolean) => void;
  clearChat: (chatId: string) => void;
};

function snapshot(s: State): PersistShape {
  return {
    chats: s.chats,
    messages: s.messages,
    skills: s.skills,
    keys: s.keys,
    themeId: s.themeId,
    fontId: s.fontId,
  };
}

export const useMessenger = create<State>((set, get) => ({
  ...seedChats(),
  hydrated: false,
  sending: {},
  hydrate: () => {
    const data = loadPersist();
    set({ ...data, hydrated: true });
  },
  persist: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot(get())));
    } catch {
      /* quota */
    }
  },
  setKeys: (patch) => {
    set((s) => ({ keys: { ...s.keys, ...patch } }));
    get().persist();
  },
  setTheme: (id) => {
    set({ themeId: getTheme(id).id });
    get().persist();
  },
  setFont: (id) => {
    set({ fontId: getFont(id).id });
    get().persist();
  },
  createChat: ({ providerId, modelId, botMode }) => {
    const p = getProvider(providerId);
    const id = uid("c");
    const chat: Chat = {
      id,
      title: botMode ? `${p.name} Bot Mode` : `New ${p.name}`,
      providerId,
      modelId: modelId ?? p.defaultModel,
      botMode: Boolean(botMode),
      skillIds: botMode
        ? [SKILL_CREATOR_ID, "bot-playbook"]
        : [SKILL_CREATOR_ID],
      pluginIds: [...DEFAULT_PLUGIN_IDS],
      updatedAt: Date.now(),
      preview: "New chat",
    };
    set((s) => ({
      chats: [chat, ...s.chats],
      messages: { ...s.messages, [id]: [] },
    }));
    get().persist();
    return id;
  },
  renameChat: (id, title) => {
    set((s) => ({
      chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
    get().persist();
  },
  deleteChat: (id) => {
    set((s) => {
      const next = { ...s.messages };
      delete next[id];
      return { chats: s.chats.filter((c) => c.id !== id), messages: next };
    });
    get().persist();
  },
  setChatModel: (id, providerId, modelId) => {
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === id ? { ...c, providerId, modelId, updatedAt: Date.now() } : c,
      ),
    }));
    get().persist();
  },
  setBotMode: (id, botMode) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== id) return c;
        const skillIds = botMode
          ? Array.from(new Set([...c.skillIds, SKILL_CREATOR_ID, "bot-playbook"]))
          : c.skillIds;
        return { ...c, botMode, skillIds, updatedAt: Date.now() };
      }),
    }));
    get().persist();
  },
  toggleSkill: (chatId, skillId) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c;
        const has = c.skillIds.includes(skillId);
        const skillIds = has
          ? c.skillIds.filter((id) => id !== skillId)
          : [...c.skillIds, skillId];
        return { ...c, skillIds };
      }),
    }));
    get().persist();
  },
  togglePlugin: (chatId, pluginId) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c;
        const has = c.pluginIds.includes(pluginId);
        const pluginIds = has
          ? c.pluginIds.filter((id) => id !== pluginId)
          : [...c.pluginIds, pluginId];
        return { ...c, pluginIds: pluginIds.length ? pluginIds : [...DEFAULT_PLUGIN_IDS] };
      }),
    }));
    get().persist();
  },
  addSkill: (skill, attachToChatId) => {
    const id = uid("sk");
    const next: Skill = {
      ...skill,
      id,
      builtin: false,
      createdAt: Date.now(),
    };
    set((s) => ({
      skills: [...s.skills, next],
      chats: attachToChatId
        ? s.chats.map((c) =>
            c.id === attachToChatId
              ? { ...c, skillIds: Array.from(new Set([...c.skillIds, id])) }
              : c,
          )
        : s.chats,
    }));
    get().persist();
    return id;
  },
  updateSkill: (id, patch) => {
    set((s) => ({
      skills: s.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk)),
    }));
    get().persist();
  },
  deleteSkill: (id) => {
    set((s) => ({
      skills: s.skills.filter((sk) => sk.id !== id || sk.builtin),
      chats: s.chats.map((c) => ({
        ...c,
        skillIds: c.skillIds.filter((sid) => sid !== id),
      })),
    }));
    get().persist();
  },
  appendMessage: (chatId, msg) => {
    set((s) => {
      const list = s.messages[chatId] ?? [];
      const preview =
        msg.role === "assistant" || msg.role === "user"
          ? msg.content.slice(0, 80)
          : s.chats.find((c) => c.id === chatId)?.preview ?? "";
      return {
        messages: { ...s.messages, [chatId]: [...list, msg] },
        chats: s.chats
          .map((c) =>
            c.id === chatId ? { ...c, updatedAt: Date.now(), preview } : c,
          )
          .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
      };
    });
    get().persist();
  },
  patchMessage: (chatId, msgId, patch) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] ?? []).map((m) =>
          m.id === msgId ? { ...m, ...patch } : m,
        ),
      },
    }));
    get().persist();
  },
  setSending: (chatId, value) => {
    set((s) => ({ sending: { ...s.sending, [chatId]: value } }));
  },
  clearChat: (chatId) => {
    set((s) => ({
      messages: { ...s.messages, [chatId]: [] },
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, preview: "Cleared", updatedAt: Date.now() } : c,
      ),
    }));
    get().persist();
  },
}));
