import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { Plus } from "lucide-react";

export function AdminEvents() {
  const { addEvent } = useArena();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    addEvent({ title, category: category || "General", date, description });
    setTitle("");
    setCategory("");
    setDate("");
    setDescription("");
  };

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-1">Create Event</h2>
      <p className="text-xs text-muted-foreground mb-6">New events appear in the player dashboard immediately.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
            placeholder="Event name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
              placeholder="e.g. Puzzle"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber resize-none"
            placeholder="One-line description"
          />
        </div>
        <button
          type="submit"
          disabled={!title || !date}
          className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-amber-foreground transition-colors hover:bg-amber/90 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </form>
    </div>
  );
}
