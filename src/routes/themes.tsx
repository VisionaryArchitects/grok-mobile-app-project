import { createFileRoute } from "@tanstack/react-router";
import { ThemesView } from "@/components/themes-view";

export const Route = createFileRoute("/themes")({ component: ThemesView });
