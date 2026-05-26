'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type NaniProps = {
  size?: number
  style?: React.CSSProperties
}

/**
 * Nani — a sari-wearing grandmother sticker character in Chai Galli style.
 * Round head, white hair bun, round glasses, peach-orange sari, hands resting
 * over a steel dabba. Eyes blink via existing `blink` keyframe.
 */
export function Nani({ size = 110, style }: NaniProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Hair bun (back) */}
        <circle cx="60" cy="20" r="13" fill={W} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Body — sari draped */}
        <path
          d="M 30 80 Q 30 60, 50 56 L 70 56 Q 90 60, 90 80 L 92 130 Q 90 138, 60 138 Q 30 138, 28 130 Z"
          fill={COLORS.peach}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Sari edge accent */}
        <path
          d="M 30 80 Q 36 78, 60 82 Q 84 78, 90 80"
          fill="none"
          stroke={COLORS.orange}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="60" cy="42" r="22" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Glasses */}
        <circle cx="52" cy="42" r="5" fill={W} stroke={COLORS.ink} strokeWidth="2" />
        <circle cx="68" cy="42" r="5" fill={W} stroke={COLORS.ink} strokeWidth="2" />
        <line x1="57" y1="42" x2="63" y2="42" stroke={COLORS.ink} strokeWidth="2" />

        {/* Eyes (behind glasses) */}
        <ellipse cx="52" cy="42" rx="1.6" ry="2.4" fill={COLORS.ink} style={{ transformOrigin: '52px 42px', animation: 'blink 4s ease-in-out infinite' }} />
        <ellipse cx="68" cy="42" rx="1.6" ry="2.4" fill={COLORS.ink} style={{ transformOrigin: '68px 42px', animation: 'blink 4s ease-in-out infinite' }} />

        {/* Bindi */}
        <circle cx="60" cy="28" r="2.2" fill={COLORS.orange} />

        {/* Smile */}
        <path d="M 52 52 Q 60 58, 68 52" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Dabba (steel tiffin) — held at waist */}
        <rect x="44" y="100" width="32" height="18" rx="3" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="48" y="96" width="24" height="5" rx="1.5" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hands resting on dabba */}
        <circle cx="42" cy="106" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="78" cy="106" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
