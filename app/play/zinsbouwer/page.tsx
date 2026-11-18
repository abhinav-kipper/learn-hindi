'use client'

import { useEffect, useState } from 'react'
import { Zinsbouwer } from '@/components/games/Zinsbouwer'
import { COLORS } from '@/components/design'

export default function ZinsbouwerPage() {
  // Mount gate, deliberately. The theme (and mascot) come from the language in
  // localStorage, which the server cannot know, so a server-rendered shell is
  // always the Hindi one. React does not repaint attributes that mismatch on
  // hydration, so on a hard load the Dutch track would keep the Hindi pink for
  // as long as the screen lived. Rendering the game only after mount means the
  // first client render is also the first render, and the colours are right.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ minHeight: '100dvh', background: COLORS.lav }} />
  return <Zinsbouwer />
}
