"use client";

import { ReactNode, useState } from "react";
import { BORDER, SHADOW, RADIUS } from "./tokens";
const W = '#fff' // @design-allow: white literal

type StickerProps = {
  children: ReactNode;
  color?: string;
  radius?: number;
  padding?: number | string;
  dashed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The foundational Chai Galli card. Every clickable surface in the app uses
 * this recipe: 2.5px ink border, 4px offset shadow (no blur, no rgba).
 *
 * - selected: lifts up and casts a deeper shadow (used by onboarding picks)
 * - dashed: dashed border variant (used by correction stickers)
 * - onClick: enables the press-down feedback (shadow snaps 4px → 2px)
 */
export function Sticker({
  children,
  color = W,
  radius = RADIUS.lg,
  padding = 16,
  dashed = false,
  selected = false,
  onClick,
  className,
  style,
}: StickerProps) {
  const [pressed, setPressed] = useState(false);

  const baseShadow = selected
    ? SHADOW.stickerSelected
    : pressed
    ? SHADOW.stickerPressed
    : SHADOW.sticker;

  const transform = selected
    ? "translate(-2px, -2px)"
    : pressed
    ? "translate(2px, 2px)"
    : "none";

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseDown={() => onClick && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => onClick && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: color,
        borderRadius: radius,
        padding,
        border: dashed ? BORDER.stickerDashed : BORDER.sticker,
        boxShadow: baseShadow,
        cursor: onClick ? "pointer" : "default",
        transform,
        transition: "transform 0.12s, box-shadow 0.12s",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
