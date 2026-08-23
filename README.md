# Hermes Messenger

Android-first multi-model messenger for **Visionary Architects**.

WhatsApp / Grok-app layout. One thread, flip the brain. **Hermes** and **Hermes Bot Mode** are first-class. Grok, Claude, ChatGPT, and Ollama (local + Cloud Pro) live in the same app.

**Public repo:** [https://github.com/VisionaryArchitects/grok-mobile-app-project](https://github.com/VisionaryArchitects/grok-mobile-app-project)

## What it is

- Chat list + thread + composer, dark Grok-style UI
- `+` menu: Camera, Gallery, Files, **Create skill**, Skills, **Plugins**
- Custom **Skill Creator** one tap from every chat
- **VTS (Visionary Tool Server)** plugins on from the jump, on every model
- Grok replies live via xAI. Hermes routes through Grok until an Ollama key is set. Claude / ChatGPT / Ollama Cloud light up with keys in Settings

This is a working **Android-first PWA** (installable, phone-framed). It is not a compiled Play Store APK.

## Plugins (VTS + connectors)

Default-on for every thread:

| Plugin | Tools |
|---|---|
| VTS | `vts_status`, `vts_inventory`, `vts_ollama_models` |
| Web | `web_search`, `web_fetch` |
| GitHub | `github_repo`, `github_search`, `github_issues` |
| Browser | `browser_screenshot`, `browser_sessions` |

Optional: Obsidian, LoopLock memory, Google Workspace, Microsoft 365.

Laptop MCP (BALLER-RAZER, port 8082, 96 tools) is the VTS source of truth. The app also talks to the public VTS proxy at `https://api.visionaryarchitects.dev`.

## Layout

```
src/
  components/     inbox, thread, composer, + menu, skill creator, plugin sheet
  lib/
    chat-api.ts       multi-provider send + tool loop
    plugin-runtime.ts executes VTS / GitHub / web / browser tools
    plugins.ts        connector catalog
    store.ts          chats, skills, plugins, keys
    send.ts           client dispatch
    providers.ts      Hermes, Grok, Claude, ChatGPT, Ollama
    skills-catalog.ts Skill Creator always attached
  routes/         /, /c/$chatId, /new, /skills, /settings, /themes
```

## Run

```bash
npm install
npm run dev          # Vite on 8080
npm run typecheck
npm run build
npm run preview      # production on 8081
```

Grok needs `XAI_API_KEY`. Other providers: paste keys in Settings (stored on-device).

## Review notes for MiniMax / other models

- Repo was created private with only a stub README. The app lived in a Grok Build sandbox and was not pushed until this public cut.
- Verified live: Hermes thread → `vts_status` → **BALLER-RAZER · 96 MCP tools**, with a tool chip on the bubble.
- Known constraint: this environment cannot emit a signed Android APK. The product is the PWA + the GitHub source.
- Do not treat `node_modules`, `.vercel`, or env keys as part of the review surface.

## License

Private house project for Visionary Architects. Public for a while so other models can audit it.
