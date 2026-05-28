'use client'

import { COLORS } from '@/components/design/tokens'

const W = '#fff' // @design-allow: white literal
const NIGHT = '#2a2350' // @design-allow: Diwali night-sky indigo, not a system token
const NIGHT2 = '#3d3470' // @design-allow: lighter night band for gradient feel

/**
 * Diwali night — a rooftop under an indigo sky, a marigold toran strung across
 * the top, a row of glowing diyas on the parapet, a distant skyline, and a
 * small firework burst. Chai Galli style: ink borders, hard shapes, warm glow.
 */
export function DiwaliRooftopScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {/* Night sky */}
        <rect x="0" y="0" width="400" height="240" fill={NIGHT} />
        <rect x="0" y="0" width="400" height="90" fill={NIGHT2} opacity="0.6" />

        {/* Stars */}
        <circle cx="60" cy="30" r="1.6" fill={W} />
        <circle cx="120" cy="20" r="1.4" fill={W} />
        <circle cx="330" cy="26" r="1.6" fill={W} />
        <circle cx="290" cy="48" r="1.3" fill={W} />
        <circle cx="190" cy="18" r="1.3" fill={W} />

        {/* Firework burst (top-right) */}
        <g stroke={COLORS.pink} strokeWidth="2" strokeLinecap="round">
          <line x1="320" y1="60" x2="320" y2="44" />
          <line x1="320" y1="60" x2="334" y2="50" />
          <line x1="320" y1="60" x2="306" y2="50" />
          <line x1="320" y1="60" x2="332" y2="68" />
          <line x1="320" y1="60" x2="308" y2="68" />
        </g>
        <circle cx="320" cy="44" r="1.8" fill={COLORS.butter} />
        <circle cx="334" cy="50" r="1.8" fill={COLORS.mint} />
        <circle cx="306" cy="50" r="1.8" fill={COLORS.butter} />

        {/* Distant skyline silhouette */}
        <rect x="0" y="120" width="50" height="40" fill={COLORS.ink} opacity="0.55" />
        <rect x="55" y="105" width="36" height="55" fill={COLORS.ink} opacity="0.55" />
        <rect x="300" y="112" width="44" height="48" fill={COLORS.ink} opacity="0.55" />
        <rect x="350" y="98" width="50" height="62" fill={COLORS.ink} opacity="0.55" />

        {/* Marigold toran (string of flowers across the top) */}
        <path d="M 0 14 Q 200 40, 400 14" fill="none" stroke={COLORS.orange} strokeWidth="2" opacity="0.7" />
        {[20, 70, 120, 170, 200, 230, 280, 330, 380].map((x, i) => {
          const y = 14 + Math.sin((x / 400) * Math.PI) * 22
          return <circle key={i} cx={x} cy={y} r="5" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth="1.5" />
        })}

        {/* Rooftop parapet */}
        <rect x="0" y="170" width="400" height="70" fill={COLORS.peach2} opacity="0.85" />
        <line x1="0" y1="170" x2="400" y2="170" stroke={COLORS.ink} strokeWidth="2.5" />

        {/* Diyas (clay lamps with flames) along the parapet */}
        {[40, 110, 270, 350].map((x, i) => (
          <g key={i}>
            <path d={`M ${x - 12} 168 Q ${x} 178, ${x + 12} 168 Z`} fill={COLORS.orange2} stroke={COLORS.ink} strokeWidth="2" />
            <path d={`M ${x} 168 Q ${x - 4} 158, ${x} 152 Q ${x + 4} 158, ${x} 168 Z`} fill={COLORS.butter} stroke={COLORS.orange} strokeWidth="1.5" />
            <circle cx={x} cy={160} r="6" fill={COLORS.butter} opacity="0.35" />
          </g>
        ))}
      </svg>
    </div>
  )
}
