"use client";

import { useEffect, useRef } from "react";

export interface Cheer {
  key: number;
  cell: number;
  text: string | null;
}

/** Smooth curve through points (Catmull-Rom), sampled into many keyframe positions. */
function sampleCurve(pts: [number, number][], perSegment = 10): [number, number][] {
  const out: [number, number][] = [];
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** A wandering path from the placed cell, across the board, out past the far side. */
function flightPath(cell: number, w: number, h: number): [number, number][] {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const start: [number, number] = [((c + 0.5) / 9) * w, ((r + 0.5) / 9) * h];
  // Head toward the side of the board farther from where we start.
  const goRight = c < 4 || (c === 4 && Math.random() < 0.5);
  const endX = goRight ? w * 1.08 : -w * 0.08;
  const pts: [number, number][] = [start];
  const hops = 4;
  for (let i = 1; i <= hops; i++) {
    const t = i / (hops + 1);
    const x = start[0] + (endX - start[0]) * t + (Math.random() - 0.5) * w * 0.18;
    const y = Math.min(h * 0.95, Math.max(h * 0.05, start[1] + (Math.random() - 0.5) * h * 0.55));
    pts.push([x, y]);
  }
  pts.push([endX, Math.min(h * 0.9, Math.max(h * 0.1, pts[pts.length - 1][1] - h * 0.15))]);
  return pts;
}

/** Renders the firefly flight and the praise bubble for each correct placement. */
export default function Fireflies({ cheer }: { cheer: Cheer | null }) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    if (!cheer || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    const path = sampleCurve(flightPath(cheer.cell, w, h));
    const duration = 2300;

    const made: { node: HTMLElement; anim: Animation }[] = [];
    // The firefly, plus a few fading specks of light trailing behind it.
    const parts = [
      { cls: "firefly", delay: 0, scale: 1 },
      { cls: "firefly-trail", delay: 70, scale: 0.6 },
      { cls: "firefly-trail", delay: 140, scale: 0.45 },
      { cls: "firefly-trail", delay: 210, scale: 0.3 },
    ];
    for (const part of parts) {
      const node = document.createElement("span");
      node.className = part.cls;
      el.appendChild(node);
      const n = path.length - 1;
      const frames: Keyframe[] = path.map(([x, y], i) => {
        const t = i / n;
        const fade = t < 0.06 ? t / 0.06 : t > 0.82 ? (1 - t) / 0.18 : 1;
        return {
          offset: t,
          transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${part.scale})`,
          opacity: fade * (part.cls === "firefly" ? 1 : 0.7),
        };
      });
      const anim = node.animate(frames, { duration, delay: part.delay, easing: "ease-in-out", fill: "both" });
      anim.onfinish = () => node.remove();
      made.push({ node, anim });
    }
    return () => {
      for (const { node, anim } of made) {
        anim.cancel();
        node.remove();
      }
    };
  }, [cheer]);

  // Praise bubble: above the cell (below it for the top two rows), kept inside the board.
  let bubble: React.ReactNode = null;
  if (cheer?.text) {
    const r = Math.floor(cheer.cell / 9);
    const c = cheer.cell % 9;
    const left = Math.min(78, Math.max(22, ((c + 0.5) / 9) * 100));
    const below = r < 2;
    bubble = (
      <div
        key={cheer.key}
        role="status"
        className={`praise ${below ? "praise-below" : ""}`}
        style={{ left: `${left}%`, top: `${((below ? r + 1 : r) / 9) * 100}%` }}
      >
        {cheer.text}
      </div>
    );
  }

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-20" aria-hidden={!cheer?.text}>
      {bubble}
    </div>
  );
}
