'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLORS } from '@/components/design'
import { DrillRunner } from '@/components/cheatsheet/DrillRunner'
import { drawMixedReview, MIXED_REVIEW_SIZE, type Exercise } from '@/lib/dutch/cheatsheet'

export default function CheatsheetMixedReviewPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Drawn on the client so the shuffle never mismatches the server render.
  useEffect(() => {
    setExercises(drawMixedReview(MIXED_REVIEW_SIZE))
  }, [])

  if (exercises.length === 0) {
    return <div style={{ minHeight: '100dvh', background: COLORS.lav }} />
  }

  return (
    <DrillRunner
      title="Mixed review"
      subtitle="alles door elkaar"
      exercises={exercises}
      onExit={() => router.push('/dutch/cheatsheet')}
      doneCtaLabel="Back to all cheatsheets"
      onDoneCta={() => router.push('/dutch/cheatsheet')}
    />
  )
}
