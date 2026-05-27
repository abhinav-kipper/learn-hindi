'use client'

import type { ComponentType } from 'react'
import { useLanguage } from '@/lib/language-context'
import { COLORS } from './tokens'
import { Cutting } from './Cutting'
import { MrStroopwafel } from './MrStroopwafel'

export type MascotMood = 'idle' | 'happy' | 'wave' | 'sympathy' | 'wink' | 'excited' | 'sleepy'

export interface MascotProps {
  size?: number
  mood?: MascotMood
  blink?: boolean
  style?: React.CSSProperties
}

export interface Theme {
  primary: string
  primary2: string
  Mascot: ComponentType<MascotProps>
}

/**
 * Resolve the active visual theme from the current language.
 * Hindi → Holi pink + Cutting (chai-cup mascot).
 * Dutch → orange (national color) + Mr. Stroopwafels (waffle-cookie mascot).
 */
export function useTheme(): Theme {
  const { language } = useLanguage()
  if (language === 'dutch') {
    return { primary: COLORS.orange, primary2: COLORS.orange2, Mascot: MrStroopwafel }
  }
  return { primary: COLORS.pink, primary2: COLORS.pink2, Mascot: Cutting }
}
