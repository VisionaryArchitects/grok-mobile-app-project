import {
  Camera,
  ImageIcon,
  File,
  Puzzle,
  Cable,
  WandSparkles,
} from "lucide-react";

type Props = {
  onCamera: () => void;
  onGallery: () => void;
  onFiles: () => void;
  onCreateSkill: () => void;
  onSkills: () => void;
  onConnectors: () => void;
};

export function PlusMenu({
  onCamera,
  onGallery,
  onFiles,
  onCreateSkill,
  onSkills,
  onConnectors,
}: Props) {
  return (
    <div className="absolute bottom-[calc(100%+10px)] left-0 z-30 w-[220px] overflow-hidden rounded-[22px] bg-elevated py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-line">
      <MenuItem icon={Camera} label="Camera" onClick={onCamera} />
      <MenuItem icon={ImageIcon} label="Gallery" onClick={onGallery} />
      <MenuItem icon={File} label="Files" onClick={onFiles} />
      <div className="mx-4 my-1.5 h-px bg-line" />
      <MenuItem
        icon={WandSparkles}
        label="Create skill"
        accent
        onClick={onCreateSkill}
      />
      <MenuItem icon={Puzzle} label="Skills" onClick={onSkills} />
      <MenuItem icon={Cable} label="Plugins" onClick={onConnectors} />
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: typeof Camera;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 px-4 text-left"
    >
      <span className={accent ? "text-accent" : "text-fg"}>
        <Icon className="size-[22px]" strokeWidth={1.7} />
      </span>
      <span className={`text-[16px] ${accent ? "font-medium text-accent" : "text-fg"}`}>
        {label}
      </span>
    </button>
  );
}
