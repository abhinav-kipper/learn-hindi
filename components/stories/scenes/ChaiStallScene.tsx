'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal

/**
 * Chai stall scene — peach-gradient sky, dusty road, wooden chai cart with
 * brass pot and steam. Characters sit on top via the StoryReader.
 */
export function ChaiStallScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Sky — peach gradient */}
        <defs>
          <linearGradient id="sky-chai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.peach2} />
            <stop offset="100%" stopColor={COLORS.butter} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="240" fill="url(#sky-chai)" />

        {/* Distant hills */}
        <path d="M 0 160 Q 80 130, 160 150 Q 240 130, 320 145 L 400 140 L 400 240 L 0 240 Z" fill={COLORS.lav2} opacity="0.6" />

        {/* Road */}
        <rect x="0" y="200" width="400" height="40" fill={COLORS.peach2} />
        <path d="M 0 200 L 400 200" stroke={COLORS.ink} strokeWidth="2" />

        {/* Chai cart (left side, decorative) */}
        <rect x="40" y="160" width="80" height="50" rx="4" fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2.5" />
        <rect x="40" y="155" width="80" height="10" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="2.5" />
        {/* Chai pot */}
        <ellipse cx="80" cy="148" rx="14" ry="8" fill={COLORS.ink} />
        <path d="M 68 148 Q 80 138, 92 148" fill="none" stroke={COLORS.ink} strokeWidth="2.5" />
        {/* Steam */}
        <path d="M 80 138 Q 76 130, 80 122 Q 84 116, 80 110" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round" opacity="0.7" style={{ transformOrigin: '80px 130px', animation: 'float-y 2.6s ease-in-out infinite' }} />

        {/* Cart wheels */}
        <circle cx="55" cy="215" r="8" fill={COLORS.ink} />
        <circle cx="105" cy="215" r="8" fill={COLORS.ink} />
      </svg>
    </div>
  )
}
