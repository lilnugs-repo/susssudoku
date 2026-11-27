"use client";

import { formatTime } from "@/lib/game/state";
import type { Difficulty } from "@/lib/sudoku";
import { PauseIcon, PlayIcon } from "./Icons";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

interface StatusBarProps {
  difficulty: Difficulty;
  mistakes: number;
  showMistakes: boolean;
  elapsed: number;
  showTimer: boolean;
  paused: boolean;
  completed: boolean;
  onDifficulty: () => void;
  onTogglePause: () => void;
}

export default function StatusBar(p: StatusBarProps) {
  return (
    <div className="board-size mx-auto flex items-center justify-between gap-2 text-sm">
      <button
        type="button"
        onClick={p.onDifficulty}
        className="rounded-full bg-surface px-3 py-1.5 font-bold text-ink shadow-[var(--shadow)] transition active:scale-95"
        title="Change difficulty"
      >
        {DIFFICULTY_LABEL[p.difficulty]} <span className="text-muted">▾</span>
      </button>

      {p.showMistakes && (
        <span className="tnum text-muted" aria-live="polite">
          Mistakes <b className={p.mistakes ? "text-conflict" : "text-ink"}>{p.mistakes}</b>
        </span>
      )}

      <button
        type="button"
        onClick={p.onTogglePause}
        disabled={p.completed}
        title={p.paused ? "Resume (P)" : "Pause (P)"}
        aria-label={p.paused ? "Resume" : "Pause"}
        className="flex items-center gap-1.5 rounded-full bg-surface py-1.5 pl-3 pr-2 font-bold text-ink shadow-[var(--shadow)] transition active:scale-95 disabled:opacity-70"
      >
        {p.showTimer && <span className="tnum min-w-[3.2rem] text-right">{formatTime(p.elapsed)}</span>}
        <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-muted">
          {p.paused ? <PlayIcon width={14} height={14} /> : <PauseIcon width={14} height={14} />}
        </span>
      </button>
    </div>
  );
}
