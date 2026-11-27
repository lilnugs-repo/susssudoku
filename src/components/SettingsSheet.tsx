"use client";

import { THEMES, type Settings, type Stats, type Theme } from "@/lib/game/settings";
import { DIFFICULTIES } from "@/lib/sudoku";
import { CupIcon, MoonIcon, SunIcon } from "./Icons";
import Sheet from "./Sheet";
import { DIFFICULTY_LABEL } from "./StatusBar";

const THEME_META: Record<Theme, { label: string; icon: React.ReactNode }> = {
  light: { label: "Light", icon: <SunIcon width={18} height={18} /> },
  cozy: { label: "Cozy", icon: <CupIcon width={18} height={18} /> },
  dark: { label: "Dark", icon: <MoonIcon width={18} height={18} /> },
};

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-line"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </label>
  );
}

const SHORTCUTS: [string, string][] = [
  ["← ↑ → ↓", "Move"],
  ["1–9", "Enter digit"],
  ["⌫ / Del", "Erase"],
  ["N", "Notes mode"],
  ["Z", "Undo"],
  ["H", "Hint"],
  ["P", "Pause"],
  ["Esc", "Deselect"],
];

interface Props {
  open: boolean;
  settings: Settings;
  stats: Stats;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsSheet({ open, settings, stats, onChange, onClose }: Props) {
  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <div className="mb-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={settings.theme === t}
            onClick={() => onChange({ theme: t })}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 text-sm font-bold transition active:scale-95 ${
              settings.theme === t ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"
            }`}
          >
            {THEME_META[t].icon}
            {THEME_META[t].label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-line">
        <Toggle
          label="Check mistakes"
          hint="Mark wrong digits in red and count mistakes."
          checked={settings.checkMistakes}
          onChange={(v) => onChange({ checkMistakes: v })}
        />
        <Toggle
          label="Highlight matching digits"
          checked={settings.highlightMatches}
          onChange={(v) => onChange({ highlightMatches: v })}
        />
        <Toggle
          label="Highlight row, column & box"
          checked={settings.highlightUnits}
          onChange={(v) => onChange({ highlightUnits: v })}
        />
        <Toggle label="Show timer" checked={settings.showTimer} onChange={(v) => onChange({ showTimer: v })} />
      </div>

      <h3 className="mt-5 mb-2 text-sm font-extrabold uppercase tracking-wide text-muted">How to play</h3>
      <ul className="space-y-1.5 text-sm">
        <li>
          <b>Cell first:</b> tap a cell, then a number.
        </li>
        <li>
          <b>Number first:</b> long-press a number (or tap one with no cell selected) to lock it, then tap cells
          to fill them. Tap the number again to unlock.
        </li>
        <li>
          <b>Notes:</b> switch Notes on to pencil in candidates. They tidy themselves up as you place digits.
        </li>
      </ul>

      <h3 className="mt-5 mb-2 hidden text-sm font-extrabold uppercase tracking-wide text-muted sm:block">
        Keyboard
      </h3>
      <dl className="hidden grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid">
        {SHORTCUTS.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt>
              <kbd className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-bold">{k}</kbd>
            </dt>
            <dd className="text-muted">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-5 mb-2 text-sm font-extrabold uppercase tracking-wide text-muted">Your stats</h3>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {DIFFICULTIES.map((d) => (
          <div key={d} className="rounded-2xl bg-surface-2 px-2 py-2.5">
            <div className="font-extrabold">{DIFFICULTY_LABEL[d]}</div>
            <div className="tnum text-muted">
              {stats[d].won} won
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
