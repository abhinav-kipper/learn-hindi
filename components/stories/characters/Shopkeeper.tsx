'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

type ShopkeeperProps = {
  size?: number
  shirtColor?: string
  accentColor?: string
  style?: React.CSSProperties
}

/**
 * Shopkeeper — humanoid with mustache, slight portly proportions, and a
 * small crate prop suggesting a market stall. Rendered twice in Story 2 with
 * different palettes via props for visual distinction.
 */
export function Shopkeeper({
  size = 110,
  shirtColor = COLORS.peach,
  accentColor = COLORS.mint,
  style,
}: ShopkeeperProps) {
  return (
    <div style={{ width: size, height: size * 1.2, position: 'relative', ...style }}>
      <svg viewBox="0 0 120 144" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Crate prop (back) */}
        <rect x="86" y="106" width="22" height="28" rx="2" fill={accentColor} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="86" y1="115" x2="108" y2="115" stroke={COLORS.ink} strokeWidth="2" />

        {/* Body — kurta */}
        <path
          d="M 26 86 Q 26 64, 48 58 L 72 58 Q 94 64, 94 86 L 96 134 Q 94 140, 60 140 Q 26 140, 24 134 Z"
          fill={shirtColor}
          stroke={COLORS.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Head — slightly larger */}
        <circle cx="60" cy="40" r="24" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Hair (back) */}
        <path d="M 38 30 Q 60 14, 82 30 Q 78 24, 60 22 Q 42 24, 38 30 Z" fill={COLORS.ink} />

        {/* Eyes */}
        <ellipse cx="51" cy="40" rx="2.2" ry="3" fill={COLORS.ink} style={{ transformOrigin: '51px 40px', animation: 'blink 4.5s ease-in-out infinite' }} />
        <ellipse cx="69" cy="40" rx="2.2" ry="3" fill={COLORS.ink} style={{ transformOrigin: '69px 40px', animation: 'blink 4.5s ease-in-out infinite' }} />

        {/* Mustache — signature Chai-Galli shopkeeper trait */}
        <path d="M 46 54 Q 52 50, 60 54 Q 68 50, 74 54 Q 68 58, 60 56 Q 52 58, 46 54 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Smile under mustache */}
        <path d="M 54 60 Q 60 64, 66 60" stroke={COLORS.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="28" cy="104" r="6.5" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <circle cx="80" cy="106" r="6.5" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
