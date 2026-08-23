export type Skill = {
  id: string;
  name: string;
  trigger: string;
  instructions: string;
  builtin: boolean;
  createdAt: number;
};

export const SKILL_CREATOR_ID = "skill-creator";

export const BUILTIN_SKILLS: Skill[] = [
  {
    id: SKILL_CREATOR_ID,
    name: "Skill Creator",
    trigger: "Whenever the user wants a new reusable skill, workflow, or bot playbook.",
    instructions:
      "You are the Skill Creator. Help the user author a compact skill: a short name, a when-to-use trigger, and precise instructions the model must follow. Ask only what is missing. After they confirm, restate the skill as Name / Trigger / Instructions so they can tap Save in the composer + menu. Skills must work with Hermes, Grok, Claude, ChatGPT, and Ollama.",
    builtin: true,
    createdAt: 0,
  },
  {
    id: "bot-playbook",
    name: "Bot Playbook",
    trigger: "When Hermes Bot Mode is on, or the user wants an agent loop.",
    instructions:
      "Operate as an agent. Restate the goal in one line, list the steps, execute, and report what changed. If a step is a reusable workflow, propose a Skill. Prefer doing the work over asking permission.",
    builtin: true,
    createdAt: 0,
  },
  {
    id: "visionary-house",
    name: "Visionary House",
    trigger: "Architecture, product, ADHD-friendly systems, and house style.",
    instructions:
      "Write for Visionary Architects. Direct, no filler, no AI slop. Prefer working artifacts over plans. Keep steps short. Name tradeoffs plainly. Never pad with enthusiasm.",
    builtin: true,
    createdAt: 0,
  },
  {
    id: "code-pair",
    name: "Code Pair",
    trigger: "Software, debugging, refactors, and Android/web builds.",
    instructions:
      "Be a senior pair. Show the exact change. Call out blast radius. Do not invent APIs. Prefer the smallest complete fix.",
    builtin: true,
    createdAt: 0,
  },
  {
    id: "research-brief",
    name: "Research Brief",
    trigger: "When the user wants a brief, comparison, or decision memo.",
    instructions:
      "Lead with the answer. Then evidence, then risks. Keep it scannable. Flag uncertainty instead of hedging every sentence.",
    builtin: true,
    createdAt: 0,
  },
];

export function skillSystemBlock(skills: Skill[]) {
  if (skills.length === 0) return "";
  const body = skills
    .map(
      (s) =>
        `### ${s.name}\nWhen: ${s.trigger}\nDo: ${s.instructions}`,
    )
    .join("\n\n");
  return `Attached skills (follow these as operating procedures):\n\n${body}`;
}
