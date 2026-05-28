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
  /** Top color of the home header band gradient. */
  bandFrom: string
  /** Bottom color of the home header band gradient. */
  bandTo: string
  /** Home header greeting tag, language-appropriate. */
  greetingTag: string
  Mascot: ComponentType<MascotProps>
}

/**
 * Resolve the active visual theme from the current language.
 * Hindi → Holi pink + Cutting (chai-cup mascot) + soft rose-cream home band.
 * Dutch → orange (national color) + Mr. Stroopwafels (waffle-cookie mascot) + peach home band.
 */
export function useTheme(): Theme {
  const { language } = useLanguage()
  if (language === 'dutch') {
    return {
      primary: COLORS.orange,
      primary2: COLORS.orange2,
      bandFrom: COLORS.peach,
      bandTo: COLORS.peach2,
      greetingTag: '☼ hoi, alles goed?',
      Mascot: MrStroopwafel,
    }
  }
  return {
    primary: COLORS.pink,
    primary2: COLORS.pink2,
    bandFrom: COLORS.rose,
    bandTo: COLORS.cream,
    greetingTag: '☼ namaste, dost',
    Mascot: Cutting,
  }
}
