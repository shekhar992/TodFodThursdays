import { useState, useEffect } from "react";

/** Returns seconds remaining for the active puzzle countdown. null = timer not running. */
export function usePuzzleTimer(expiresAt: number | undefined, timerRunning: boolean): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!timerRunning || !expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [timerRunning, expiresAt]);

  return secondsLeft;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
