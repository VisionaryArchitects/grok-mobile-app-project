import { createFileRoute } from "@tanstack/react-router";
import { NewChatView } from "@/components/new-chat-view";

export const Route = createFileRoute("/new")({ component: NewChatView });
