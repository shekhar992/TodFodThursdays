import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface Props {
  onOpen: () => void;
}

export function ChallengeBanner({ onOpen }: Props) {
  const { activePuzzle, puzzleSolved } = useArena();

  if (!activePuzzle || puzzleSolved) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-border bg-primary/5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-foreground">
            Challenge Live
          </span>
          <span className="text-muted-foreground">— {activePuzzle.points} pts</span>
        </div>
        <button
          onClick={onOpen}
          className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tap to play
        </button>
      </div>
    </motion.div>
  );
}
