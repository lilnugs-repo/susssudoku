import type { Difficulty } from "../sudoku/index.ts";

export type Theme = "light" | "dark" | "cozy";
export const THEMES: readonly Theme[] = ["light", "cozy", "dark"];

export interface Settings {
  theme: Theme;
  /** Mark wrong digits in red and show the mistake counter. */
  checkMistakes: boolean;
  /** Highlight every cell holding the selected digit. */
  highlightMatches: boolean;
  /** Highlight the selected cell's row, column and box. */
  highlightUnits: boolean;
  showTimer: boolean;
  lastDifficulty: Difficulty;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  checkMistakes: true,
  highlightMatches: true,
  highlightUnits: true,
  showTimer: true,
  lastDifficulty: "easy",
};

export interface LevelStats {
  played: number;
  won: number;
  bestTime: number | null;
}
export type Stats = Record<Difficulty, LevelStats>;

export const EMPTY_STATS: Stats = {
  easy: { played: 0, won: 0, bestTime: null },
  medium: { played: 0, won: 0, bestTime: null },
  hard: { played: 0, won: 0, bestTime: null },
};
