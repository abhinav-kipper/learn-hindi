'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLORS, FONTS, BORDER } from '@/components/design'
import { DrillRunner } from '@/components/cheatsheet/DrillRunner'
import {
  drawTopicDrill,
  getTopicById,
  getNextTopic,
  recordDrillResult,
  markTopicStudied,
  type Exercise,
} from '@/lib/dutch/cheatsheet'

export default function CheatsheetPracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = use(params)
  const router = useRouter()
  const topic = getTopicById(topicId)
  const next = getNextTopic(topicId)
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Drawn on the client so the shuffle never mismatches the server render.
  useEffect(() => {
    setExercises(drawTopicDrill(topicId))
  }, [topicId])

  const onFinish = useCallback(
    (score: number, total: number) => {
      recordDrillResult(topicId, score, total)
      markTopicStudied(topicId)
    },
    [topicId],
  )

  if (!topic) {
    return (
      <div style={{ minHeight: '100dvh', background: COLORS.lav, padding: 24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FONTS.body, color: COLORS.ink }}>
          That cheatsheet does not exist.
          <button
            onClick={() => router.push('/dutch/cheatsheet')}
            style={{
              background: COLORS.butter,
              border: BORDER.sticker,
              padding: '6px 12px',
              borderRadius: 8,
              marginLeft: 12,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return <div style={{ minHeight: '100dvh', background: COLORS.lav }} />
  }

  return (
    <DrillRunner
      title={topic.title}
      subtitle={topic.subtitle_nl}
      exercises={exercises}
      onExit={() => router.push(`/dutch/cheatsheet/${topicId}`)}
      onFinish={onFinish}
      doneCtaLabel={next ? `Next topic: ${next.title}` : 'Back to all cheatsheets'}
      onDoneCta={() =>
        router.push(next ? `/dutch/cheatsheet/${next.id}` : '/dutch/cheatsheet')
      }
    />
  )
}
