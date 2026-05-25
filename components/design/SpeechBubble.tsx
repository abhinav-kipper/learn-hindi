"use client";

import { COLORS, FONTS, BORDER, SHADOW, RADIUS } from "./tokens";

type TailPos = "bottom-right" | "bottom-left" | "top-right" | "top-left";

type SpeechBubbleProps = {
  children: React.ReactNode;
  caption?: string;
  tail?: TailPos;
  bg?: string;
  width?: number;
  style?: React.CSSProperties;
};

/**
 * Sticker-style speech bubble. Same hard-shadow recipe as <Sticker>:
 * 2.5px ink border + 4px offset shadow, no blur. Tail is two stacked
 * triangles to mimic the offset shadow.
 */
export function SpeechBubble({
  children,
  caption,
  tail = "bottom-right",
  bg = "#fff",
  width = 220,
  style,
}: SpeechBubbleProps) {
  return (
    <div
      style={{
        position: "relative",
        background: bg,
        border: BORDER.sticker,
        borderRadius: RADIUS.md,
        boxShadow: SHADOW.sticker,
        padding: "10px 14px 11px",
        maxWidth: width,
        minWidth: 90,
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.25,
        color: COLORS.ink,
        ...style,
      }}
    >
      <div>{children}</div>
      {caption && (
        <div
          style={{
            fontFamily: FONTS.script,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1,
            color: COLORS.ink45,
            marginTop: 4,
          }}
        >
          {caption}
        </div>
      )}
      <BubbleTail position={tail} />
    </div>
  );
}

function BubbleTail({ position }: { position: TailPos }) {
  const size = 14;
  const styles: Record<TailPos, React.CSSProperties> = {
    "bottom-right": { right: 14, bottom: -size + 1, transform: "rotate(0deg)" },
    "bottom-left": { left: 14, bottom: -size + 1, transform: "scaleX(-1)" },
    "top-right": { right: 14, top: -size + 1, transform: "rotate(180deg) scaleX(-1)" },
    "top-left": { left: 14, top: -size + 1, transform: "rotate(180deg)" },
  };
  return (
    <svg
      width={size + 6}
      height={size + 4}
      viewBox="0 0 20 18"
      style={{ position: "absolute", overflow: "visible", ...styles[position] }}
    >
      <path d="M 1 0 L 18 0 L 1 16 Z" fill={COLORS.ink} transform="translate(3 3)" />
      <path d="M 1 0 L 18 0 L 1 16 Z" fill="#fff" stroke={COLORS.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="0" y="-2" width="20" height="3" fill="#fff" />
    </svg>
  );
}

export type { SpeechBubbleProps, TailPos };
