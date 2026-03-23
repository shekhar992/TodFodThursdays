import { useState, useRef, useEffect } from "react";

const EMOJI_GROUPS = [
  {
    label: "Shoutouts & Recognition",
    emojis: ["⭐", "👑", "🩸", "⚡", "🔥", "🎭", "📣", "🌟", "💝", "🎯", "🧠", "😂", "🛡️", "🏅", "🎖️", "💎", "🤝", "🫶"],
  },
  {
    label: "Events & Games",
    emojis: ["🏆", "🎮", "🎲", "🎪", "🎨", "🎬", "🎤", "🎸", "🏋️", "🤸", "🏊", "🎾", "⚽", "🏸", "🎳", "🥊", "🧗", "🏄"],
  },
  {
    label: "Awards",
    emojis: ["🥇", "🥈", "🥉", "🏵️"],
  },
  {
    label: "Energy",
    emojis: ["💥", "🎉", "🎊", "🎁", "🪄", "🚀", "💫", "✨"],
  },
  {
    label: "Misc",
    emojis: ["📅", "🧩", "🗺️", "🔑", "💡", "🃏", "🕹️", "🌍", "🐉", "🦁", "🧪", "🔭", "🌊"],
  },
];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="mt-1 flex h-[38px] w-full items-center justify-center rounded-lg border border-border/70 bg-background/60 text-xl hover:border-gold/40 hover:bg-gold/5 transition-colors"
        title="Pick an emoji"
      >
        {value || "📅"}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 rounded-xl border border-gold/30 bg-card p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(245,184,0,0.10)]">
          {EMOJI_GROUPS.map(group => (
            <div key={group.label} className="mb-3 last:mb-0">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {group.emojis.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { onChange(e); setOpen(false); }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition-colors hover:bg-accent ${
                      value === e ? "bg-gold/20 ring-1 ring-gold/40" : ""
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
