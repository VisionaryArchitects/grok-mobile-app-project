# Hermes Messenger

Android-first multi-model chat for Visionary Architects.

**Live in Grok Build.** Repo: [VisionaryArchitects/grok-mobile-app-project](https://github.com/VisionaryArchitects/grok-mobile-app-project)

![CI](https://github.com/VisionaryArchitects/grok-mobile-app-project/actions/workflows/ci.yml/badge.svg)

## What it is

A WhatsApp / Grok-style messenger that houses every frontier model in one app:

| Thread | Status |
| --- | --- |
| Hermes | Live (Hermes 3 voice, routed through Grok until Ollama is linked) |
| Hermes Bot Mode | Live agent loop + skills |
| Grok 4.5 | Live |
| Claude | Paste Anthropic key in Settings |
| ChatGPT | Paste OpenAI key in Settings |
| Ollama Local / Cloud Pro | Paste Ollama key or public host |

## + menu (every chat)

Camera · Gallery · Files · **Create skill** · Skills · Connectors

Skill Creator is one tap from every composer, on every provider.

## Local development

```bash
# Install dependencies (once you have app code scaffolded)
npm install

# Start the dev server
npm start          # Expo / Metro

# Run tests
npm test

# Lint
npm run lint
```

## Environment variables

Copy `.env.example` → `.env` and fill in your keys. **Never commit `.env`.**

```
GROK_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
OLLAMA_HOST=
```

## Contributing

1. Branch off `main` — use a descriptive name (`feat/skill-creator`, `fix/grok-auth`)
2. Open a PR — the template will walk you through the checklist
3. CI must be green before merging

## Notes

This Grok Build environment ships an installable Android-first web app (home-screen PWA), not a Play Store APK. Hermes replies today. Link Cloud keys in Settings to take Claude, ChatGPT, and Ollama off relay.
