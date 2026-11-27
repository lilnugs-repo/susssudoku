"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSudokuGame } from "@/hooks/useSudokuGame";
import { createPraiser } from "@/lib/game/praise";
import { THEMES } from "@/lib/game/settings";
import type { Difficulty } from "@/lib/sudoku";
import Board from "./Board";
import Celebration from "./Celebration";
import type { Cheer } from "./Fireflies";
import Header from "./Header";
import { PlayIcon } from "./Icons";
import Keypad from "./Keypad";
import NewGameSheet from "./NewGameSheet";
import SettingsSheet from "./SettingsSheet";
import StatusBar from "./StatusBar";
import Toolbar from "./Toolbar";

type SheetName = "new" | "settings" | null;

export default function SudokuApp() {
  const { game, dispatch, ready, settings, updateSettings, stats, newGame } = useSudokuGame();
  const [sheet, setSheet] = useState<SheetName>(null);
  const [winFor, setWinFor] = useState<string | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);

  // ---- Celebration: only when a game flips to completed during this session.
  const seen = useRef<{ id: string; completed: boolean } | null>(null);
  useEffect(() => {
    if (!ready) return;
    const prev = seen.current;
    seen.current = { id: game.id, completed: game.completed };
    if (prev && prev.id === game.id && !prev.completed && game.completed) {
      const t = window.setTimeout(() => {
        setNoteIndex(Math.floor(Math.random() * 1000));
        setWinFor(game.id);
      }, 1100);
      return () => window.clearTimeout(t);
    }
  }, [ready, game.id, game.completed]);
  const showWin = winFor === game.id && game.completed;

  // ---- Firefly + praise for each correct digit she places herself.
  // Only while "Check mistakes" is on, so turning it off keeps right/wrong hidden.
  const praise = useRef<(() => string) | null>(null);
  const [cheer, setCheer] = useState<Cheer | null>(null);
  const lastCheered = useRef<number | null>(null);
  const flash = game.flash;
  useEffect(() => {
    if (!flash || flash.wrong || flash.byHint || !settings.checkMistakes) return;
    if (lastCheered.current === flash.key) return;
    lastCheered.current = flash.key;
    praise.current ??= createPraiser();
    // On the winning move the celebration screen does the talking.
    setCheer({ key: flash.key, cell: flash.cell, text: game.completed ? null : praise.current() });
  }, [flash, game.completed, settings.checkMistakes]);

  // ---- Toast auto-dismiss.
  useEffect(() => {
    if (!game.message) return;
    const t = window.setTimeout(() => dispatch({ type: "dismissMessage" }), 3400);
    return () => window.clearTimeout(t);
  }, [game.message, dispatch]);

  // ---- Actions.
  const onTap = useCallback((cell: number) => dispatch({ type: "tapCell", cell }), [dispatch]);
  const startNew = useCallback(
    (d: Difficulty) => {
      setSheet(null);
      setWinFor(null);
      newGame(d);
    },
    [newGame],
  );
  const togglePause = useCallback(
    () => dispatch({ type: game.paused ? "resume" : "pause" }),
    [dispatch, game.paused],
  );

  // ---- Keyboard.
  const modalOpen = sheet !== null || showWin;
  useEffect(() => {
    if (!ready || modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      const k = e.key;
      const mod = e.ctrlKey || e.metaKey;
      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      if (moves[k]) {
        e.preventDefault();
        dispatch({ type: "move", dr: moves[k][0], dc: moves[k][1] });
      } else if (/^[1-9]$/.test(k) && !mod) {
        dispatch({ type: "input", digit: Number(k) });
      } else if (k === "Backspace" || k === "Delete" || k === "0") {
        e.preventDefault();
        dispatch({ type: "erase" });
      } else if ((k === "z" || k === "Z") && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "undo" });
      } else if (mod || e.altKey) {
        return;
      } else if (k === "n" || k === "N") {
        dispatch({ type: "toggleNotes" });
      } else if (k === "h" || k === "H") {
        dispatch({ type: "hint" });
      } else if (k === "p" || k === "P") {
        dispatch({ type: game.paused ? "resume" : "pause" });
      } else if (k === "Escape") {
        dispatch({ type: "lockDigit", digit: null });
        dispatch({ type: "select", cell: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, modalOpen, dispatch, game.paused]);

  // ---- Derived.
  const counts = useMemo(() => {
    const c = new Array<number>(10).fill(0);
    for (const v of game.values) c[v]++;
    return c;
  }, [game.values]);
  const hasProgress = game.history.length > 0 && !game.completed;
  const controlsDisabled = !ready || game.paused || game.completed;

  let helper: React.ReactNode = null;
  if (game.lockedDigit !== null) {
    helper = (
      <>
        Placing <b className="tnum text-accent">{game.lockedDigit}</b> — tap cells to fill.{" "}
        <button
          type="button"
          className="font-bold text-accent underline underline-offset-2"
          onClick={() => dispatch({ type: "lockDigit", digit: null })}
        >
          Done
        </button>
      </>
    );
  } else if (game.notesMode) {
    helper = <>Notes on — numbers pencil in candidates.</>;
  } else if (ready && game.history.length === 0 && !game.completed) {
    helper = <>Tip: long-press a number to fill many cells at once.</>;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <Header
        theme={settings.theme}
        onCycleTheme={() => updateSettings({ theme: THEMES[(THEMES.indexOf(settings.theme) + 1) % THEMES.length] })}
        onSettings={() => setSheet("settings")}
      />

      <div className="flex flex-1 flex-col items-center justify-start gap-3 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
        <section className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-1" aria-label="Game">
          <StatusBar
            difficulty={game.difficulty}
            mistakes={game.mistakes}
            showMistakes={settings.checkMistakes}
            elapsed={game.elapsed}
            showTimer={settings.showTimer}
            paused={game.paused}
            completed={game.completed}
            onDifficulty={() => setSheet("new")}
            onTogglePause={togglePause}
          />
          <Board game={game} settings={settings} ready={ready} onTap={onTap} cheer={game.paused ? null : cheer}>
            {game.paused && (
              <button
                type="button"
                onClick={() => dispatch({ type: "resume" })}
                className="anim-fade absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-surface/85 backdrop-blur-md"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-ink shadow-lg">
                  <PlayIcon width={28} height={28} />
                </span>
                <span className="font-display text-2xl font-semibold">Paused</span>
                <span className="text-sm text-muted">Tap to keep playing</span>
              </button>
            )}
            {!ready && (
              <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-muted">
                Shuffling a fresh puzzle…
              </div>
            )}
          </Board>
        </section>

        <section className="panel-size mx-auto flex flex-col gap-2 lg:mx-0" aria-label="Controls">
          <Toolbar
            canUndo={game.history.length > 0}
            notesMode={game.notesMode}
            disabled={controlsDisabled}
            onUndo={() => dispatch({ type: "undo" })}
            onErase={() => dispatch({ type: "erase" })}
            onToggleNotes={() => dispatch({ type: "toggleNotes" })}
            onHint={() => dispatch({ type: "hint" })}
            onNew={() => setSheet("new")}
          />
          <p className="h-5 truncate text-center text-[0.8rem] leading-5 text-muted" aria-live="polite">
            {helper}
          </p>
          <Keypad
            counts={counts}
            notesMode={game.notesMode}
            lockedDigit={game.lockedDigit}
            disabled={controlsDisabled}
            onDigit={(digit) => dispatch({ type: "input", digit })}
            onLock={(digit) => dispatch({ type: "lockDigit", digit })}
          />
          {game.completed && !showWin && (
            <button
              type="button"
              onClick={() => setSheet("new")}
              className="anim-rise mt-1 rounded-2xl bg-accent py-3 font-extrabold text-accent-ink shadow-md active:scale-[0.98]"
            >
              Solved! Start a new puzzle
            </button>
          )}
        </section>
      </div>

      {/* Toast */}
      <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-30 flex justify-center px-4">
        {game.message && (
          <div
            key={game.message.key}
            role="status"
            className="anim-rise pointer-events-auto max-w-sm rounded-2xl bg-ink px-4 py-2.5 text-center text-sm font-semibold text-surface shadow-xl"
            onClick={() => dispatch({ type: "dismissMessage" })}
          >
            💡 {game.message.text}
          </div>
        )}
      </div>

      <NewGameSheet
        open={sheet === "new"}
        current={game.difficulty}
        stats={stats}
        hasProgress={hasProgress}
        onClose={() => setSheet(null)}
        onNew={startNew}
        onRestart={() => {
          setSheet(null);
          setWinFor(null);
          dispatch({ type: "restart" });
        }}
      />
      <SettingsSheet
        open={sheet === "settings"}
        settings={settings}
        stats={stats}
        onChange={updateSettings}
        onClose={() => setSheet(null)}
      />
      {showWin && (
        <Celebration
          difficulty={game.difficulty}
          elapsed={game.elapsed}
          mistakes={game.mistakes}
          hintsUsed={game.hintsUsed}
          level={stats[game.difficulty]}
          noteIndex={noteIndex}
          onPlayAgain={startNew}
          onClose={() => setWinFor(null)}
        />
      )}
    </main>
  );
}
