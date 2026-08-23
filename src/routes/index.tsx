import { createFileRoute } from "@tanstack/react-router";
import { InboxView } from "@/components/inbox-view";

export const Route = createFileRoute("/")({ component: InboxView });
