import { sendChat } from "@/lib/chat-api";
import { useMessenger, type Attachment } from "@/lib/store";
import { uid } from "@/lib/utils";

export async function dispatchSend(
  chatId: string,
  content: string,
  attachments: Attachment[] = [],
) {
  const store = useMessenger.getState();
  const chat = store.chats.find((c) => c.id === chatId);
  if (!chat || store.sending[chatId]) return;

  const trimmed = content.trim();
  if (!trimmed && attachments.length === 0) return;

  const userMsg = {
    id: uid("m"),
    role: "user" as const,
    content: trimmed,
    createdAt: Date.now(),
    attachments: attachments.length ? attachments : undefined,
  };
  store.appendMessage(chatId, userMsg);

  if (chat.title.startsWith("New ") && trimmed) {
    store.renameChat(chatId, trimmed.slice(0, 36));
  }

  store.setSending(chatId, true);

  const latest = useMessenger.getState();
  const liveChat = latest.chats.find((c) => c.id === chatId) ?? chat;
  const history = (latest.messages[chatId] ?? [])
    .filter((m) => !m.error && (m.role === "user" || m.role === "assistant"))
    .slice(-18)
    .map((m) => ({
      role: m.role,
      content: m.content,
      images: m.attachments?.filter((a) => a.kind === "image").map((a) => a.dataUrl),
    }));

  const skills = latest.skills.filter((sk) => liveChat.skillIds.includes(sk.id));

  try {
    const result = await sendChat({
      data: {
        providerId: liveChat.providerId,
        modelId: liveChat.modelId,
        botMode: liveChat.botMode,
        messages: history,
        skills,
        pluginIds: liveChat.pluginIds,
        keys: {
          openai: latest.keys.openai || undefined,
          anthropic: latest.keys.anthropic || undefined,
          ollama: latest.keys.ollama || undefined,
          ollamaHost: latest.keys.ollamaHost || undefined,
          vtsHost: latest.keys.vtsHost || undefined,
          githubToken: latest.keys.githubToken || undefined,
        },
      },
    });

    if (result.ok) {
      store.appendMessage(chatId, {
        id: uid("m"),
        role: "assistant",
        content: result.text,
        createdAt: Date.now(),
        routedVia: result.routedVia,
        toolRuns: result.toolRuns,
      });
    } else {
      store.appendMessage(chatId, {
        id: uid("m"),
        role: "assistant",
        content: result.error,
        createdAt: Date.now(),
        error: result.code ?? "provider",
      });
    }
  } catch (err) {
    store.appendMessage(chatId, {
      id: uid("m"),
      role: "assistant",
      content: err instanceof Error ? err.message : "Could not reach the model.",
      createdAt: Date.now(),
      error: "provider",
    });
  } finally {
    useMessenger.getState().setSending(chatId, false);
  }
}
