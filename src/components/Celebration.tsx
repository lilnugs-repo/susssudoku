"use client";

import { formatTime } from "@/lib/game/state";
import type { LevelStats } from "@/lib/game/settings";
import type { Difficulty } from "@/lib/sudoku";
import Confetti from "./Confetti";
import { HeartIcon } from "./Icons";
import { DIFFICULTY_LABEL } from "./StatusBar";

const NOTES = [
  "Every square in its place — just like you make everything fall into place.",
  "Solved with grace. This little puzzle box was made just for you.",
  "Sharp mind, warm heart. Another one beautifully done.",
  "Nine rows, nine columns, and one brilliant Sussmita.",
  "That was lovely to watch. Ready for another?",
];

interface Props {
  difficulty: Difficulty;
  elapsed: number;
  mistakes: number;
  hintsUsed: number;
  level: LevelStats;
  noteIndex: number;
  onPlayAgain: (d: Difficulty) => void;
  onClose: () => void;
}

export default function Celebration({ difficulty, elapsed, mistakes, hintsUsed, level, noteIndex, onPlayAgain, onClose }: Props) {
  const isBest = level.bestTime !== null && elapsed <= level.bestTime;
  const harder: Difficulty | null = difficulty === "easy" ? "medium" : difficulty === "medium" ? "hard" : null;

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-40 grid place-items-center p-4" role="presentation">
        <div className="anim-fade absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
          className="anim-rise relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface p-6 text-center shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-72 rounded-full bg-accent-soft blur-2xl" />
          <div className="relative">
            <HeartIcon className="anim-heart mx-auto text-accent" width={44} height={44} />
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-muted">Puzzle solved</p>
            <h2 id="win-title" className="font-display mt-1 text-3xl font-semibold italic leading-tight">
              Well done, Sussmita!
            </h2>
            <p className="mx-auto mt-3 max-w-[18rem] text-[0.95rem] text-muted">{NOTES[noteIndex % NOTES.length]}</p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-surface-2 py-2.5">
                <div className="text-muted">Time</div>
                <div className="tnum text-lg font-extrabold">{formatTime(elapsed)}</div>
              </div>
              <div className="rounded-2xl bg-surface-2 py-2.5">
                <div className="text-muted">Mistakes</div>
                <div className="tnum text-lg font-extrabold">{mistakes}</div>
              </div>
              <div className="rounded-2xl bg-surface-2 py-2.5">
                <div className="text-muted">Hints</div>
                <div className="tnum text-lg font-extrabold">{hintsUsed}</div>
              </div>
            </div>
            <p className="tnum mt-3 text-sm text-muted">
              {isBest ? (
                <b className="text-accent">✨ New best for {DIFFICULTY_LABEL[difficulty]}!</b>
              ) : level.bestTime !== null ? (
                <>
                  Best {DIFFICULTY_LABEL[difficulty]}: <b className="text-ink">{formatTime(level.bestTime)}</b>
                </>
              ) : null}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onPlayAgain(difficulty)}
                className="rounded-2xl bg-accent py-3.5 font-extrabold text-accent-ink shadow-md transition active:scale-[0.98]"
              >
                Play another {DIFFICULTY_LABEL[difficulty]}
              </button>
              {harder && (
                <button
                  type="button"
                  onClick={() => onPlayAgain(harder)}
                  className="rounded-2xl bg-surface-2 py-3 font-bold transition active:scale-[0.98]"
                >
                  Try {DIFFICULTY_LABEL[harder]}
                </button>
              )}
              <button type="button" onClick={onClose} className="py-2 text-sm font-semibold text-muted">
                Admire the board
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
