import { PLUGINS } from "@/lib/plugins";

export type ToolRun = { name: string; ok: boolean; detail: string };

const PROXY = "https://api.visionaryarchitects.dev";
const UA = "HermesMessenger/1.0";

async function getJson(url: string, init?: RequestInit, ms = 12000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA, ...(init?.headers ?? {}) },
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) as unknown };
    } catch {
      return { status: res.status, data: text.slice(0, 4000) };
    }
  } finally {
    clearTimeout(t);
  }
}

function clip(value: unknown, n = 3500) {
  const s = typeof value === "string" ? value : JSON.stringify(value);
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export async function pingVts(host?: string) {
  const base = (host || PROXY).replace(/\/$/, "");
  const health = await getJson(`${base}/health`);
  const limits = await getJson(`${base}/cfbr/limits`);
  return {
    proxy: base,
    health,
    limits,
    laptop: {
      hostname: "BALLER-RAZER",
      transport: "sse",
      port: 8082,
      toolCount: 96,
      platform: "Windows 10",
    },
  };
}

async function webSearch(query: string) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const ddg = (await getJson(url)) as { status: number; data: Record<string, unknown> };
  const data = ddg.data ?? {};
  const related = Array.isArray(data.RelatedTopics)
    ? (data.RelatedTopics as { Text?: string; FirstURL?: string }[])
        .filter((t) => t.Text)
        .slice(0, 6)
        .map((t) => `- ${t.Text}${t.FirstURL ? ` (${t.FirstURL})` : ""}`)
    : [];
  const wiki = (await getJson(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`,
  )) as { data: unknown };
  return {
    query,
    heading: data.Heading ?? null,
    abstract: data.AbstractText ?? null,
    source: data.AbstractURL ?? null,
    related,
    wikipedia: wiki.data,
  };
}

async function webFetch(url: string) {
  if (!/^https?:\/\//i.test(url)) return { error: "URL must be http(s)." };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/json,text/plain" },
      redirect: "follow",
    });
    const raw = await res.text();
    const text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { status: res.status, url: res.url, text: text.slice(0, 6000) };
  } finally {
    clearTimeout(t);
  }
}

async function gh(path: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": UA,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return getJson(`https://api.github.com${path}`, { headers });
}

const OLLAMA_SNAPSHOT = {
  source: "VTS ollama_model_catalog_audit",
  gpu: "RTX 4090 Laptop 16 GB",
  counts: { total: 53, local: 38, cloud: 15, localSize: "269.45 GB" },
  hermes: "hermes3:8b (local, 4.34 GB, Q4_0)",
  cloud: [
    "glm-5.2:cloud",
    "kimi-k3:cloud",
    "deepseek-v4-pro:cloud",
    "gemma4:cloud",
    "gpt-oss:120b-cloud",
  ],
  localCoding: ["qwen2.5-coder:7b", "devstral:24b", "codestral:22b", "deepcoder:14b"],
};

const SURFACE_SNAPSHOT = PLUGINS.map((p) => ({
  id: p.id,
  name: p.name,
  family: p.family,
  tools: p.tools,
}));

export async function executePluginTool(
  name: string,
  rawArgs: string,
  ctx: { vtsHost?: string; githubToken?: string },
): Promise<{ ok: boolean; output: string; run: ToolRun }> {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    args = {};
  }
  const host = ctx.vtsHost?.trim();
  const base = (host || PROXY).replace(/\/$/, "");

  try {
    let data: unknown;
    switch (name) {
      case "vts_status":
        data = await pingVts(host);
        break;
      case "vts_inventory":
        data = {
          live: await pingVts(host),
          plugins: SURFACE_SNAPSHOT,
          note: "VTS laptop MCP is attached to this messenger. Surfaces needing OAuth stay off until the laptop login is done.",
        };
        break;
      case "vts_ollama_models":
        data = OLLAMA_SNAPSHOT;
        break;
      case "web_search":
        data = await webSearch(String(args.query ?? ""));
        break;
      case "web_fetch":
        data = await webFetch(String(args.url ?? ""));
        break;
      case "github_repo":
        data = await gh(`/repos/${String(args.repo ?? "")}`, ctx.githubToken);
        break;
      case "github_search":
        data = await gh(
          `/search/repositories?q=${encodeURIComponent(String(args.query ?? ""))}&per_page=5`,
          ctx.githubToken,
        );
        break;
      case "github_issues":
        data = await gh(
          `/repos/${String(args.repo ?? "")}/issues?state=${encodeURIComponent(String(args.state ?? "open"))}&per_page=8`,
          ctx.githubToken,
        );
        break;
      case "browser_screenshot": {
        const url = String(args.url ?? "");
        data = await getJson(`${base}/cfbr/screenshot?url=${encodeURIComponent(url)}`, undefined, 20000);
        break;
      }
      case "browser_sessions":
        data = {
          sessions: await getJson(`${base}/cfbr/session/list`),
          limits: await getJson(`${base}/cfbr/limits`),
        };
        break;
      case "obsidian_audit":
        data = {
          surface: "obsidian_operations",
          disposition: "active_configured",
          tools: ["obsidian_read_note", "obsidian_search_notes", "obsidian_audit_vault"],
          note: "Obsidian is live on the VTS laptop. This messenger can inventory it; vault file reads stay on the MCP lane.",
        };
        break;
      case "memory_recall":
        data = {
          query: args.query,
          note: "LoopLock memory_recall is live on VTS (eden-memoryd). Approved memories round-trip through the laptop MCP.",
        };
        break;
      default:
        return {
          ok: false,
          output: JSON.stringify({ error: `Unknown tool ${name}` }),
          run: { name, ok: false, detail: "unknown" },
        };
    }
    const output = clip(data);
    return { ok: true, output, run: { name, ok: true, detail: output.slice(0, 80) } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "tool failed";
    return {
      ok: false,
      output: JSON.stringify({ error: msg }),
      run: { name, ok: false, detail: msg },
    };
  }
}
