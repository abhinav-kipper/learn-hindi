'use client'

import { useTheme, type MascotProps } from './theme'

/**
 * Theme-aware mascot. Renders Cutting for Hindi, Mr. Stroopwafels for Dutch.
 * Drop-in replacement for direct <Cutting> use anywhere in the app.
 */
export function Mascot(props: MascotProps) {
  const { Mascot: Resolved } = useTheme()
  return <Resolved {...props} />
}
