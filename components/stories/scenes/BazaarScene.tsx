'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Bazaar scene — colorful market street with hanging marigold strings,
 * row of stalls in butter / mint / peach panels, distant temple silhouette.
 */
export function BazaarScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Sky */}
        <rect x="0" y="0" width="400" height="160" fill={COLORS.butter} />

        {/* Distant temple silhouette */}
        <path d="M 280 160 L 280 110 L 290 100 L 300 110 L 300 160 Z" fill={COLORS.lav2} opacity="0.7" />
        <circle cx="290" cy="96" r="4" fill={COLORS.lav2} opacity="0.7" />

        {/* Stalls row */}
        <rect x="0" y="120" width="100" height="80" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="100" y="120" width="100" height="80" fill={COLORS.mint2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="200" y="120" width="100" height="80" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="300" y="120" width="100" height="80" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Stall awnings (striped) */}
        <rect x="0" y="120" width="100" height="14" fill={COLORS.orange} />
        <rect x="100" y="120" width="100" height="14" fill={COLORS.mint} />
        <rect x="200" y="120" width="100" height="14" fill={COLORS.lav} />
        <rect x="300" y="120" width="100" height="14" fill={COLORS.orange} />

        {/* Hanging marigold strings (top) */}
        <path d="M 0 30 Q 100 50, 200 30 Q 300 50, 400 30" fill="none" stroke={COLORS.orange} strokeWidth="3" />
        {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map(x => (
          <circle key={x} cx={x} cy={36 + (x % 60 > 30 ? 4 : 0)} r="5" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="1.5" />
        ))}

        {/* Ground */}
        <rect x="0" y="200" width="400" height="40" fill={COLORS.cream} />
      </svg>
    </div>
  )
}
