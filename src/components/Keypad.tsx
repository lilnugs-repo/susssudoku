"use client";

import { useRef } from "react";
import { LockIcon } from "./Icons";

interface KeypadProps {
  counts: number[]; // counts[d] = how many d's are on the board
  notesMode: boolean;
  lockedDigit: number | null;
  disabled: boolean;
  onDigit: (digit: number) => void;
  onLock: (digit: number | null) => void;
}

const LONG_PRESS_MS = 420;

export default function Keypad({ counts, notesMode, lockedDigit, disabled, onDigit, onLock }: KeypadProps) {
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2 lg:grid-cols-3 lg:gap-2.5" role="group" aria-label="Number pad">
        {Array.from({ length: 9 }, (_, k) => {
          const d = k + 1;
          const remaining = Math.max(0, 9 - counts[d]);
          const done = remaining === 0 && !notesMode;
          const locked = lockedDigit === d;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              aria-pressed={locked}
              aria-label={`${d}${locked ? ", locked" : ""}, ${remaining} left`}
              onPointerDown={() => {
                longPressed.current = false;
                clear();
                timer.current = window.setTimeout(() => {
                  longPressed.current = true;
                  onLock(locked ? null : d);
                  if (navigator.vibrate) navigator.vibrate(12);
                }, LONG_PRESS_MS);
              }}
              onPointerUp={clear}
              onPointerLeave={clear}
              onPointerCancel={clear}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => {
                if (longPressed.current) {
                  longPressed.current = false;
                  return;
                }
                onDigit(d);
              }}
              className={[
                "kp-btn relative flex h-14 select-none flex-col items-center justify-center rounded-xl transition-all duration-150 sm:h-16",
                "active:scale-95 disabled:opacity-40",
                locked
                  ? "bg-accent text-accent-ink shadow-md"
                  : "bg-surface text-ink shadow-[var(--shadow)] hover:bg-surface-2",
                done && !locked ? "opacity-35" : "",
              ].join(" ")}
            >
              <span
                className={`tnum leading-none ${notesMode ? "text-xl font-bold text-muted sm:text-2xl" : "text-[1.6rem] font-bold text-user sm:text-3xl"} ${
                  locked ? "!text-accent-ink" : ""
                }`}
              >
                {d}
              </span>
              <span className={`tnum mt-0.5 text-[0.65rem] font-semibold ${locked ? "opacity-90" : "text-muted"}`}>
                {locked ? <LockIcon width={10} height={10} className="inline" /> : done ? "✓" : remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
