import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { Send } from "lucide-react";

export function AdminAnnouncements() {
  const { addAnnouncement, announcements } = useArena();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addAnnouncement(text.trim());
    setText("");
  };

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-1">Post Announcement</h2>
      <p className="text-xs text-muted-foreground mb-6">Shows up in the player header dropdown instantly.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber resize-none"
          placeholder="Write your announcement..."
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-amber-foreground transition-colors hover:bg-amber/90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Post
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent ({announcements.length})</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {announcements.slice(0, 5).map(a => (
            <div key={a.id} className="rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-xs text-foreground/80">
              {a.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
