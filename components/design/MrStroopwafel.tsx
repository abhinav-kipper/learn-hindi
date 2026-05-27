'use client'

import { COLORS } from './tokens'

const W = '#fff' // @design-allow: white literal
const WAFFLE_BODY = '#c89556' // @design-allow: caramel-bronze waffle body
const WAFFLE_FILLING = '#8a5a2e' // @design-allow: dark caramel sliver

type MrStroopwafelMood = 'idle' | 'happy' | 'wave' | 'sympathy' | 'wink' | 'excited' | 'sleepy'

type Props = {
  size?: number
  mood?: MrStroopwafelMood
  blink?: boolean // accepted for API parity with Cutting; no-op (sunglasses cover eyes)
  style?: React.CSSProperties
}

/**
 * Mr. Stroopwafels — the Dutch-track mascot. A caramel-waffle cookie with
 * a cream face panel, round sunglasses, a thick handlebar mustache, and a
 * sliver of dark-caramel filling peeking out the bottom edge.
 *
 * Moods (mirror Cutting's set so <Mascot> swaps drop-in):
 *   idle     — neutral mouth, flat mustache, lens sparkles
 *   happy    — open smile, mustache tips up, bigger sparkles
 *   wave     — small open smile, raised mustache on one side
 *   sympathy — slight downturn, drooping mustache
 *   wink     — one lens lifted briefly, winking eye dot underneath
 *   excited  — wide open smile, mustache tips up, lens starbursts
 *   sleepy   — sunglasses lowered, Zzz floats above, flat mouth
 */
export function MrStroopwafel({ size = 100, mood = 'idle', style }: Props) {
  const cx = 50
  const cy = 52
  const r = 38

  const mustacheUp = mood === 'happy' || mood === 'excited' || mood === 'wave'
  const mustacheDown = mood === 'sympathy'
  const winkingLeft = mood === 'wink'
  const sleepy = mood === 'sleepy'
  const excited = mood === 'excited'

  // Mouth path keyed by mood (same shape language as Cutting)
  const mouthPath =
    mood === 'happy' || mood === 'excited'
      ? `M ${cx - 6} 64 Q ${cx} 70 ${cx + 6} 64`
      : mood === 'sympathy'
        ? `M ${cx - 5} 67 Q ${cx} 63 ${cx + 5} 67`
        : mood === 'wave' || mood === 'wink'
          ? `M ${cx - 5} 65 Q ${cx} 68 ${cx + 5} 65`
          : `M ${cx - 4} 65 L ${cx + 4} 65`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      role="img"
      aria-label="Mr. Stroopwafels"
    >
      {/* Caramel filling sliver — drawn behind so it peeks out below the body */}
      <ellipse
        cx={cx}
        cy={cy + r - 6}
        rx={r - 6}
        ry={6}
        fill={WAFFLE_FILLING}
        stroke={COLORS.ink}
        strokeWidth={2.5}
      />

      {/* Body — circular waffle */}
      <circle cx={cx} cy={cy} r={r} fill={WAFFLE_BODY} stroke={COLORS.ink} strokeWidth={2.5} />

      {/* Waffle grid (4x4) — diamond crosshatch using two sets of lines, clipped to body */}
      <defs>
        <clipPath id="ms-body-clip">
          <circle cx={cx} cy={cy} r={r - 2} />
        </clipPath>
      </defs>
      <g clipPath="url(#ms-body-clip)" stroke={COLORS.ink} strokeWidth={1.4} opacity={0.55}>
        {/* horizontal grid lines */}
        {[-24, -12, 0, 12, 24].map((dy) => (
          <line key={`h${dy}`} x1={cx - r} y1={cy + dy} x2={cx + r} y2={cy + dy} />
        ))}
        {/* vertical grid lines */}
        {[-24, -12, 0, 12, 24].map((dx) => (
          <line key={`v${dx}`} x1={cx + dx} y1={cy - r} x2={cx + dx} y2={cy + r} />
        ))}
      </g>

      {/* Cream face panel */}
      <circle cx={cx} cy={cy + 2} r={22} fill={COLORS.cream} stroke={COLORS.ink} strokeWidth={2} />

      {/* Sunglasses — two round lenses + bridge */}
      <g transform={sleepy ? `translate(0,4)` : undefined}>
        {/* left lens */}
        <g transform={winkingLeft ? `translate(0,-6)` : undefined}>
          <circle
            cx={cx - 8}
            cy={cy - 2}
            r={6}
            fill={winkingLeft ? COLORS.cream : COLORS.ink}
            stroke={COLORS.ink}
            strokeWidth={2.2}
          />
          {!winkingLeft && (
            <circle cx={cx - 9.5} cy={cy - 3.5} r={1.6} fill={W} opacity={excited ? 1 : 0.85} />
          )}
          {winkingLeft && (
            <line
              x1={cx - 11}
              y1={cy - 2}
              x2={cx - 5}
              y2={cy - 2}
              stroke={COLORS.ink}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          )}
        </g>
        {/* right lens */}
        <circle cx={cx + 8} cy={cy - 2} r={6} fill={COLORS.ink} stroke={COLORS.ink} strokeWidth={2.2} />
        <circle cx={cx + 6.5} cy={cy - 3.5} r={1.6} fill={W} opacity={excited ? 1 : 0.85} />
        {/* bridge */}
        <line
          x1={cx - 2}
          y1={cy - 2}
          x2={cx + 2}
          y2={cy - 2}
          stroke={COLORS.ink}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>

      {/* Handlebar mustache */}
      <path
        d={
          mustacheUp
            ? `M ${cx - 12} 60 Q ${cx - 8} 56 ${cx} 58 Q ${cx + 8} 56 ${cx + 12} 60 Q ${cx + 9} 62 ${cx + 6} 60 Q ${cx + 3} 62 ${cx} 60 Q ${cx - 3} 62 ${cx - 6} 60 Q ${cx - 9} 62 ${cx - 12} 60 Z`
            : mustacheDown
              ? `M ${cx - 12} 62 Q ${cx - 8} 65 ${cx} 60 Q ${cx + 8} 65 ${cx + 12} 62 Q ${cx + 9} 63 ${cx + 6} 61 Q ${cx + 3} 63 ${cx} 61 Q ${cx - 3} 63 ${cx - 6} 61 Q ${cx - 9} 63 ${cx - 12} 62 Z`
              : `M ${cx - 12} 60 Q ${cx - 8} 58 ${cx} 60 Q ${cx + 8} 58 ${cx + 12} 60 Q ${cx + 9} 62 ${cx + 6} 60 Q ${cx + 3} 62 ${cx} 60 Q ${cx - 3} 62 ${cx - 6} 60 Q ${cx - 9} 62 ${cx - 12} 60 Z`
        }
        fill={COLORS.ink}
        stroke={COLORS.ink}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />

      {/* Mouth */}
      <path d={mouthPath} fill="none" stroke={COLORS.ink} strokeWidth={2.4} strokeLinecap="round" />

      {/* Excited starbursts above lenses */}
      {excited && (
        <>
          <path
            d={`M ${cx - 14} ${cy - 13} l 2 0 m -1 -1 l 0 2`}
            stroke={COLORS.ink}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx + 14} ${cy - 13} l 2 0 m -1 -1 l 0 2`}
            stroke={COLORS.ink}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Sleepy Zzz */}
      {sleepy && (
        <text
          x={cx + 22}
          y={cy - 26}
          fill={COLORS.ink}
          fontFamily="var(--font-bricolage), sans-serif"
          fontSize="14"
          fontWeight="800"
        >
          Zz
        </text>
      )}
    </svg>
  )
}

export type { MrStroopwafelMood }
