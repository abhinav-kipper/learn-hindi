"use client";

import { useState } from "react";
import { COLORS } from "./tokens";

type ConfettiProps = {
  active: boolean;
  colors?: string[];
  count?: number;
};

const DEFAULT_COLORS = [
  COLORS.peach,
  COLORS.mint,
  COLORS.lav2,
  COLORS.butter,
  COLORS.rose,
];

interface Bit {
  key: number;
  left: number;
  width: number;
  height: number;
  background: string;
  borderRadius: string;
  rotate: number;
  duration: number;
  delay: number;
}

/**
 * Build N confetti bits with randomized positions, sizes, rotations, and
 * timings. Extracted outside the component so the impure Math.random
 * calls don't sit in the render path — they run once via the useState
 * lazy initializer when the component first mounts.
 */
function buildBits(count: number, colors: string[]): Bit[] {
  const out: Bit[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      key: i,
      left: Math.random() * 100,
      duration: 1.6 + Math.random() * 1.4,
      delay: Math.random() * 0.6,
      width: 8 + Math.random() * 6,
      height: (8 + Math.random() * 6) * 1.4,
      background: colors[i % colors.length],
      rotate: Math.random() * 360,
      borderRadius: i % 3 === 0 ? "50%" : "3px",
    });
  }
  return out;
}

/**
 * Lightweight pure-CSS confetti rain. Renders N falling shapes
 * (mixed circles and rectangles) over a `position: relative` parent.
 *
 * Pair with the levelup() sound from lib/sounds.ts on the lesson-complete
 * and quiz-complete screens.
 *
 * IMPORTANT: The parent must be `position: relative` and `overflow: hidden`
 * so confetti is clipped to the screen area.
 *
 * The random positions are computed once on mount via the useState lazy
 * initializer — they stay stable across re-renders so parent state changes
 * don't restart the CSS animations mid-fall.
 */
export function Confetti({
  active,
  colors = DEFAULT_COLORS,
  count = 36,
}: ConfettiProps) {
  const [bits] = useState(() => buildBits(count, colors));

  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 70,
      }}
    >
      {bits.map((b) => (
        <div
          key={b.key}
          style={{
            position: "absolute",
            top: -20,
            left: `${b.left}%`,
            width: b.width,
            height: b.height,
            background: b.background,
            borderRadius: b.borderRadius,
            transform: `rotate(${b.rotate}deg)`,
            animation: `confetti-fall ${b.duration}s ease-in ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
