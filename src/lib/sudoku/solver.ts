/**
 * Bitmask backtracking solver with "minimum remaining values" ordering.
 * Fast enough to check uniqueness hundreds of times per puzzle generation.
 */
import { CELLS, boxOf, colOf, digitBit, maskDigits, popcount, rowOf, type Grid } from "./board.ts";
import { shuffle, type Rng } from "./rng.ts";

interface SearchOptions {
  /** Stop after this many solutions have been found. */
  limit: number;
  /** When provided, digits are tried in random order (used to build random full grids). */
  rng?: Rng;
}

interface SearchResult {
  count: number;
  first: Grid | null;
}

function search(input: readonly number[], { limit, rng }: SearchOptions): SearchResult {
  const grid = input.slice();
  const rows = new Array<number>(9).fill(0);
  const cols = new Array<number>(9).fill(0);
  const boxes = new Array<number>(9).fill(0);

  for (let i = 0; i < CELLS; i++) {
    const v = grid[i];
    if (!v) continue;
    const bit = digitBit(v);
    const r = rowOf(i), c = colOf(i), b = boxOf(i);
    // A duplicate among the givens means there is no solution.
    if ((rows[r] | cols[c] | boxes[b]) & bit) return { count: 0, first: null };
    rows[r] |= bit;
    cols[c] |= bit;
    boxes[b] |= bit;
  }

  const result: SearchResult = { count: 0, first: null };

  const recurse = (): boolean => {
    // Pick the empty cell with the fewest candidates.
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < CELLS; i++) {
      if (grid[i]) continue;
      const mask = ~(rows[rowOf(i)] | cols[colOf(i)] | boxes[boxOf(i)]) & 0x1ff;
      const n = popcount(mask);
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n <= 1) break;
      }
    }

    if (best === -1) {
      result.count++;
      if (!result.first) result.first = grid.slice();
      return result.count >= limit;
    }
    if (bestCount === 0) return false;

    const r = rowOf(best), c = colOf(best), b = boxOf(best);
    const digits = maskDigits(bestMask);
    if (rng) shuffle(digits, rng);
    for (const d of digits) {
      const bit = digitBit(d);
      grid[best] = d;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      const stop = recurse();
      rows[r] &= ~bit;
      cols[c] &= ~bit;
      boxes[b] &= ~bit;
      grid[best] = 0;
      if (stop) return true;
    }
    return false;
  };

  recurse();
  return result;
}

/** Number of solutions, counting no further than `limit` (default 2 — enough to test uniqueness). */
export function countSolutions(grid: readonly number[], limit = 2): number {
  return search(grid, { limit }).count;
}

export function hasUniqueSolution(grid: readonly number[]): boolean {
  return countSolutions(grid, 2) === 1;
}

/** Returns a solution, or null if the grid is unsolvable. */
export function solve(grid: readonly number[]): Grid | null {
  return search(grid, { limit: 1 }).first;
}

/** A random, completely filled valid grid. */
export function randomSolvedGrid(rng: Rng): Grid {
  const solved = search(new Array<number>(CELLS).fill(0), { limit: 1, rng }).first;
  if (!solved) throw new Error("Failed to build a solved grid");
  return solved;
}
