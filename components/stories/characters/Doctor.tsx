'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type DoctorProps = {
  size?: number
  style?: React.CSSProperties
}

/**
 * Doctor — a friendly sticker character in a white coat with a stethoscope,
 * Chai Galli style. Round head, neat hair, warm smile, coat over a teal top.
 */
export function Doctor({ size = 110, style }: DoctorProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Hair (back) */}
        <circle cx="60" cy="40" r="24" fill={COLORS.ink} />

        {/* White coat body */}
        <path
          d="M 28 82 Q 28 60, 50 56 L 70 56 Q 92 60, 92 82 L 94 132 Q 92 138, 60 138 Q 28 138, 26 132 Z"
          fill={W}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Teal top under the coat */}
        <path d="M 52 56 L 68 56 L 64 92 L 56 92 Z" fill={COLORS.teal} stroke={COLORS.ink} strokeWidth="2" strokeLinejoin="round" />
        {/* Coat lapels */}
        <path d="M 52 56 L 60 78 L 48 70 Z" fill={W} stroke={COLORS.ink} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 68 56 L 60 78 L 72 70 Z" fill={W} stroke={COLORS.ink} strokeWidth="2" strokeLinejoin="round" />

        {/* Stethoscope */}
        <path d="M 54 60 Q 50 86, 66 92 Q 80 96, 80 110" fill="none" stroke={COLORS.ink} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="80" cy="114" r="5" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Head */}
        <circle cx="60" cy="44" r="22" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        {/* Hair fringe */}
        <path d="M 38 40 Q 44 24, 60 24 Q 76 24, 82 40 Q 74 34, 60 34 Q 46 34, 38 40 Z" fill={COLORS.ink} />

        {/* Eyes */}
        <ellipse cx="52" cy="46" rx="1.8" ry="2.6" fill={COLORS.ink} style={{ transformOrigin: '52px 46px', animation: 'blink 4s ease-in-out infinite' }} />
        <ellipse cx="68" cy="46" rx="1.8" ry="2.6" fill={COLORS.ink} style={{ transformOrigin: '68px 46px', animation: 'blink 4s ease-in-out infinite' }} />

        {/* Smile */}
        <path d="M 52 54 Q 60 60, 68 54" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}
