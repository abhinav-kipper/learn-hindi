'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Nani's house — interior scene with warm peach walls, a window with sunlight,
 * a low wooden table laden with steel plates and a glass tumbler.
 */
export function NaniHouseScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Wall */}
        <rect x="0" y="0" width="400" height="170" fill={COLORS.peach2} />

        {/* Window (left) */}
        <rect x="40" y="40" width="80" height="60" fill={COLORS.butter} stroke={COLORS.ink} strokeWidth="2.5" />
        <line x1="80" y1="40" x2="80" y2="100" stroke={COLORS.ink} strokeWidth="2" />
        <line x1="40" y1="70" x2="120" y2="70" stroke={COLORS.ink} strokeWidth="2" />
        {/* Sun rays through window */}
        <path d="M 130 50 L 170 90 L 130 130 Z" fill={COLORS.butter} opacity="0.4" />

        {/* Floor — wood-tone */}
        <rect x="0" y="170" width="400" height="70" fill={COLORS.orange2} opacity="0.5" />
        <line x1="0" y1="170" x2="400" y2="170" stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Low table */}
        <rect x="230" y="160" width="140" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="240" y="180" width="6" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="354" y="180" width="6" height="20" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Steel plate with food */}
        <ellipse cx="280" cy="160" rx="20" ry="5" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="2" />
        <circle cx="275" cy="156" r="4" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="1.5" />
        <circle cx="285" cy="156" r="4" fill={COLORS.mint} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Glass tumbler */}
        <rect x="330" y="148" width="10" height="14" fill={COLORS.lav2} stroke={COLORS.ink} strokeWidth="1.5" />

        {/* Wall decoration — small framed picture */}
        <rect x="260" y="50" width="40" height="50" fill={COLORS.mint2} stroke={COLORS.ink} strokeWidth="2.5" />
      </svg>
    </div>
  )
}
