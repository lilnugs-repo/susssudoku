"use client";

import { useMemo } from "react";
import type { GameState } from "@/lib/game/state";
import type { Settings } from "@/lib/game/settings";
import { CELL_UNITS, UNITS, findConflicts } from "@/lib/sudoku";
import Cell from "./Cell";
import Fireflies, { type Cheer } from "./Fireflies";

interface BoardProps {
  game: GameState;
  settings: Settings;
  ready: boolean;
  onTap: (cell: number) => void;
  cheer: Cheer | null;
  children?: React.ReactNode;
}

export default function Board({ game, settings, ready, onTap, cheer, children }: BoardProps) {
  const { values, puzzle, notes, selected, solution, flash, completed, lockedDigit, paused } = game;

  const conflicts = useMemo(() => findConflicts(values), [values]);

  const highlightDigit = lockedDigit ?? (selected !== null ? values[selected] : 0);
  const selUnits = selected !== null ? CELL_UNITS[selected] : null;

  // Cells swept by a row/column/box completion, with a ripple delay from the placed cell.
  const sweep = useMemo(() => {
    const map = new Map<number, number>();
    if (!flash || flash.units.length === 0) return map;
    const fr = Math.floor(flash.cell / 9);
    const fc = flash.cell % 9;
    for (const u of flash.units) {
      for (const i of UNITS[u]) {
        const dist = Math.abs(Math.floor(i / 9) - fr) + Math.abs((i % 9) - fc);
        map.set(i, Math.min(map.get(i) ?? Infinity, dist * 45));
      }
    }
    return map;
  }, [flash]);

  return (
    <div className="board-size relative mx-auto [container-type:inline-size]">
      <div
        role="grid"
        aria-label="Sudoku board"
        className="board grid grid-cols-9 overflow-hidden rounded-xl border-2 border-line-strong bg-surface shadow-[var(--shadow)]"
      >
        {values.map((value, i) => {
          const given = puzzle[i] !== 0;
          const wrong = settings.checkMistakes && !given && value !== 0 && value !== solution[i];
          const inUnit =
            settings.highlightUnits &&
            selUnits !== null &&
            i !== selected &&
            CELL_UNITS[i].some((u, k) => u === selUnits[k]);
          const isFlashCell = flash !== null && flash.cell === i;
          return (
            <Cell
              key={i}
              index={i}
              value={value}
              given={given}
              notes={notes[i]}
              selected={i === selected}
              inUnit={inUnit}
              match={settings.highlightMatches && highlightDigit !== 0 && value === highlightDigit && i !== selected}
              highlightDigit={settings.highlightMatches ? highlightDigit : 0}
              error={(conflicts[i] && !given) || wrong}
              pop={isFlashCell && !flash.wrong ? flash.key : 0}
              shake={isFlashCell && flash.wrong && settings.checkMistakes ? flash.key : 0}
              sweepDelay={sweep.get(i) ?? null}
              winDelay={completed ? (Math.floor(i / 9) + (i % 9)) * 40 : null}
              hidden={!ready || paused}
              onTap={onTap}
            />
          );
        })}
      </div>
      <Fireflies cheer={cheer} />
      {children}
    </div>
  );
}
