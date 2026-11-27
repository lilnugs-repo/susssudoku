/**
 * Board geometry & validation helpers.
 *
 * A grid is a flat array of 81 numbers (row-major). 0 means "empty".
 * Candidate sets are 9-bit masks where bit (d - 1) represents digit d.
 */

export type Grid = number[];

export const CELLS = 81;
export const ALL_DIGITS_MASK = 0x1ff;

export const rowOf = (i: number): number => Math.floor(i / 9);
export const colOf = (i: number): number => i % 9;
export const boxOf = (i: number): number =>
  Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

export const digitBit = (d: number): number => 1 << (d - 1);

/** 27 units: rows 0-8, columns 9-17, boxes 18-26. */
export const UNITS: readonly (readonly number[])[] = (() => {
  const units: number[][] = [];
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let b = 0; b < 9; b++) {
    const r0 = Math.floor(b / 3) * 3;
    const c0 = (b % 3) * 3;
    const cells: number[] = [];
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((r0 + dr) * 9 + c0 + dc);
    units.push(cells);
  }
  return units;
})();

export type UnitKind = "row" | "column" | "box";
export const unitKind = (u: number): UnitKind => (u < 9 ? "row" : u < 18 ? "column" : "box");

/** For each cell, the indexes of its row, column and box units. */
export const CELL_UNITS: readonly (readonly [number, number, number])[] = Array.from(
  { length: CELLS },
  (_, i) => [rowOf(i), 9 + colOf(i), 18 + boxOf(i)] as const,
);

/** For each cell, the 20 other cells sharing a row, column or box. */
export const PEERS: readonly (readonly number[])[] = Array.from({ length: CELLS }, (_, i) => {
  const set = new Set<number>();
  for (const u of CELL_UNITS[i]) for (const j of UNITS[u]) if (j !== i) set.add(j);
  return [...set];
});

export function popcount(mask: number): number {
  let n = 0;
  while (mask) {
    mask &= mask - 1;
    n++;
  }
  return n;
}

/** Digits (1-9) present in a mask, ascending. */
export function maskDigits(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & digitBit(d)) out.push(d);
  return out;
}

/** Lowest digit in a mask (assumes mask != 0). */
export function firstDigit(mask: number): number {
  return 31 - Math.clz32(mask & -mask) + 1;
}

/** Mask of digits that may legally go in cell i given the other filled cells. */
export function candidatesAt(grid: readonly number[], i: number): number {
  let used = 0;
  for (const p of PEERS[i]) if (grid[p]) used |= digitBit(grid[p]);
  return ALL_DIGITS_MASK & ~used;
}

/** Boolean per cell: true when the cell's digit is duplicated in a row, column or box. */
export function findConflicts(grid: readonly number[]): boolean[] {
  const out = new Array<boolean>(CELLS).fill(false);
  for (const unit of UNITS) {
    const seen = new Map<number, number>();
    for (const i of unit) {
      const v = grid[i];
      if (!v) continue;
      const prev = seen.get(v);
      if (prev !== undefined) {
        out[i] = true;
        out[prev] = true;
      } else {
        seen.set(v, i);
      }
    }
  }
  return out;
}

/** True when the grid is fully and validly filled. */
export function isSolved(grid: readonly number[]): boolean {
  if (grid.length !== CELLS || grid.some((v) => v < 1 || v > 9)) return false;
  return !findConflicts(grid).some(Boolean);
}

/** Units containing cell i that are completely and correctly filled. */
export function completedUnitsAt(
  grid: readonly number[],
  solution: readonly number[],
  i: number,
): number[] {
  return CELL_UNITS[i].filter((u) => UNITS[u].every((j) => grid[j] !== 0 && grid[j] === solution[j]));
}

export function isValidGridShape(value: unknown): value is Grid {
  return (
    Array.isArray(value) &&
    value.length === CELLS &&
    value.every((v) => Number.isInteger(v) && v >= 0 && v <= 9)
  );
}
