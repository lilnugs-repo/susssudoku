"use client";

import { BulbIcon, EraseIcon, PencilIcon, PlusIcon, UndoIcon } from "./Icons";

interface ToolbarProps {
  canUndo: boolean;
  notesMode: boolean;
  disabled: boolean;
  onUndo: () => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  onNew: () => void;
}

function Tool({
  label,
  shortcut,
  onClick,
  disabled,
  active,
  children,
  badge,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={[
        "tool-btn group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-xs font-semibold transition-all duration-150",
        "active:scale-95 disabled:opacity-35",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
      ].join(" ")}
    >
      <span className="relative">
        {children}
        {badge !== undefined && (
          <span
            className={`absolute -right-4 -top-2 rounded-full px-1.5 py-px text-[0.6rem] font-extrabold leading-tight ${
              active ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"
            }`}
          >
            {badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}

export default function Toolbar(p: ToolbarProps) {
  return (
    <div className="flex w-full items-stretch justify-between gap-1">
      <Tool label="Undo" shortcut="Z" onClick={p.onUndo} disabled={p.disabled || !p.canUndo}>
        <UndoIcon />
      </Tool>
      <Tool label="Erase" shortcut="Backspace" onClick={p.onErase} disabled={p.disabled}>
        <EraseIcon />
      </Tool>
      <Tool
        label="Notes"
        shortcut="N"
        onClick={p.onToggleNotes}
        disabled={p.disabled}
        active={p.notesMode}
        badge={p.notesMode ? "ON" : "OFF"}
      >
        <PencilIcon />
      </Tool>
      <Tool label="Hint" shortcut="H" onClick={p.onHint} disabled={p.disabled}>
        <BulbIcon />
      </Tool>
      <Tool label="New" onClick={p.onNew}>
        <PlusIcon />
      </Tool>
    </div>
  );
}
