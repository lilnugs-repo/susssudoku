/**
 * Human-style deduction used for hints and difficulty grading.
 * Implements the two most approachable techniques: naked and hidden singles.
 */
import {
  CELLS,
  PEERS,
  UNITS,
  candidatesAt,
  digitBit,
  firstDigit,
  popcount,
  unitKind,
  type UnitKind,
} from "./board.ts";

export type Technique = "naked-single" | "hidden-single";

export interface LogicalStep {
  cell: number;
  digit: number;
  technique: Technique;
  /** For hidden singles: the unit in which the digit has only one home. */
  unit?: UnitKind;
}

function computeCandidates(grid: readonly number[]): number[] {
  const cands = new Array<number>(CELLS).fill(0);
  for (let i = 0; i < CELLS; i++) if (!grid[i]) cands[i] = candidatesAt(grid, i);
  return cands;
}

function findSingleWith(grid: readonly number[], cands: readonly number[]): LogicalStep | null {
  for (let i = 0; i < CELLS; i++) {
    if (!grid[i] && popcount(cands[i]) === 1) {
      return { cell: i, digit: firstDigit(cands[i]), technique: "naked-single" };
    }
  }
  // Boxes first: hidden singles in a box are the easiest for people to spot.
  const unitOrder = [...UNITS.keys()].sort((a, b) => (b >= 18 ? 1 : 0) - (a >= 18 ? 1 : 0));
  for (const u of unitOrder) {
    for (let d = 1; d <= 9; d++) {
      const bit = digitBit(d);
      let home = -1;
      let count = 0;
      let placed = false;
      for (const i of UNITS[u]) {
        if (grid[i] === d) {
          placed = true;
          break;
        }
        if (!grid[i] && cands[i] & bit) {
          home = i;
          if (++count > 1) break;
        }
      }
      if (!placed && count === 1) {
        return { cell: home, digit: d, technique: "hidden-single", unit: unitKind(u) };
      }
    }
  }
  return null;
}

/** The next cell that can be filled with a single, or null when singles are not enough. */
export function findLogicalStep(grid: readonly number[]): LogicalStep | null {
  return findSingleWith(grid, computeCandidates(grid));
}

export interface SinglesReport {
  solved: boolean;
  steps: number;
  hiddenSinglesUsed: number;
}

/** Tries to finish the puzzle with singles only. */
export function solveWithSingles(input: readonly number[]): SinglesReport {
  const grid = input.slice();
  const cands = computeCandidates(grid);
  let steps = 0;
  let hiddenSinglesUsed = 0;
  for (;;) {
    const step = findSingleWith(grid, cands);
    if (!step) break;
    grid[step.cell] = step.digit;
    cands[step.cell] = 0;
    const bit = digitBit(step.digit);
    for (const p of PEERS[step.cell]) cands[p] &= ~bit;
    steps++;
    if (step.technique === "hidden-single") hiddenSinglesUsed++;
  }
  return { solved: grid.every((v) => v !== 0), steps, hiddenSinglesUsed };
}

export function describeStep(step: LogicalStep): string {
  if (step.technique === "naked-single") {
    return `Only ${step.digit} fits in this cell.`;
  }
  return `${step.digit} has only one place to go in this ${step.unit}.`;
}

