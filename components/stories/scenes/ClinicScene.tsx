'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal
const CROSS_RED = '#e85a5a' // @design-allow: medical-cross red (matches COLORS.red)

/**
 * Doctor's clinic — a calm mint-walled room with an examination bed, a wall
 * chart with a medical cross, and a small cabinet. Chai Galli style.
 */
export function ClinicScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Walls */}
        <rect x="0" y="0" width="400" height="175" fill={COLORS.mint2} />

        {/* Wall chart with medical cross */}
        <rect x="40" y="34" width="56" height="68" fill={W} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="60" y="50" width="16" height="36" fill={CROSS_RED} />
        <rect x="50" y="60" width="36" height="16" fill={CROSS_RED} />

        {/* Wall clock */}
        <circle cx="330" cy="56" r="18" fill={W} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="330" y1="56" x2="330" y2="46" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />
        <line x1="330" y1="56" x2="338" y2="56" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" />

        {/* Floor */}
        <rect x="0" y="175" width="400" height="65" fill={COLORS.lav2} opacity="0.5" />
        <line x1="0" y1="175" x2="400" y2="175" stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Examination bed */}
        <rect x="150" y="150" width="160" height="24" rx="4" fill={W} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="150" y="150" width="44" height="24" rx="4" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="160" y="174" width="6" height="20" fill={COLORS.ink} />
        <rect x="294" y="174" width="6" height="20" fill={COLORS.ink} />

        {/* Cabinet (right) */}
        <rect x="330" y="120" width="56" height="55" fill={COLORS.peach2} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="330" y1="147" x2="386" y2="147" stroke={COLORS.ink} strokeWidth="2" />
        <circle cx="358" cy="133" r="2" fill={COLORS.ink} />
        <circle cx="358" cy="161" r="2" fill={COLORS.ink} />
      </svg>
    </div>
  )
}
