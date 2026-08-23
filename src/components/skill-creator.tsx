import { useState } from "react";
import { X } from "lucide-react";
import { SKILL_CREATOR_ID } from "@/lib/skills-catalog";
import { useMessenger } from "@/lib/store";

export function SkillCreator({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const addSkill = useMessenger((s) => s.addSkill);
  const toggleSkill = useMessenger((s) => s.toggleSkill);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [instructions, setInstructions] = useState("");

  function save() {
    const n = name.trim();
    const t = trigger.trim();
    const i = instructions.trim();
    if (!n || !i) return;
    addSkill(
      {
        name: n,
        trigger: t || "When this skill is attached to a chat.",
        instructions: i,
      },
      chatId,
    );
    const chat = useMessenger.getState().chats.find((c) => c.id === chatId);
    if (chat && !chat.skillIds.includes(SKILL_CREATOR_ID)) {
      toggleSkill(chatId, SKILL_CREATOR_ID);
    }
    onClose();
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-bg">
      <header className="flex items-center gap-2 border-b border-line px-3 py-3">
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center rounded-full text-fg"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold tracking-tight">Create skill</h2>
          <p className="text-xs text-muted">Works with every provider in this chat</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!name.trim() || !instructions.trim()}
          className="h-11 rounded-full bg-send px-4 text-sm font-semibold text-send-fg disabled:opacity-40"
        >
          Save
        </button>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <p className="text-sm leading-relaxed text-muted">
          Skill Creator is always in the + menu. Name the playbook, say when to use it, and write
          the instructions the model must follow.
        </p>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Build brief"
            className="h-12 w-full rounded-xl bg-elevated px-3 text-[15px] text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">When to use</span>
          <input
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="e.g. Starting any new product or app"
            className="h-12 w-full rounded-xl bg-elevated px-3 text-[15px] text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">Instructions</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={8}
            placeholder="What the model must do every time this skill is on."
            className="w-full resize-none rounded-xl bg-elevated px-3 py-3 text-[15px] leading-relaxed text-fg outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent"
          />
        </label>
      </div>
    </div>
  );
}
