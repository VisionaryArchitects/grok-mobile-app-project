import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { SKILL_CREATOR_ID } from "@/lib/skills-catalog";
import { useMessenger } from "@/lib/store";

export function SkillsView() {
  const navigate = useNavigate();
  const skills = useMessenger((s) => s.skills);
  const chats = useMessenger((s) => s.chats);
  const deleteSkill = useMessenger((s) => s.deleteSkill);
  const createChat = useMessenger((s) => s.createChat);
  const toggleSkill = useMessenger((s) => s.toggleSkill);

  function openWith(skillId: string) {
    const hermes = chats.find((c) => c.id === "hermes");
    if (hermes) {
      if (!hermes.skillIds.includes(skillId)) toggleSkill(hermes.id, skillId);
      void navigate({ to: "/c/$chatId", params: { chatId: hermes.id } });
      return;
    }
    const id = createChat({ providerId: "hermes", botMode: skillId !== SKILL_CREATOR_ID });
    toggleSkill(id, skillId);
    void navigate({ to: "/c/$chatId", params: { chatId: id } });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="flex items-end justify-between px-4 pt-3 pb-2">
        <h1 className="text-[28px] font-semibold tracking-tight">Skills</h1>
        <button
          type="button"
          onClick={() => {
            const hermes = chats.find((c) => c.id === "hermes") ?? chats[0];
            if (hermes) void navigate({ to: "/c/$chatId", params: { chatId: hermes.id } });
          }}
          className="grid size-11 place-items-center rounded-full bg-elevated text-fg"
          aria-label="Create skill in chat"
        >
          <Plus className="size-5" />
        </button>
      </header>
      <p className="px-4 pb-3 text-sm leading-relaxed text-muted">
        Skill Creator lives in every chat's + menu. Custom skills attach to any provider.
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <ul className="space-y-2">
          {skills.map((sk) => (
            <li key={sk.id} className="rounded-2xl bg-elevated p-4 ring-1 ring-line">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-medium">
                    {sk.name}
                    {sk.id === SKILL_CREATOR_ID ? (
                      <span className="ml-2 text-[11px] font-medium text-accent">Always on</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted">{sk.trigger}</p>
                </div>
                {!sk.builtin ? (
                  <button
                    type="button"
                    onClick={() => deleteSkill(sk.id)}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted"
                    aria-label={`Delete ${sk.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg/90">{sk.instructions}</p>
              <button
                type="button"
                onClick={() => openWith(sk.id)}
                className="mt-3 h-11 w-full rounded-xl bg-panel text-sm font-medium text-fg"
              >
                Use in Hermes
              </button>
            </li>
          ))}
        </ul>
      </div>
      <BottomNav />
    </div>
  );
}
