"use client";

import { formatTime } from "@/lib/game/state";
import type { Stats } from "@/lib/game/settings";
import { DIFFICULTIES, type Difficulty } from "@/lib/sudoku";
import Sheet from "./Sheet";
import { DIFFICULTY_LABEL } from "./StatusBar";

const BLURB: Record<Difficulty, string> = {
  easy: "A gentle warm-up. Plenty of clues.",
  medium: "A satisfying think with your coffee.",
  hard: "Fewer clues — you'll need some clever logic.",
};

interface Props {
  open: boolean;
  current: Difficulty;
  stats: Stats;
  hasProgress: boolean;
  onClose: () => void;
  onNew: (d: Difficulty) => void;
  onRestart: () => void;
}

export default function NewGameSheet({ open, current, stats, hasProgress, onClose, onNew, onRestart }: Props) {
  return (
    <Sheet open={open} title="New game" onClose={onClose}>
      {hasProgress && (
        <p className="mb-3 text-sm text-muted">Your current puzzle will be replaced.</p>
      )}
      <div className="flex flex-col gap-2.5">
        {DIFFICULTIES.map((d) => {
          const s = stats[d];
          return (
            <button
              key={d}
              type="button"
              onClick={() => onNew(d)}
              className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition active:scale-[0.98] ${
                d === current ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong"
              }`}
            >
              <span>
                <span className="block text-base font-extrabold">{DIFFICULTY_LABEL[d]}</span>
                <span className="block text-sm text-muted">{BLURB[d]}</span>
              </span>
              <span className="tnum shrink-0 text-right text-xs text-muted">
                {s.bestTime !== null ? (
                  <>
                    Best
                    <b className="block text-sm text-ink">{formatTime(s.bestTime)}</b>
                  </>
                ) : (
                  "—"
                )}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="mt-4 w-full rounded-2xl bg-surface-2 py-3 font-bold text-ink transition active:scale-[0.98]"
      >
        Restart this puzzle
      </button>
    </Sheet>
  );
}
