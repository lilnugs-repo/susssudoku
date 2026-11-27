# Sudoku for सुस्मिता ♥

A cozy, mobile-first Sudoku web app, made with love for **सुस्मिता** (Sussmita).
Built with Next.js (App Router), TypeScript and Tailwind CSS, ready to deploy on Vercel.

## Features

- **Opens straight into a game.** Every puzzle is generated on the device and has exactly one solution.
- **Easy / Medium / Hard.** Easy and Medium can be finished with singles. Hard always needs more advanced logic.
- **Smart highlighting.** Shows the selected cell, its row, column and box, matching digits, and conflicts.
- **Two ways to enter numbers.**
  - *Cell first:* tap a cell, then a number.
  - *Number first:* long-press a number (or tap one with no cell selected) to lock it, then tap cells.
- **Notes (pencil marks).** They are cleared from related cells automatically when a digit is placed.
- **Game tools.** Undo, Erase, Hint, New game and Restart.
  - A hint first fixes a wrong digit. Otherwise it fills the next logical single and explains why.
- **Mistake checking you can turn off.** A pausable timer that pauses itself when the app goes to the background.
- **A junkiri (firefly) for every right answer.** Each correct number she places sends a glowing firefly across the board. A praise bubble also appears, such as "Well done, Junkiri!", using a different phrase each time. Nicknames are shuffled so all seven appear before any repeats (see `src/lib/game/praise.ts`). Hints don't earn praise, and both effects turn off when "Check mistakes" is off.
- **Three themes.** Dark (default), Light and Cozy. Small animations, a celebration screen when you win, and best times saved per level.
- **Your game is saved** in `localStorage`, including the board, notes, timer, difficulty and undo history.

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys | Move |
| `1`–`9` | Enter digit |
| `Backspace` / `Delete` / `0` | Erase |
| `N` | Toggle notes |
| `Z` | Undo |
| `H` | Hint |
| `P` | Pause / resume |
| `Esc` | Deselect / unlock digit |

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (type-checks + lints)
npm run lint
npm run test:engine  # generates puzzles and checks they have one solution and correct hints
```

## Deploy to Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. Vercel detects Next.js automatically, so no settings are needed. Click **Deploy**.

## Project layout

```
src/
  app/                 layout (fonts, viewport, theme bootstrap), page, global styles, icon
  components/          SudokuApp, Board, Cell, Keypad, Toolbar, StatusBar, Header,
                       Sheet, NewGameSheet, SettingsSheet, Celebration, Confetti, Icons
  hooks/useSudokuGame  React wiring: reducer, timer, persistence, stats, settings
  lib/sudoku/          engine: board geometry, bitmask solver, singles logic, generator
  lib/game/            pure game reducer, settings/stats types, storage helpers
scripts/verify-engine.ts
```
