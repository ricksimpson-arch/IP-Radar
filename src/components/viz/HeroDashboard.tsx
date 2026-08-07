"use client";

import { useEffect, useRef } from "react";

/**
 * HeroDashboard — SPEC.md §8.1 Block 1.
 * A live scoring pass: 14 unlabeled opportunity rows re-sorting as three
 * weight values drift, leading score counting in mono. Decorative but
 * truthful — it animates the mechanic the company sells.
 *
 * Constraints honored: hand-built canvas (few KB of code, no asset),
 * aria-hidden, paused off-screen and when document.hidden, static final
 * frame under prefers-reduced-motion, max 22% opacity, no layout shift
 * (absolutely positioned within the hero).
 */

const ROWS = 14;
const WEIGHTS = 3;

// Deterministic per-row base scores so the composition is stable across loads.
const BASES: number[][] = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: WEIGHTS }, (_, w) => 30 + ((r * 37 + w * 53) % 63)),
);

function computeScores(weights: number[]): { row: number; score: number }[] {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  return BASES.map((base, row) => ({
    row,
    score: base.reduce((acc, v, w) => acc + v * (weights[w] ?? 0), 0) / total,
  })).sort((a, b) => b.score - a.score);
}

export function HeroDashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let t = 0;

    const draw = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Three drifting weights.
      const weights = [
        0.5 + 0.4 * Math.sin(time * 0.00021),
        0.5 + 0.4 * Math.sin(time * 0.00017 + 2.1),
        0.5 + 0.4 * Math.sin(time * 0.00013 + 4.2),
      ];
      const ranked = computeScores(weights);

      const rowH = Math.min(22, (h - 60) / ROWS);
      const barMax = w * 0.55;
      const x0 = 8;

      // Weight sliders.
      weights.forEach((wt, i) => {
        const y = 10 + i * 12;
        ctx.strokeStyle = "#263349";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + 120, y);
        ctx.stroke();
        ctx.fillStyle = "#35f0a0";
        ctx.beginPath();
        ctx.arc(x0 + 120 * ((wt - 0.1) / 0.8), y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ranked rows.
      ranked.forEach((entry, i) => {
        const y = 56 + i * rowH;
        ctx.fillStyle = "#131c2e";
        ctx.fillRect(x0, y, barMax, rowH - 6);
        ctx.fillStyle = i === 0 ? "#35f0a0" : "#4cc9f0";
        ctx.globalAlpha = i === 0 ? 0.9 : 0.35;
        ctx.fillRect(x0, y, barMax * (entry.score / 100), rowH - 6);
        ctx.globalAlpha = 1;
      });

      // Leading score in mono.
      const lead = ranked[0];
      if (lead) {
        ctx.fillStyle = "#35f0a0";
        ctx.font = "600 28px ui-monospace, monospace";
        ctx.fillText(lead.score.toFixed(1), x0 + barMax + 18, 56 + 22);
        ctx.fillStyle = "#63728a";
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText("LEADING SCORE", x0 + barMax + 18, 56 + 40);
      }
    };

    if (reduced) {
      // Static final frame.
      draw(0);
      return;
    }

    const loop = (time: number) => {
      if (visible && !document.hidden) {
        t = time;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    observer.observe(canvas);

    const onVisibility = () => draw(t);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-[0.22] md:block"
    />
  );
}
