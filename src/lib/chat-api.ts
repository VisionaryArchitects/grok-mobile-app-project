import { createServerFn } from "@tanstack/react-start";
import { executePluginTool, pingVts, type ToolRun } from "@/lib/plugin-runtime";
import { pluginSystemBlock, toolsForPlugins } from "@/lib/plugins";
import { skillSystemBlock, type Skill } from "@/lib/skills-catalog";
import type { ProviderId } from "@/lib/providers";

export type ChatTurn = {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
};

export type ChatRequest = {
  providerId: ProviderId;
  modelId: string;
  botMode: boolean;
  messages: ChatTurn[];
  skills: Skill[];
  pluginIds?: string[];
  keys?: {
    openai?: string;
    anthropic?: string;
    ollama?: string;
    ollamaHost?: string;
    vtsHost?: string;
    githubToken?: string;
  };
};

export type ChatResult =
  | { ok: true; text: string; routedVia: string; model: string; toolRuns?: ToolRun[] }
  | { ok: false; error: string; code?: "needs-key" | "unavailable" | "provider" };

const MAX_TOKENS = 1400;
const TOOL_ROUNDS = 4;

function hermesSystem(botMode: boolean) {
  const base = `You are Hermes, the Nous Research Hermes 3 assistant built for Visionary Architects. You are their personal messenger agent: direct, capable, and allergic to filler. Treat the user as a co-architect. Prefer working artifacts over plans. Plugins may be attached — use them for live laptop, GitHub, and web facts.`;
  if (!botMode) return base;
  return `${base}

BOT MODE IS ON. You are Hermes Agent in Bot Mode.
- Restate the goal in one line, then execute. Use plugins.
- Follow attached skills as operating procedures.
- If the work is a reusable workflow, end with a proposed Skill (Name / Trigger / Instructions) the user can save from the + menu.
- Ask a question only when you are blocked.`;
}

function grokSystem() {
  return `You are Grok, built by xAI, chatting inside Hermes Messenger — a personal Android-style app for Visionary Architects. Be useful, sharp, and concise. VTS plugins are attached; call tools for live facts, GitHub, and the laptop.`;
}

function genericSystem(name: string, botMode: boolean) {
  const base = `You are ${name} inside Hermes Messenger. VTS plugins are available on this thread. Call tools instead of guessing. Be direct.`;
  if (!botMode) return base;
  return `${base}\nBot Mode is on: act as an agent, follow attached skills, use plugins, propose new skills when a workflow repeats.`;
}

function composeSystem(req: ChatRequest) {
  const name =
    req.providerId === "hermes"
      ? "Hermes"
      : req.providerId === "grok"
        ? "Grok"
        : req.providerId === "claude"
          ? "Claude"
          : req.providerId === "openai"
            ? "ChatGPT"
            : "the selected model";
  const head =
    req.providerId === "hermes"
      ? hermesSystem(req.botMode)
      : req.providerId === "grok"
        ? grokSystem() + (req.botMode ? "\nBot Mode is on. Act as an agent and follow attached skills." : "")
        : genericSystem(name, req.botMode);
  const skills = skillSystemBlock(req.skills);
  const plugins = req.pluginIds?.length ? pluginSystemBlock(req.pluginIds) : "";
  return [head, plugins, skills].filter(Boolean).join("\n\n");
}

type OaiMsg = Record<string, unknown>;

function toOpenAiMessages(system: string, turns: ChatTurn[]): OaiMsg[] {
  const out: OaiMsg[] = [{ role: "system", content: system }];
  for (const t of turns) {
    if (t.role === "system") continue;
    if (t.images && t.images.length > 0 && t.role === "user") {
      out.push({
        role: "user",
        content: [
          { type: "text", text: t.content || "Describe this." },
          ...t.images.slice(0, 2).map((url) => ({
            type: "image_url" as const,
            image_url: { url },
          })),
        ],
      });
    } else {
      out.push({ role: t.role, content: t.content });
    }
  }
  return out;
}

type ToolCall = { id: string; name: string; arguments: string };

type Completion =
  | { text: string; toolCalls?: ToolCall[] }
  | { error: string; status: number };

async function openAiCompatible(opts: {
  url: string;
  apiKey: string;
  model: string;
  messages: OaiMsg[];
  tools?: unknown[];
  extraHeaders?: Record<string, string>;
}): Promise<Completion> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
  };
  if (opts.tools?.length) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      ...opts.extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    return { error: `Provider error ${res.status}: ${raw.slice(0, 280)}`, status: res.status };
  }
  try {
    const parsed = JSON.parse(raw) as {
      choices?: {
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
          tool_calls?: { id: string; function?: { name: string; arguments: string } }[];
        };
        finish_reason?: string;
      }[];
    };
    const msg = parsed.choices?.[0]?.message;
    const content = msg?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((c) => c.text ?? "").join("")
          : "";
    const toolCalls: ToolCall[] = (msg?.tool_calls ?? [])
      .filter((c) => c.function?.name)
      .map((c) => ({
        id: c.id,
        name: c.function!.name,
        arguments: c.function!.arguments || "{}",
      }));
    if (toolCalls.length) return { text: text.trim(), toolCalls };
    return { text: text.trim() || "Empty response." };
  } catch {
    return { error: "Could not parse provider response.", status: 502 };
  }
}

async function runOpenAiLoop(opts: {
  url: string;
  apiKey: string;
  model: string;
  system: string;
  turns: ChatTurn[];
  pluginIds: string[];
  keys: ChatRequest["keys"];
  extraHeaders?: Record<string, string>;
}): Promise<Completion & { toolRuns?: ToolRun[] }> {
  const tools = toolsForPlugins(opts.pluginIds);
  const messages = toOpenAiMessages(opts.system, opts.turns);
  const toolRuns: ToolRun[] = [];
  for (let round = 0; round < TOOL_ROUNDS; round++) {
    const result = await openAiCompatible({
      url: opts.url,
      apiKey: opts.apiKey,
      model: opts.model,
      messages,
      tools: tools.length ? tools : undefined,
      extraHeaders: opts.extraHeaders,
    });
    if ("error" in result) return result;
    if (!result.toolCalls?.length) return { text: result.text, toolRuns };
    messages.push({
      role: "assistant",
      content: result.text || null,
      tool_calls: result.toolCalls.map((c) => ({
        id: c.id,
        type: "function",
        function: { name: c.name, arguments: c.arguments },
      })),
    });
    for (const call of result.toolCalls) {
      const exec = await executePluginTool(call.name, call.arguments, {
        vtsHost: opts.keys?.vtsHost,
        githubToken: opts.keys?.githubToken,
      });
      toolRuns.push(exec.run);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: exec.output,
      });
    }
  }
  return { text: "Stopped after plugin rounds. Ask me to continue.", toolRuns };
}

async function anthropicChat(opts: {
  apiKey: string;
  model: string;
  system: string;
  turns: ChatTurn[];
  pluginIds: string[];
  keys: ChatRequest["keys"];
}): Promise<Completion & { toolRuns?: ToolRun[] }> {
  const tools = toolsForPlugins(opts.pluginIds).map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters,
  }));
  type AntMsg = { role: string; content: unknown };
  const messages: AntMsg[] = opts.turns
    .filter((t) => t.role !== "system")
    .map((t) => {
      if (t.images?.length && t.role === "user") {
        const img = t.images[0];
        const m = /^data:(.+);base64,(.+)$/.exec(img);
        return {
          role: "user" as const,
          content: [
            {
              type: "image" as const,
              source: m
                ? { type: "base64" as const, media_type: m[1], data: m[2] }
                : { type: "url" as const, url: img },
            },
            { type: "text" as const, text: t.content || "Describe this." },
          ],
        };
      }
      return { role: t.role, content: t.content };
    });

  const toolRuns: ToolRun[] = [];
  for (let round = 0; round < TOOL_ROUNDS; round++) {
    const payload: Record<string, unknown> = {
      model: opts.model,
      max_tokens: MAX_TOKENS,
      system: opts.system,
      messages,
    };
    if (tools.length) payload.tools = tools;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { error: `Claude error ${res.status}: ${raw.slice(0, 280)}`, status: res.status };
    }
    const body = JSON.parse(raw) as {
      stop_reason?: string;
      content?: { type: string; text?: string; id?: string; name?: string; input?: unknown }[];
    };
    const blocks = body.content ?? [];
    const text = blocks
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("");
    const uses = blocks.filter((c) => c.type === "tool_use" && c.name && c.id);
    if (!uses.length) return { text: text.trim() || "Empty response.", toolRuns };
    messages.push({ role: "assistant", content: blocks });
    const results = [];
    for (const u of uses) {
      const exec = await executePluginTool(u.name!, JSON.stringify(u.input ?? {}), {
        vtsHost: opts.keys?.vtsHost,
        githubToken: opts.keys?.githubToken,
      });
      toolRuns.push(exec.run);
      results.push({
        type: "tool_result",
        tool_use_id: u.id,
        content: exec.output,
      });
    }
    messages.push({ role: "user", content: results });
  }
  return { text: "Stopped after plugin rounds. Ask me to continue.", toolRuns };
}

function needsKey(message: string): ChatResult {
  return { ok: false, error: message, code: "needs-key" };
}

export const sendChat = createServerFn({ method: "POST" })
  .validator((input: ChatRequest) => input)
  .handler(async ({ data }): Promise<ChatResult> => {
    const system = composeSystem(data);
    const xai = process.env.XAI_API_KEY;
    const keys = data.keys ?? {};
    const pluginIds = data.pluginIds ?? [];

    const grokCall = async (model: string, via: string): Promise<ChatResult> => {
      if (!xai) {
        return { ok: false, error: "Grok is unavailable in this environment.", code: "unavailable" };
      }
      const result = await runOpenAiLoop({
        url: "https://api.x.ai/v1/chat/completions",
        apiKey: xai,
        model,
        system,
        turns: data.messages,
        pluginIds,
        keys,
      });
      if ("error" in result) return { ok: false, error: result.error, code: "provider" };
      return {
        ok: true,
        text: result.text,
        routedVia: via,
        model,
        toolRuns: result.toolRuns,
      };
    };

    try {
      if (data.providerId === "grok") {
        return grokCall(data.modelId || "grok-4.5", "xai");
      }

      if (data.providerId === "hermes") {
        if (keys.ollama) {
          const host = (keys.ollamaHost || "https://ollama.com").replace(/\/$/, "");
          const url = host.endsWith("/v1")
            ? `${host}/chat/completions`
            : `${host}/v1/chat/completions`;
          const result = await runOpenAiLoop({
            url,
            apiKey: keys.ollama,
            model: data.modelId || "hermes3:8b",
            system,
            turns: data.messages,
            pluginIds,
            keys,
          });
          if (!("error" in result)) {
            return {
              ok: true,
              text: result.text,
              routedVia: "ollama",
              model: data.modelId,
              toolRuns: result.toolRuns,
            };
          }
        }
        const relayed = await grokCall("grok-4.5", "grok-relay");
        if (relayed.ok) return { ...relayed, routedVia: "grok-relay" };
        return relayed;
      }

      if (data.providerId === "claude") {
        if (!keys.anthropic) {
          return needsKey("Add an Anthropic API key in Settings to talk to Claude.");
        }
        const result = await anthropicChat({
          apiKey: keys.anthropic,
          model: data.modelId,
          system,
          turns: data.messages,
          pluginIds,
          keys,
        });
        if ("error" in result) return { ok: false, error: result.error, code: "provider" };
        return {
          ok: true,
          text: result.text,
          routedVia: "anthropic",
          model: data.modelId,
          toolRuns: result.toolRuns,
        };
      }

      if (data.providerId === "openai") {
        if (!keys.openai) {
          return needsKey("Add an OpenAI API key in Settings to talk to ChatGPT.");
        }
        const result = await runOpenAiLoop({
          url: "https://api.openai.com/v1/chat/completions",
          apiKey: keys.openai,
          model: data.modelId,
          system,
          turns: data.messages,
          pluginIds,
          keys,
        });
        if ("error" in result) return { ok: false, error: result.error, code: "provider" };
        return {
          ok: true,
          text: result.text,
          routedVia: "openai",
          model: data.modelId,
          toolRuns: result.toolRuns,
        };
      }

      if (data.providerId === "ollama-cloud" || data.providerId === "ollama-local") {
        if (!keys.ollama && data.providerId === "ollama-cloud") {
          return needsKey("Add an Ollama Cloud API key in Settings.");
        }
        const host = (keys.ollamaHost || "https://ollama.com").replace(/\/$/, "");
        const url = host.includes("/v1")
          ? `${host.replace(/\/chat\/completions$/, "")}/chat/completions`
          : `${host}/v1/chat/completions`;
        if (!keys.ollama && data.providerId === "ollama-local") {
          return needsKey(
            "Local Ollama is on your laptop and cannot be reached from this app until you add a Cloud key or a public host in Settings. Hermes and Grok still work now — both carry VTS plugins.",
          );
        }
        const result = await runOpenAiLoop({
          url,
          apiKey: keys.ollama || "ollama",
          model: data.modelId,
          system,
          turns: data.messages,
          pluginIds,
          keys,
        });
        if ("error" in result) return { ok: false, error: result.error, code: "provider" };
        return {
          ok: true,
          text: result.text,
          routedVia: "ollama",
          model: data.modelId,
          toolRuns: result.toolRuns,
        };
      }

      return { ok: false, error: "Unknown provider.", code: "provider" };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error talking to the model.",
        code: "provider",
      };
    }
  });

export const aiStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { grok: Boolean(process.env.XAI_API_KEY) };
});

export const vtsStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const ping = await pingVts();
    const health = ping.health as { status?: number; data?: { status?: string } };
    const ok = health?.status === 200 || health?.data?.status === "ok";
    return {
      ok,
      proxy: ping.proxy,
      laptop: ping.laptop,
    };
  } catch {
    return { ok: false, proxy: "", laptop: { hostname: "", transport: "", port: 0, toolCount: 0, platform: "" } };
  }
});
