'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type CustomerProps = {
  size?: number
  shirtColor?: string  // defaults to mint; pass COLORS.peach for Maya in Story 2 to differentiate
  style?: React.CSSProperties
}

/**
 * Customer — a generic humanoid sticker character. Round head, short stylized
 * hair, simple shirt (color via prop), neutral-friendly face. Used as the
 * chai-stall customer in Story 1 and as Maya the protagonist in Story 2.
 */
export function Customer({ size = 110, shirtColor = COLORS.mint, style }: CustomerProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Body — shirt */}
        <path
          d="M 32 84 Q 32 64, 50 60 L 70 60 Q 88 64, 88 84 L 90 132 Q 88 138, 60 138 Q 32 138, 30 132 Z"
          fill={shirtColor}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Collar */}
        <path d="M 50 60 L 60 70 L 70 60" fill="none" stroke={COLORS.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Head */}
        <circle cx="60" cy="40" r="22" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hair (short, stylized) */}
        <path
          d="M 38 36 Q 40 22, 60 18 Q 80 22, 82 36 Q 78 30, 60 30 Q 42 30, 38 36 Z"
          fill={COLORS.ink}
          stroke={COLORS.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Eyes */}
        <ellipse cx="52" cy="42" rx="2" ry="2.8" fill={COLORS.ink} style={{ transformOrigin: '52px 42px', animation: 'blink 3.5s ease-in-out infinite' }} />
        <ellipse cx="68" cy="42" rx="2" ry="2.8" fill={COLORS.ink} style={{ transformOrigin: '68px 42px', animation: 'blink 3.5s ease-in-out infinite' }} />

        {/* Eyebrows */}
        <line x1="48" y1="36" x2="56" y2="36" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="36" x2="72" y2="36" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />

        {/* Smile */}
        <path d="M 54 50 Q 60 56, 66 50" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="34" cy="100" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="86" cy="100" r="6" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
