"use client";

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

/**
 * Lightweight pure-CSS confetti rain. Renders N falling shapes
 * (mixed circles and rectangles) over a `position: relative` parent.
 *
 * Pair with the levelup() sound from lib/sounds.ts on the lesson-complete
 * and quiz-complete screens.
 *
 * IMPORTANT: The parent must be `position: relative` and `overflow: hidden`
 * so confetti is clipped to the screen area.
 */
export function Confetti({
  active,
  colors = DEFAULT_COLORS,
  count = 36,
}: ConfettiProps) {
  if (!active) return null;

  const bits = [];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const dur = 1.6 + Math.random() * 1.4;
    const delay = Math.random() * 0.6;
    const w = 8 + Math.random() * 6;
    const c = colors[i % colors.length];
    const rot = Math.random() * 360;
    const shape = i % 3 === 0 ? "50%" : "3px";
    bits.push(
      <div
        key={i}
        style={{
          position: "absolute",
          top: -20,
          left: `${left}%`,
          width: w,
          height: w * 1.4,
          background: c,
          borderRadius: shape,
          transform: `rotate(${rot}deg)`,
          animation: `confetti-fall ${dur}s ease-in ${delay}s forwards`,
        }}
      />
    );
  }

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
      {bits}
    </div>
  );
}
