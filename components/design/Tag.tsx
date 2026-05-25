"use client";

import { ReactNode } from "react";
import { COLORS, FONTS } from "./tokens";

type TagProps = {
  children: ReactNode;
  bg?: string;
  color?: string;
  border?: string | null;
};

/**
 * Mochiy Pop One uppercase pill — used everywhere as a label/badge.
 * Defaults to ink-on-cream; pass `bg` and `color` for variants.
 *
 * border defaults to null (no border) — use `border={COLORS.ink}` to
 * draw the 1.8px ink ring you see on celebration / mistakes tags.
 */
export function Tag({
  children,
  bg = COLORS.ink,
  color = COLORS.cream,
  border = null,
}: TagProps) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONTS.tag,
        fontSize: 10,
        background: bg,
        color,
        padding: "3px 9px",
        borderRadius: 99,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        border: border ? `1.8px solid ${border}` : "none",
      }}
    >
      {children}
    </span>
  );
}
