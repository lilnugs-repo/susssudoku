"use client";

import { memo } from "react";
import { maskDigits } from "@/lib/sudoku";

export interface CellProps {
  index: number;
  value: number;
  given: boolean;
  notes: number;
  selected: boolean;
  inUnit: boolean;
  match: boolean;
  /** Digit to emphasize inside the pencil marks (0 = none). */
  highlightDigit: number;
  error: boolean;
  /** Animation hints. */
  pop: number;
  shake: number;
  sweepDelay: number | null;
  winDelay: number | null;
  hidden: boolean;
  onTap: (index: number) => void;
}

function Cell({
  index,
  value,
  given,
  notes,
  selected,
  inUnit,
  match,
  highlightDigit,
  error,
  pop,
  shake,
  sweepDelay,
  winDelay,
  hidden,
  onTap,
}: CellProps) {
  const r = Math.floor(index / 9);
  const c = index % 9;

  const borders = [
    c === 8 ? "" : c % 3 === 2 ? "border-r-2 border-r-line-strong" : "border-r border-r-line",
    r === 8 ? "" : r % 3 === 2 ? "border-b-2 border-b-line-strong" : "border-b border-b-line",
  ].join(" ");

  let bg = "";
  if (error && !given) bg = "bg-[var(--conflict-bg)]";
  else if (selected) bg = "bg-[var(--cell-sel)]";
  else if (match) bg = "bg-[var(--cell-match)]";
  else if (inUnit) bg = "bg-[var(--cell-unit)]";

  const color = error && !given ? "text-conflict" : given ? "text-[var(--given)]" : "text-user";
  const weight = given ? "font-extrabold" : "font-bold";

  const label = `Row ${r + 1}, column ${c + 1}, ${
    value ? `${value}${given ? " (given)" : ""}` : notes ? `notes ${maskDigits(notes).join(" ")}` : "empty"
  }`;

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={label}
      aria-selected={selected}
      data-cell={index}
      tabIndex={-1}
      onPointerDown={(e) => {
        // Select on pointer down for snappy feel; prevent focus scroll jumps.
        if (e.pointerType !== "mouse" || e.button === 0) {
          e.preventDefault();
          onTap(index);
        }
      }}
      onClick={(e) => {
        // Keyboard activation (Enter/Space) reaches here without a pointerdown.
        if (e.detail === 0) onTap(index);
      }}
      style={
        {
          ...(sweepDelay !== null ? { "--delay": `${sweepDelay}ms` } : null),
          ...(winDelay !== null ? { "--delay": `${winDelay}ms` } : null),
        } as React.CSSProperties
      }
      className={`cell tnum ${borders} ${bg} ${sweepDelay !== null ? "anim-sweep" : ""}`}
    >
      {hidden ? null : value ? (
        <span
          key={`${pop}-${shake}`}
          className={`${color} ${weight} ${pop ? "anim-pop" : ""} ${shake ? "anim-shake" : ""} ${
            winDelay !== null ? "anim-win" : ""
          } inline-block`}
        >
          {value}
        </span>
      ) : notes ? (
        <span className="notes tnum" aria-hidden>
          {Array.from({ length: 9 }, (_, k) => {
            const d = k + 1;
            const on = (notes >> k) & 1;
            return (
              <span key={d} className={on && d === highlightDigit ? "note-match" : ""}>
                {on ? d : ""}
              </span>
            );
          })}
        </span>
      ) : null}
    </button>
  );
}

export default memo(Cell);
