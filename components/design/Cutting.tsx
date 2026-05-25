"use client";

import { COLORS } from "./tokens";

type CuttingProps = {
  size?: number;
  mood?: "idle" | "happy";
  style?: React.CSSProperties;
};

/**
 * Cutting — the Chai Galli mascot. An anthropomorphic cutting-chai glass
 * with face, steam-arms, and saucer. Pure inline SVG, no external assets.
 *
 * Anatomy (z-order, top → bottom):
 *   1. Two steam swirls (animated float-y, staggered)
 *   2. Saucer (3-layer plate)
 *   3. Cup body (cutting glass trapezoid)
 *   4. Chai liquid surface + dark band
 *   5. Shine line
 *   6. Face: cheeks, eyes (with blink animation), mouth (idle vs happy)
 *
 * Sizes used across the app:
 *   62–74 (header corners), 84–92 (greeting), 110 (decorative),
 *   160–170 (celebration, onboarding step 1)
 */
export function Cutting({ size = 110, mood = "idle", style }: CuttingProps) {
  return (
    <div
      style={{
        width: size,
        height: size * 1.2,
        position: "relative",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 120 144"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {/* steam swirls */}
        <g
          style={{
            transformOrigin: "40px 30px",
            animation: "float-y 2.6s ease-in-out infinite",
          }}
        >
          <path
            d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30"
            stroke="#fff"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 32 24 Q 36 14, 44 18 Q 50 22, 44 30"
            stroke={COLORS.lav2}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g
          style={{
            transformOrigin: "78px 30px",
            animation: "float-y 2.6s ease-in-out 0.4s infinite",
          }}
        >
          <path
            d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30"
            stroke="#fff"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 88 24 Q 84 14, 76 18 Q 70 22, 76 30"
            stroke={COLORS.lav2}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* saucer */}
        <ellipse cx="60" cy="132" rx="46" ry="8" fill={COLORS.ink} />
        <ellipse cx="60" cy="129" rx="44" ry="7" fill={COLORS.orange2} />
        <ellipse cx="60" cy="127" rx="38" ry="5" fill={COLORS.peach} />

        {/* cup body */}
        <path
          d="M 26 38 L 30 124 L 90 124 L 94 38 Z"
          fill={COLORS.creamBg}
          stroke={COLORS.ink}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* chai liquid */}
        <path
          d="M 28 44 L 30 60 L 90 60 L 92 44 Z"
          fill="#a55a36"
        />
        <ellipse cx="60" cy="44" rx="32" ry="3.5" fill="#7d4226" />

        {/* shine */}
        <path
          d="M 32 50 L 34 110"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* cheeks */}
        <ellipse cx="40" cy="92" rx="6" ry="4.5" fill={COLORS.rose} opacity="0.85" />
        <ellipse cx="80" cy="92" rx="6" ry="4.5" fill={COLORS.rose} opacity="0.85" />

        {/* eyes — blink animation */}
        <g
          style={{
            transformOrigin: "46px 82px",
            animation: "blink 5.2s ease-in-out infinite",
          }}
        >
          <ellipse cx="46" cy="82" rx="6" ry="8" fill={COLORS.ink} />
          <circle cx="48" cy="80" r="2.2" fill="#fff" />
          <circle cx="45" cy="85" r="1.2" fill="#fff" />
        </g>
        <g
          style={{
            transformOrigin: "74px 82px",
            animation: "blink 5.2s ease-in-out infinite",
          }}
        >
          <ellipse cx="74" cy="82" rx="6" ry="8" fill={COLORS.ink} />
          <circle cx="76" cy="80" r="2.2" fill="#fff" />
          <circle cx="73" cy="85" r="1.2" fill="#fff" />
        </g>

        {/* mouth */}
        {mood === "happy" ? (
          <>
            <path
              d="M 48 102 Q 60 116, 72 102 L 72 104 Q 60 118 48 104 Z"
              fill={COLORS.ink}
            />
            <ellipse cx="60" cy="111" rx="5" ry="3" fill={COLORS.rose} />
          </>
        ) : (
          <path
            d="M 50 102 Q 60 110, 70 102"
            stroke={COLORS.ink}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
