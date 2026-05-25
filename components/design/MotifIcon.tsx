"use client";

import { COLORS } from "./tokens";

type MotifKind = "marigold" | "auto" | "chai" | "film" | "phone" | "map";

type MotifIconProps = {
  kind: MotifKind;
  size?: number;
};

/**
 * The six lesson motifs. Each fills a 64×64 viewBox with a circular outer
 * ring and a stylized illustration inside.
 *
 * Render inside a colored circle (TEAL / ORANGE / LAV / etc.) — use the
 * `paletteToMotifBg` helper in tokens.ts.
 */
export function MotifIcon({ kind, size = 64 }: MotifIconProps) {
  switch (kind) {
    case "marigold":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill={COLORS.peach} stroke={COLORS.ink} strokeWidth="2.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse
              key={a}
              cx="32"
              cy="14"
              rx="5"
              ry="10"
              fill={COLORS.orange}
              stroke={COLORS.ink}
              strokeWidth="2"
              transform={`rotate(${a} 32 32)`}
            />
          ))}
          <circle cx="32" cy="32" r="7" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="2" />
        </svg>
      );
    case "auto":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="#fff3cf" stroke={COLORS.ink} strokeWidth="2.5" />
          <path d="M14 26 L20 14 L46 14 L52 26" stroke={COLORS.ink} strokeWidth="2.5" fill={COLORS.butter} strokeLinejoin="round" />
          <rect x="10" y="26" width="44" height="20" rx="5" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="2.5" />
          <rect x="26" y="28" width="14" height="14" rx="2" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="2" />
          <circle cx="20" cy="48" r="6" fill={COLORS.ink} />
          <circle cx="20" cy="48" r="2" fill={COLORS.creamBg} />
          <circle cx="44" cy="48" r="6" fill={COLORS.ink} />
          <circle cx="44" cy="48" r="2" fill={COLORS.creamBg} />
        </svg>
      );
    case "chai":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill={COLORS.mint2} stroke={COLORS.ink} strokeWidth="2.5" />
          <path d="M22 10 Q 26 16, 22 22 Q 18 28, 22 34" stroke={COLORS.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M32 8 Q 36 14, 32 20 Q 28 26, 32 32" stroke={COLORS.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M14 26 L 18 56 L 46 56 L 50 26 Z" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 28 L 19 50 L 45 50 L 48 28 Z" fill="#a55a36" />
        </svg>
      );
    case "film":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill={COLORS.lav} stroke={COLORS.ink} strokeWidth="2.5" />
          <rect x="10" y="20" width="44" height="24" rx="3" fill={COLORS.ink} />
          <rect x="10" y="20" width="44" height="3" fill={COLORS.creamBg} />
          <rect x="10" y="41" width="44" height="3" fill={COLORS.creamBg} />
          <rect x="18" y="26" width="28" height="12" rx="1.5" fill={COLORS.lav2} />
          <path d="M26 28 L26 36 L34 32 Z" fill={COLORS.ink} />
        </svg>
      );
    case "phone":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />
          <rect x="20" y="12" width="24" height="40" rx="5" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="2.5" />
          <rect x="24" y="18" width="16" height="22" rx="1.5" fill={COLORS.mint} />
          <circle cx="32" cy="46" r="2" fill={COLORS.ink} />
        </svg>
      );
    case "map":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill={COLORS.mint} stroke={COLORS.ink} strokeWidth="2.5" />
          <path
            d="M32 14 C 25 14 21 19 21 25 C 21 33 32 46 32 46 C 32 46 43 33 43 25 C 43 19 39 14 32 14 Z"
            fill={COLORS.orange}
            stroke={COLORS.ink}
            strokeWidth="2.5"
          />
          <circle cx="32" cy="25" r="4" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="2" />
        </svg>
      );
  }
}
