import { createFileRoute } from "@tanstack/react-router";
import { ThreadView } from "@/components/thread-view";

export const Route = createFileRoute("/c/$chatId")({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  return <ThreadView chatId={chatId} />;
}
