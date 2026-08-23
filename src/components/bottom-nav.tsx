import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle, Palette, Puzzle, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Chats", icon: MessageCircle },
  { to: "/skills", label: "Skills", icon: Puzzle },
  { to: "/themes", label: "Themes", icon: Palette },
  { to: "/settings", label: "Settings", icon: SlidersHorizontal },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="grid grid-cols-4 border-t border-line bg-surface pb-[max(8px,env(safe-area-inset-bottom))] pt-1">
      {ITEMS.map((item) => {
        const active =
          item.to === "/"
            ? pathname === "/"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active ? "text-accent" : "text-muted",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
