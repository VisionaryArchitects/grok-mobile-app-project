import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowUp, Mic, Plus, Square, X } from "lucide-react";
import { PlusMenu } from "@/components/plus-menu";
import type { Attachment } from "@/lib/store";
import { uid } from "@/lib/utils";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

function getSpeech(): SpeechRec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

async function fileToAttachment(file: File): Promise<Attachment | null> {
  if (file.size > 1_600_000) return null;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const kind = file.type.startsWith("image/") ? "image" : "file";
  return { id: uid("a"), name: file.name, mime: file.type || "application/octet-stream", dataUrl, kind };
}

export function Composer({
  disabled,
  onSend,
  onCreateSkill,
  onSkills,
  onConnectors,
}: {
  disabled?: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onCreateSkill: () => void;
  onSkills: () => void;
  onConnectors: () => void;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const next: Attachment[] = [];
    for (const f of files.slice(0, 3)) {
      const a = await fileToAttachment(f);
      if (a) next.push(a);
    }
    if (next.length) setAttachments((cur) => [...cur, ...next].slice(0, 4));
    setOpen(false);
  }

  function submit() {
    if (disabled) return;
    const t = text.trim();
    if (!t && attachments.length === 0) return;
    onSend(t, attachments);
    setText("");
    setAttachments([]);
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getSpeech();
    if (!rec) return;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      if (said) setText((cur) => (cur ? `${cur} ${said}` : said));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <div className="relative border-t border-line bg-bg px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      {open ? (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 -top-[100vh] h-[100vh]"
            aria-label="Dismiss menu"
            onClick={() => setOpen(false)}
          />
          <PlusMenu
            onCamera={() => cameraRef.current?.click()}
            onGallery={() => galleryRef.current?.click()}
            onFiles={() => filesRef.current?.click()}
            onCreateSkill={() => {
              setOpen(false);
              onCreateSkill();
            }}
            onSkills={() => {
              setOpen(false);
              onSkills();
            }}
            onConnectors={() => {
              setOpen(false);
              onConnectors();
            }}
          />
        </>
      ) : null}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
      <input ref={filesRef} type="file" multiple className="hidden" onChange={onPick} />

      {attachments.length > 0 ? (
        <div className="mb-2 flex gap-2 overflow-x-auto px-1">
          {attachments.map((a) => (
            <div key={a.id} className="relative">
              {a.kind === "image" ? (
                <img src={a.dataUrl} alt={a.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-line" />
              ) : (
                <div className="grid h-16 w-24 place-items-center rounded-lg bg-elevated px-2 text-center text-[11px] text-muted ring-1 ring-line">
                  {a.name}
                </div>
              )}
              <button
                type="button"
                className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-panel text-fg"
                onClick={() => setAttachments((cur) => cur.filter((x) => x.id !== a.id))}
                aria-label="Remove attachment"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 shrink-0 place-items-center rounded-full text-fg"
          aria-label="Add"
          aria-expanded={open}
        >
          <Plus className="size-6" strokeWidth={1.8} />
        </button>
        <div className="flex min-h-11 min-w-0 flex-1 items-end rounded-full bg-elevated px-3 py-1.5 ring-1 ring-line">
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message"
            className="max-h-[120px] min-h-8 w-full resize-none bg-transparent py-1.5 text-[16px] leading-snug text-fg outline-none placeholder:text-subtle"
          />
        </div>
        {text.trim() || attachments.length ? (
          <button
            type="button"
            onClick={submit}
            disabled={disabled}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-send text-send-fg disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp className="size-5" strokeWidth={2.4} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleMic}
            className="grid size-11 shrink-0 place-items-center rounded-full text-fg"
            aria-label={listening ? "Stop listening" : "Voice"}
          >
            {listening ? <Square className="size-5 fill-accent text-accent" /> : <Mic className="size-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
