/**
 * Pure game state + reducer. No React, no browser APIs — easy to reason about and test.
 */
import {
  CELLS,
  PEERS,
  completedUnitsAt,
  describeStep,
  digitBit,
  findLogicalStep,
  isValidGridShape,
  type Difficulty,
  type Puzzle,
} from "../sudoku/index.ts";

export const HISTORY_LIMIT = 200;

interface Snapshot {
  values: number[];
  notes: number[];
}

/** Transient info used to drive micro-animations. */
export interface Flash {
  key: number;
  cell: number;
  /** Units (0-26) completed by the last move. */
  units: number[];
  /** The placed digit does not match the solution. */
  wrong: boolean;
}

export interface GameState {
  version: 1;
  id: string;
  difficulty: Difficulty;
  puzzle: number[];
  solution: number[];
  values: number[];
  /** Pencil marks: 9-bit mask per cell. */
  notes: number[];
  selected: number | null;
  notesMode: boolean;
  /** Number-first mode: when set, tapping a cell enters this digit. */
  lockedDigit: number | null;
  mistakes: number;
  hintsUsed: number;
  /** Seconds played. */
  elapsed: number;
  paused: boolean;
  completed: boolean;
  statsRecorded: boolean;
  history: Snapshot[];
  flash: Flash | null;
  message: { key: number; text: string } | null;
}

export type Action =
  | { type: "new"; puzzle: Puzzle }
  | { type: "restore"; state: GameState }
  | { type: "restart" }
  | { type: "select"; cell: number | null }
  | { type: "tapCell"; cell: number }
  | { type: "move"; dr: number; dc: number }
  | { type: "input"; digit: number }
  | { type: "erase" }
  | { type: "undo" }
  | { type: "toggleNotes" }
  | { type: "lockDigit"; digit: number | null }
  | { type: "hint" }
  | { type: "tick" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "statsRecorded" }
  | { type: "dismissMessage" };

let counter = 0;
const nextKey = () => ++counter + Date.now();

export function createGame(p: Puzzle): GameState {
  return {
    version: 1,
    id: `${p.difficulty}-${p.seed.toString(36)}-${Date.now().toString(36)}`,
    difficulty: p.difficulty,
    puzzle: p.puzzle.slice(),
    solution: p.solution.slice(),
    values: p.puzzle.slice(),
    notes: new Array<number>(CELLS).fill(0),
    selected: null,
    notesMode: false,
    lockedDigit: null,
    mistakes: 0,
    hintsUsed: 0,
    elapsed: 0,
    paused: false,
    completed: false,
    statsRecorded: false,
    history: [],
    flash: null,
    message: null,
  };
}

const snapshot = (s: GameState): Snapshot => ({ values: s.values, notes: s.notes });

function pushHistory(s: GameState): Snapshot[] {
  const h = [...s.history, snapshot(s)];
  return h.length > HISTORY_LIMIT ? h.slice(h.length - HISTORY_LIMIT) : h;
}

const isPlaying = (s: GameState) => !s.completed && !s.paused;

/** Places a final digit (or clears it when the same digit is entered again). */
function placeValue(s: GameState, cell: number, digit: number, viaHint = false): GameState {
  if (s.puzzle[cell]) return s;
  if (s.values[cell] === digit && !viaHint) return clearCell(s, cell);

  const values = s.values.slice();
  const notes = s.notes.slice();
  values[cell] = digit;
  notes[cell] = 0;
  const bit = digitBit(digit);
  for (const p of PEERS[cell]) notes[p] &= ~bit;

  const correct = digit === s.solution[cell];
  const completed = values.every((v, i) => v === s.solution[i]);
  return {
    ...s,
    history: pushHistory(s),
    values,
    notes,
    selected: cell,
    mistakes: s.mistakes + (correct ? 0 : 1),
    completed,
    flash: {
      key: nextKey(),
      cell,
      units: correct ? completedUnitsAt(values, s.solution, cell) : [],
      wrong: !correct,
    },
  };
}

function toggleNote(s: GameState, cell: number, digit: number): GameState {
  if (s.puzzle[cell] || s.values[cell]) return s;
  const notes = s.notes.slice();
  notes[cell] ^= digitBit(digit);
  return { ...s, history: pushHistory(s), notes, selected: cell, flash: null };
}

function clearCell(s: GameState, cell: number): GameState {
  if (s.puzzle[cell] || (!s.values[cell] && !s.notes[cell])) return s;
  const values = s.values.slice();
  const notes = s.notes.slice();
  values[cell] = 0;
  notes[cell] = 0;
  return { ...s, history: pushHistory(s), values, notes, flash: null };
}

function enter(s: GameState, cell: number, digit: number): GameState {
  return s.notesMode ? toggleNote(s, cell, digit) : placeValue(s, cell, digit);
}

function hint(s: GameState): GameState {
  const say = (text: string) => ({ key: nextKey(), text });

  // 1. Fix a wrong entry first — the selected one if it is wrong, else any.
  const wrong = (i: number) => s.values[i] !== 0 && s.values[i] !== s.solution[i];
  const wrongCell =
    s.selected !== null && wrong(s.selected) ? s.selected : s.values.findIndex((_, i) => wrong(i));
  if (wrongCell !== -1) {
    const next = placeValue(s, wrongCell, s.solution[wrongCell], true);
    return {
      ...next,
      mistakes: s.mistakes,
      hintsUsed: s.hintsUsed + 1,
      message: say(`That cell should be ${s.solution[wrongCell]} — fixed it for you.`),
    };
  }

  // 2. A logical single, computed from the actual board (not the user's notes).
  const step = findLogicalStep(s.values);
  if (step) {
    const next = placeValue(s, step.cell, step.digit, true);
    return { ...next, hintsUsed: s.hintsUsed + 1, message: say(describeStep(step)) };
  }

  // 3. Fallback: reveal the selected empty cell, or the first empty one.
  const target =
    s.selected !== null && !s.values[s.selected] ? s.selected : s.values.findIndex((v) => !v);
  if (target === -1) return s;
  const next = placeValue(s, target, s.solution[target], true);
  return {
    ...next,
    hintsUsed: s.hintsUsed + 1,
    message: say(`No simple single here — revealed a ${s.solution[target]}.`),
  };
}

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "new":
      return createGame(a.puzzle);
    case "restore":
      return a.state;
    case "restart":
      return {
        ...s,
        values: s.puzzle.slice(),
        notes: new Array<number>(CELLS).fill(0),
        selected: null,
        lockedDigit: null,
        notesMode: false,
        mistakes: 0,
        hintsUsed: 0,
        elapsed: 0,
        paused: false,
        completed: false,
        statsRecorded: false,
        history: [],
        flash: null,
        message: null,
      };
    case "select":
      return { ...s, selected: a.cell };
    case "tapCell": {
      if (!isPlaying(s)) return s;
      if (s.lockedDigit !== null && !s.puzzle[a.cell]) {
        return enter(s, a.cell, s.lockedDigit);
      }
      return { ...s, selected: a.cell };
    }
    case "move": {
      if (!isPlaying(s)) return s;
      if (s.selected === null) return { ...s, selected: 40 };
      const r = (Math.floor(s.selected / 9) + a.dr + 9) % 9;
      const c = ((s.selected % 9) + a.dc + 9) % 9;
      return { ...s, selected: r * 9 + c };
    }
    case "input": {
      if (!isPlaying(s)) return s;
      // A locked digit takes priority on its own key/button: switch the lock instead.
      if (s.lockedDigit !== null) return { ...s, lockedDigit: s.lockedDigit === a.digit ? null : a.digit };
      if (s.selected === null) return { ...s, lockedDigit: a.digit };
      return enter(s, s.selected, a.digit);
    }
    case "erase":
      if (!isPlaying(s) || s.selected === null) return s;
      return clearCell(s, s.selected);
    case "undo": {
      if (!isPlaying(s) || s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return { ...s, values: prev.values, notes: prev.notes, history: s.history.slice(0, -1), flash: null };
    }
    case "toggleNotes":
      return { ...s, notesMode: !s.notesMode };
    case "lockDigit":
      return { ...s, lockedDigit: a.digit };
    case "hint":
      return isPlaying(s) ? hint(s) : s;
    case "tick":
      return isPlaying(s) ? { ...s, elapsed: s.elapsed + 1 } : s;
    case "pause":
      return s.completed ? s : { ...s, paused: true };
    case "resume":
      return { ...s, paused: false };
    case "statsRecorded":
      return { ...s, statsRecorded: true };
    case "dismissMessage":
      return { ...s, message: null };
  }
}

/** Validates data read back from storage before trusting it. */
export function parseSavedGame(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<GameState>;
  if (s.version !== 1) return null;
  if (!["easy", "medium", "hard"].includes(s.difficulty as string)) return null;
  if (!isValidGridShape(s.puzzle) || !isValidGridShape(s.solution) || !isValidGridShape(s.values)) return null;
  if (s.solution.some((v) => v === 0)) return null;
  if (!Array.isArray(s.notes) || s.notes.length !== CELLS) return null;
  const history = Array.isArray(s.history)
    ? s.history.filter((h) => h && isValidGridShape(h.values) && Array.isArray(h.notes))
    : [];
  return {
    ...(s as GameState),
    history,
    selected: typeof s.selected === "number" ? s.selected : null,
    lockedDigit: typeof s.lockedDigit === "number" ? s.lockedDigit : null,
    elapsed: Number(s.elapsed) || 0,
    mistakes: Number(s.mistakes) || 0,
    hintsUsed: Number(s.hintsUsed) || 0,
    // Always come back paused-free but with no stale animation/message.
    paused: false,
    flash: null,
    message: null,
  };
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}
