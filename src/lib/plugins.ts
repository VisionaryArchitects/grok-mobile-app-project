export type PluginId =
  | "vts"
  | "search"
  | "github"
  | "browser"
  | "obsidian"
  | "memory"
  | "gws"
  | "m365";

export type PluginDef = {
  id: PluginId;
  name: string;
  blurb: string;
  family: string;
  defaultOn: boolean;
  tools: string[];
};

export const DEFAULT_PLUGIN_IDS: PluginId[] = ["vts", "search", "github", "browser"];

export const PLUGINS: PluginDef[] = [
  {
    id: "vts",
    name: "VTS",
    blurb: "Laptop MCP — 96 tools on BALLER-RAZER. On from the jump.",
    family: "Visionary Tool Server",
    defaultOn: true,
    tools: ["vts_status", "vts_inventory", "vts_ollama_models"],
  },
  {
    id: "search",
    name: "Web",
    blurb: "Search and fetch pages, like a frontier connector.",
    family: "Network",
    defaultOn: true,
    tools: ["web_search", "web_fetch"],
  },
  {
    id: "github",
    name: "GitHub",
    blurb: "Repos, issues, search — VTS GitHub lane plus public API.",
    family: "VTS · GitHub",
    defaultOn: true,
    tools: ["github_repo", "github_search", "github_issues"],
  },
  {
    id: "browser",
    name: "Browser",
    blurb: "Cloudflare Browser Run via the VTS proxy.",
    family: "VTS · CFBR",
    defaultOn: true,
    tools: ["browser_screenshot", "browser_sessions"],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    blurb: "Vault audit and note search on the laptop.",
    family: "VTS · Knowledge",
    defaultOn: false,
    tools: ["obsidian_audit"],
  },
  {
    id: "memory",
    name: "LoopLock",
    blurb: "Approved memories through VTS eden-memoryd.",
    family: "VTS · Memory",
    defaultOn: false,
    tools: ["memory_recall"],
  },
  {
    id: "gws",
    name: "Google",
    blurb: "Workspace lane — needs OAuth on the laptop.",
    family: "VTS · Productivity",
    defaultOn: false,
    tools: ["vts_inventory"],
  },
  {
    id: "m365",
    name: "Microsoft 365",
    blurb: "Graph lane — needs delegated login on the laptop.",
    family: "VTS · Productivity",
    defaultOn: false,
    tools: ["vts_inventory"],
  },
];

export function getPlugin(id: string) {
  return PLUGINS.find((p) => p.id === id);
}

export function normalizePluginIds(ids?: string[]): PluginId[] {
  const allowed = new Set(PLUGINS.map((p) => p.id));
  const next = (ids ?? DEFAULT_PLUGIN_IDS).filter((id): id is PluginId =>
    allowed.has(id as PluginId),
  );
  return next.length ? Array.from(new Set(next)) : [...DEFAULT_PLUGIN_IDS];
}

export type OaiTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

const TOOL_DEFS: Record<string, OaiTool> = {
  vts_status: {
    type: "function",
    function: {
      name: "vts_status",
      description: "Ping Visionary Tool Server: proxy health, browser limits, laptop MCP status.",
      parameters: { type: "object", properties: {} },
    },
  },
  vts_inventory: {
    type: "function",
    function: {
      name: "vts_inventory",
      description: "List VTS plugin surfaces (GitHub, Obsidian, Google, Microsoft 365, Discord, …).",
      parameters: { type: "object", properties: {} },
    },
  },
  vts_ollama_models: {
    type: "function",
    function: {
      name: "vts_ollama_models",
      description: "Inventory local and Ollama Cloud models on the VTS laptop (RTX 4090 16GB).",
      parameters: { type: "object", properties: {} },
    },
  },
  web_search: {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the public web. Use for current facts, docs, and news.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  web_fetch: {
    type: "function",
    function: {
      name: "web_fetch",
      description: "Fetch a public URL and return extracted text.",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    },
  },
  github_repo: {
    type: "function",
    function: {
      name: "github_repo",
      description: "Get a GitHub repository. repo is owner/name.",
      parameters: {
        type: "object",
        properties: { repo: { type: "string", description: "owner/name" } },
        required: ["repo"],
      },
    },
  },
  github_search: {
    type: "function",
    function: {
      name: "github_search",
      description: "Search GitHub repositories.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  github_issues: {
    type: "function",
    function: {
      name: "github_issues",
      description: "List open issues on a GitHub repo.",
      parameters: {
        type: "object",
        properties: {
          repo: { type: "string" },
          state: { type: "string", enum: ["open", "closed", "all"] },
        },
        required: ["repo"],
      },
    },
  },
  browser_screenshot: {
    type: "function",
    function: {
      name: "browser_screenshot",
      description: "Capture a page via VTS Cloudflare Browser Run.",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    },
  },
  browser_sessions: {
    type: "function",
    function: {
      name: "browser_sessions",
      description: "List active VTS browser sessions and CFBR limits.",
      parameters: { type: "object", properties: {} },
    },
  },
  obsidian_audit: {
    type: "function",
    function: {
      name: "obsidian_audit",
      description: "Read-only Obsidian vault audit through VTS.",
      parameters: { type: "object", properties: {} },
    },
  },
  memory_recall: {
    type: "function",
    function: {
      name: "memory_recall",
      description: "Recall approved LoopLock memories from VTS.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
};

export function toolsForPlugins(pluginIds: string[]): OaiTool[] {
  const names = new Set<string>();
  for (const id of normalizePluginIds(pluginIds)) {
    const p = getPlugin(id);
    if (!p) continue;
    for (const t of p.tools) names.add(t);
  }
  return [...names].map((n) => TOOL_DEFS[n]).filter(Boolean);
}

export function pluginSystemBlock(pluginIds: string[]) {
  const ids = normalizePluginIds(pluginIds);
  const lines = ids.map((id) => {
    const p = getPlugin(id);
    return p ? `- ${p.name}: ${p.tools.join(", ")}` : null;
  });
  return `Enabled plugins for this thread (OpenAI-style tools, like connectors):
${lines.filter(Boolean).join("\n")}
For laptop/VTS health, GitHub, web pages, or screenshots, call the matching tool, then answer from the tool result.`;
}
