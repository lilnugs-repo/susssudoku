/** Tiny, failure-tolerant localStorage helpers (private mode / quota errors are ignored). */
export const STORAGE_KEYS = {
  game: "susssudoku:game:v1",
  settings: "susssudoku:settings:v1",
  stats: "susssudoku:stats:v1",
} as const;

export function readJSON<T = unknown>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the game still works, it just won't persist */
  }
}
