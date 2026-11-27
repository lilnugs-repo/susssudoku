/**
 * Puzzle generator.
 *
 * 1. Build a random solved grid.
 * 2. Remove clues in symmetric pairs, keeping a removal only if the puzzle
 *    still has exactly one solution (and, for easier levels, can still be
 *    finished with singles).
 * 3. Grade the result and retry a few times to land in the target band.
 */
import { CELLS, type Grid } from "./board.ts";
import { solveWithSingles } from "./logic.ts";
import { createRng, shuffle, type Rng } from "./rng.ts";
import { hasUniqueSolution, randomSolvedGrid } from "./solver.ts";

export type Difficulty = "easy" | "medium" | "hard";
export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  clues: number;
  seed: number;
}

interface Profile {
  /** Stop removing clues once we reach this many. */
  targetClues: number;
  /** Every intermediate puzzle must stay solvable with singles. */
  singlesOnly: boolean;
  /** Hard puzzles should need more than singles. */
  requireAdvanced: boolean;
  attempts: number;
}

const PROFILES: Record<Difficulty, Profile> = {
  easy: { targetClues: 38, singlesOnly: true, requireAdvanced: false, attempts: 1 },
  medium: { targetClues: 30, singlesOnly: true, requireAdvanced: false, attempts: 4 },
  hard: { targetClues: 24, singlesOnly: false, requireAdvanced: true, attempts: 12 },
};

function carve(solution: Grid, profile: Profile, rng: Rng): Grid {
  const puzzle = solution.slice();
  let clues = CELLS;
  // Process symmetric pairs (i, 80 - i); the center cell pairs with itself.
  const order = shuffle(Array.from({ length: 41 }, (_, i) => i), rng);
  for (const i of order) {
    if (clues <= profile.targetClues) break;
    const j = CELLS - 1 - i;
    const pair = i === j ? [i] : [i, j];
    const saved = pair.map((k) => puzzle[k]);
    for (const k of pair) puzzle[k] = 0;
    const ok =
      hasUniqueSolution(puzzle) && (!profile.singlesOnly || solveWithSingles(puzzle).solved);
    if (ok) {
      clues -= pair.length;
    } else {
      pair.forEach((k, n) => (puzzle[k] = saved[n]));
    }
  }
  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty, seed?: number): Puzzle {
  const baseSeed = seed ?? (Math.random() * 2 ** 32) >>> 0;
  const rng = createRng(baseSeed);
  const profile = PROFILES[difficulty];

  let best: { puzzle: Grid; solution: Grid; score: number } | null = null;
  for (let attempt = 0; attempt < profile.attempts; attempt++) {
    const solution = randomSolvedGrid(rng);
    const puzzle = carve(solution, profile, rng);
    const clues = puzzle.filter(Boolean).length;
    const singles = solveWithSingles(puzzle);

    let score: number;
    if (difficulty === "hard") {
      // Prefer puzzles that need more than singles, then fewer clues.
      score = (singles.solved ? 0 : 100) - clues;
    } else {
      // Closest to the clue target, and (for medium) exercising hidden singles.
      score = -Math.abs(clues - profile.targetClues) + Math.min(singles.hiddenSinglesUsed, 10) * 0.1;
    }

    if (!best || score > best.score) best = { puzzle, solution, score };
    const goodEnough =
      difficulty === "hard" ? !singles.solved : clues <= profile.targetClues + 1;
    if (goodEnough) break;
  }

  // `best` is always set because attempts >= 1.
  const { puzzle, solution } = best!;
  return { puzzle, solution, difficulty, clues: puzzle.filter(Boolean).length, seed: baseSeed };
}
