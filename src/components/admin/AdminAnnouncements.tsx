import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputCls = "w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export function AdminAnnouncements() {
  const { addAnnouncement, deleteAnnouncement, announcements } = useArena();
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addAnnouncement(text.trim());
    setText("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-carnival text-2xl tracking-wide text-gold">Announcements</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Posts appear instantly in the player header ticker and bell dropdown.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <label className={`${labelCls} mb-2`}>New Announcement</label>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Write your announcement... (e.g. 🏆 Team Titans leads after Quiz Battle Royale!)"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" /> Post Announcement
          </button>
        </form>
      </div>

      {announcements.length > 0 && (
        <div>
          <p className={`${labelCls} mb-3`}>Live Feed ({announcements.length})</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {announcements.slice(0, 15).map(a => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2.5"
                >
                  <span className="mt-0.5 text-base shrink-0">📣</span>
                  <p className="flex-1 text-xs leading-relaxed text-foreground/90">{a.text}</p>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

