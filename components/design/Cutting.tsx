"use client";

import { COLORS } from "./tokens";

type CuttingMood = "idle" | "happy" | "wave" | "sympathy" | "wink" | "excited" | "sleepy";

type CuttingProps = {
  size?: number;
  mood?: CuttingMood;
  blink?: boolean;
  style?: React.CSSProperties;
};

/**
 * Cutting — the Chai Galli mascot. Anthropomorphic cutting-chai glass with
 * face, steam-arms, and saucer. Pure inline SVG.
 *
 * Moods:
 *   idle     — default smile
 *   happy    — open mouth + tongue
 *   wave     — small open smile + raised brow
 *   sympathy — slight downturn (used for wrong-answer / koi baat nahin)
 *   wink     — one eye closed, half-smirk
 *   excited  — open mouth + sparkle eyes (streak / celebration)
 *   sleepy   — half-lidded eyes, neutral mouth (idle nudge)
 */
export function Cutting({ size = 110, mood = "idle", blink = true, style }: CuttingProps) {
  const happy = mood === "happy" || mood === "excited";
  const sympathetic = mood === "sympathy";
  const sleepy = mood === "sleepy";
  const wink = mood === "wink";
  const wave = mood === "wave";

  return (
    <div style={{ width: size, height: size * 1.2, position: "relative", ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* steam swirls */}
        <g style={{ transformOrigin: "40px 30px", animation: "float-y 2.6s ease-in-out infinite" }}>
          <path d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30" stroke={COLORS.lav2} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: "78px 30px", animation: "float-y 2.6s ease-in-out 0.4s infinite" }}>
          <path d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30" stroke={COLORS.lav2} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>

        {/* saucer */}
        <ellipse cx="60" cy="132" rx="46" ry="8" fill={COLORS.ink} />
        <ellipse cx="60" cy="129" rx="44" ry="7" fill={COLORS.orange2} />
        <ellipse cx="60" cy="127" rx="38" ry="5" fill={COLORS.peach} />

        {/* cup body */}
        <path d="M 26 38 L 30 124 L 90 124 L 94 38 Z" fill={COLORS.creamBg} stroke={COLORS.ink} strokeWidth="3.5" strokeLinejoin="round" />

        {/* chai liquid */}
        <path d="M 28 44 L 30 60 L 90 60 L 92 44 Z" fill="#a55a36" />
        <ellipse cx="60" cy="44" rx="32" ry="3.5" fill="#7d4226" />

        {/* shine */}
        <path d="M 32 50 L 34 110" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* cheeks — pinker for happy/excited */}
        <ellipse cx="40" cy="92" rx={happy ? 7 : 6} ry={happy ? 5 : 4.5} fill={COLORS.rose} opacity={happy ? 1 : 0.85} />
        <ellipse cx="80" cy="92" rx={happy ? 7 : 6} ry={happy ? 5 : 4.5} fill={COLORS.rose} opacity={happy ? 1 : 0.85} />

        {/* eyes */}
        {sleepy ? (
          <>
            <path d="M 40 82 Q 46 86, 52 82" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 68 82 Q 74 86, 80 82" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "excited" ? (
          <>
            <g transform="translate(46 82)">
              <ellipse cx="0" cy="0" rx="6" ry="8" fill={COLORS.ink} />
              <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#fff" />
            </g>
            <g transform="translate(74 82)">
              <ellipse cx="0" cy="0" rx="6" ry="8" fill={COLORS.ink} />
              <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#fff" />
            </g>
          </>
        ) : wink ? (
          <>
            <g style={{ transformOrigin: "46px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="46" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="48" cy="80" r="2.2" fill="#fff" />
            </g>
            <path d="M 68 84 Q 74 78, 80 84" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <g style={{ transformOrigin: "46px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="46" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="48" cy="80" r="2.2" fill="#fff" />
              <circle cx="45" cy="85" r="1.2" fill="#fff" />
            </g>
            <g style={{ transformOrigin: "74px 82px", animation: blink ? "blink 5.2s ease-in-out infinite" : "none" }}>
              <ellipse cx="74" cy="82" rx="6" ry="8" fill={COLORS.ink} />
              <circle cx="76" cy="80" r="2.2" fill="#fff" />
              <circle cx="73" cy="85" r="1.2" fill="#fff" />
            </g>
            {wave && (
              <>
                <path d="M 40 72 Q 46 68, 52 72" stroke={COLORS.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M 68 72 Q 74 68, 80 72" stroke={COLORS.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* mouth */}
        {happy ? (
          <>
            <path d="M 48 102 Q 60 116, 72 102 L 72 104 Q 60 118 48 104 Z" fill={COLORS.ink} />
            <ellipse cx="60" cy="111" rx="5" ry="3" fill={COLORS.rose} />
          </>
        ) : sympathetic ? (
          <path d="M 50 108 Q 60 100, 70 108" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : sleepy ? (
          <path d="M 54 104 L 66 104" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : wink ? (
          <path d="M 50 102 Q 62 112, 72 100" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 50 102 Q 60 110, 70 102" stroke={COLORS.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export type { CuttingMood, CuttingProps };
