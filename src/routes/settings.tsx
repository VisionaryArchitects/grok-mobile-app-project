import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/settings-view";

export const Route = createFileRoute("/settings")({ component: SettingsView });
