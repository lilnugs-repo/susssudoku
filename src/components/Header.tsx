"use client";

import type { Theme } from "@/lib/game/settings";
import { CupIcon, GearIcon, HeartIcon, MoonIcon, SunIcon } from "./Icons";

interface Props {
  theme: Theme;
  onCycleTheme: () => void;
  onSettings: () => void;
}

const NEXT_LABEL: Record<Theme, string> = { dark: "Switch to light theme", light: "Switch to cozy theme", cozy: "Switch to dark theme" };

export default function Header({ theme, onCycleTheme, onSettings }: Props) {
  const iconBtn =
    "grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink active:scale-95";
  return (
    <header className="header-size mx-auto flex items-center justify-between">
      <div className="leading-none">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight sm:text-4xl">
          Sudoku
        </h1>
        <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[0.8rem] font-semibold text-muted sm:text-sm">
          made with
          <HeartIcon width={13} height={13} className="anim-heart text-accent" />
          for <span lang="ne" className="font-name text-[1.05rem] leading-none text-accent sm:text-[1.15rem]">सुस्मिता</span>
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={iconBtn} onClick={onCycleTheme} aria-label={NEXT_LABEL[theme]} title={NEXT_LABEL[theme]}>
          {theme === "light" ? <SunIcon /> : theme === "cozy" ? <CupIcon /> : <MoonIcon />}
        </button>
        <button type="button" className={iconBtn} onClick={onSettings} aria-label="Settings" title="Settings">
          <GearIcon />
        </button>
      </div>
    </header>
  );
}
