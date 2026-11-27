import type { Difficulty } from "../sudoku/index.ts";

export type Theme = "light" | "dark" | "cozy";
export const THEMES: readonly Theme[] = ["dark", "light", "cozy"];

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
  /** Bumped when the default theme changes, so old saved defaults get the new one once. */
  themeVersion?: number;
}

/** v2: dark became the default theme. */
export const THEME_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  checkMistakes: true,
  highlightMatches: true,
  highlightUnits: true,
  showTimer: true,
  lastDifficulty: "easy",
  themeVersion: THEME_VERSION,
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
