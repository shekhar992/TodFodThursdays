import { useState } from "react";

interface Props {
  mode: "player" | "admin";
  onToggle: (mode: "player" | "admin") => void;
}

export function DevSwitcher({ mode, onToggle }: Props) {
  return (
    <div className="fixed bottom-4 left-4 z-[200] flex items-center gap-1 rounded-full border border-border/50 bg-card/90 backdrop-blur px-3 py-1.5 shadow-lg">
      <span className="text-[10px] font-mono text-muted-foreground mr-1.5">DEV</span>
      <button
        onClick={() => onToggle("player")}
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
          mode === "player"
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Player
      </button>
      <span className="text-[10px] text-muted-foreground">|</span>
      <button
        onClick={() => onToggle("admin")}
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
          mode === "admin"
            ? "bg-amber/20 text-amber"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Admin
      </button>
    </div>
  );
}
