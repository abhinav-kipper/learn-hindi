"use client";

import { COLORS, FONTS } from "./tokens";
import { useTheme } from "./theme";

type StreakChipProps = {
  count: number;
  onClick?: () => void;
};

/**
 * Orange chip with a flickering 🔥 + day-count number.
 *
 * Wire onClick to your existing streak-detail popover or just fire the
 * `streak()` sound from lib/sounds.ts for tactile feedback.
 */
export function StreakChip({ count, onClick }: StreakChipProps) {
  const theme = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: theme.primary2,
        border: `2.5px solid ${COLORS.ink}`,
        borderRadius: 99,
        padding: "5px 12px 5px 8px",
        fontFamily: FONTS.display,
        fontWeight: 800,
        color: COLORS.ink,
        fontSize: 16,
        cursor: onClick ? "pointer" : "default",
        boxShadow: `3px 3px 0 ${COLORS.ink}`,
      }}
    >
      <span
        style={{
          fontSize: 17,
          display: "inline-block",
          animation: "flame-flicker 1.6s ease-in-out infinite",
        }}
        aria-hidden
      >
        🔥
      </span>
      {count}
    </button>
  );
}
