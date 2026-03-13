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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto max-w-7xl px-4 pt-4"
    >
      <div className="flex items-center justify-between rounded-xl border border-magenta/25 bg-gradient-to-r from-magenta/10 via-magenta/5 to-transparent px-5 py-3.5 shadow-[0_0_24px_hsl(288_80%_62%/0.1)]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-magenta/15 ring-1 ring-magenta/30 shrink-0">
            <Zap className="h-4 w-4 text-magenta" />
          </div>
          <div>
            <span className="font-display font-semibold text-sm text-foreground">Challenge Live</span>
            <span className="ml-2 text-xs text-muted-foreground">{activePuzzle.points} pts up for grabs</span>
          </div>
        </div>
        <button
          onClick={onOpen}
          className="rounded-lg bg-magenta px-4 py-1.5 text-xs font-bold text-white shadow-[0_4px_14px_hsl(288_80%_62%/0.35)] transition-all hover:shadow-[0_4px_20px_hsl(288_80%_62%/0.5)] hover:-translate-y-px"
        >
          Enter Now →
        </button>
      </div>
    </motion.div>
  );
}
