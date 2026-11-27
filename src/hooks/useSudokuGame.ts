"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS,
  EMPTY_STATS,
  THEMES,
  THEME_VERSION,
  type Settings,
  type Stats,
} from "@/lib/game/settings";
import { createGame, parseSavedGame, reducer, type GameState } from "@/lib/game/state";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/game/storage";
import { generatePuzzle, type Difficulty } from "@/lib/sudoku";

/** Placeholder state used for the very first (server) render, before we know what to load. */
const BLANK: GameState = createGame({
  puzzle: new Array(81).fill(0),
  solution: new Array(81).fill(0),
  difficulty: "easy",
  clues: 0,
  seed: 0,
});

function loadSettings(): Settings {
  const saved = readJSON<Partial<Settings>>(STORAGE_KEYS.settings) ?? {};
  const merged = { ...DEFAULT_SETTINGS, ...saved };
  // Settings saved before dark became the default move to dark once.
  if (saved.themeVersion !== THEME_VERSION || !THEMES.includes(merged.theme)) {
    merged.theme = DEFAULT_SETTINGS.theme;
    merged.themeVersion = THEME_VERSION;
  }
  return merged;
}

function loadStats(): Stats {
  const saved = readJSON<Partial<Stats>>(STORAGE_KEYS.stats) ?? {};
  return {
    easy: { ...EMPTY_STATS.easy, ...saved.easy },
    medium: { ...EMPTY_STATS.medium, ...saved.medium },
    hard: { ...EMPTY_STATS.hard, ...saved.hard },
  };
}

export function useSudokuGame() {
  const [game, dispatch] = useReducer(reducer, BLANK);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const startedRef = useRef<string | null>(null);

  // Load (or create) the game once on the client.
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setStats(loadStats());
    const saved = parseSavedGame(readJSON(STORAGE_KEYS.game));
    if (saved) {
      startedRef.current = saved.id;
      dispatch({ type: "restore", state: saved });
    } else {
      dispatch({ type: "new", puzzle: generatePuzzle(s.lastDifficulty) });
    }
    setReady(true);
  }, []);

  // Persist the game on every change (cheap: a few KB).
  useEffect(() => {
    if (!ready) return;
    const { flash: _flash, message: _message, ...persisted } = game;
    void _flash;
    void _message;
    writeJSON(STORAGE_KEYS.game, persisted);
  }, [game, ready]);

  // Persist settings and apply the theme to <html>.
  useEffect(() => {
    if (!ready) return;
    writeJSON(STORAGE_KEYS.settings, settings);
    document.documentElement.dataset.theme = settings.theme;
  }, [settings, ready]);

  // Count a game as "played" the first time a move is made in it.
  useEffect(() => {
    if (!ready || game.history.length === 0 || startedRef.current === game.id) return;
    startedRef.current = game.id;
    setStats((prev) => {
      const next = {
        ...prev,
        [game.difficulty]: { ...prev[game.difficulty], played: prev[game.difficulty].played + 1 },
      };
      writeJSON(STORAGE_KEYS.stats, next);
      return next;
    });
  }, [ready, game.history.length, game.id, game.difficulty]);

  // Record wins.
  useEffect(() => {
    if (!ready || !game.completed || game.statsRecorded) return;
    setStats((prev) => {
      const lvl = prev[game.difficulty];
      const next = {
        ...prev,
        [game.difficulty]: {
          played: Math.max(lvl.played, lvl.won + 1),
          won: lvl.won + 1,
          bestTime: lvl.bestTime === null ? game.elapsed : Math.min(lvl.bestTime, game.elapsed),
        },
      };
      writeJSON(STORAGE_KEYS.stats, next);
      return next;
    });
    dispatch({ type: "statsRecorded" });
  }, [ready, game.completed, game.statsRecorded, game.difficulty, game.elapsed]);

  // Timer.
  const running = ready && !game.paused && !game.completed;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Auto-pause when the tab/app goes to the background.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const newGame = useCallback((difficulty: Difficulty) => {
    setSettings((s) => ({ ...s, lastDifficulty: difficulty }));
    dispatch({ type: "new", puzzle: generatePuzzle(difficulty) });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return { game, dispatch, ready, settings, updateSettings, stats, newGame };
}
