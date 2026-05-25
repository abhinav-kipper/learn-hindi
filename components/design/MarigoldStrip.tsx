"use client";

import { COLORS } from "./tokens";

type MarigoldStripProps = {
  count?: number;
  color?: string;
};

/**
 * Decorative divider — N marigold flowers joined by dashed ink lines.
 * Each flower wobbles slightly out of phase for a hand-strung feel.
 *
 * Use sparingly: 1 strip per page, between the header band and content,
 * or as a section divider. More than 2 strips on a page kills the rhythm.
 */
export function MarigoldStrip({ count = 9, color = COLORS.orange }: MarigoldStripProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", overflow: "hidden" }}>
      {[...Array(count)].map((_, i) => (
        <span key={i} style={{ display: "contents" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            style={{
              flexShrink: 0,
              animation: `wobble-z 2.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          >
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                cx="12"
                cy="5"
                rx="2.5"
                ry="5"
                fill={color}
                stroke={COLORS.ink}
                strokeWidth="1.4"
                transform={`rotate(${a} 12 12)`}
              />
            ))}
            <circle cx="12" cy="12" r="3" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="1.4" />
          </svg>
          {i < count - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: COLORS.ink,
                borderRadius: 99,
                opacity: 0.4,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
