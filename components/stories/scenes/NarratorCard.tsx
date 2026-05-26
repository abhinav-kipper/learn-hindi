'use client'

import { COLORS } from '@/components/design/tokens'

/**
 * Narrator card — neutral title-card style backdrop for narration panels.
 * Lavender dotted backdrop matching the rest-of-app aesthetic.
 */
export function NarratorCard() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 16,
        background: COLORS.lav,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.lav2} 1px, transparent 0)`,
        backgroundSize: '12px 12px',
      }}
    />
  )
}
