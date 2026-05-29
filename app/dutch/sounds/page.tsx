'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sticker,
  Tag,
  Mascot,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'
import {
  getStages,
  getStageProgress,
  isStageComplete,
  isStageUnlocked,
  getCourseProgress,
  type PronStage,
} from '@/lib/dutch/pronunciation'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal

export default function SoundsModulePage() {
  const router = useRouter()
  const theme = useTheme()
  const [ready, setReady] = useState(false)

  // Progress lives in localStorage; read after mount to avoid hydration mismatch.
  useEffect(() => setReady(true), [])

  const stages = getStages()
  const course = ready ? getCourseProgress() : { completed: 0, total: stages.length }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, paddingBottom: 120 }}>
      {/* HEADER BAND */}
      <div
        style={{
          padding: '46px 20px 18px',
          background: theme.primary,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => router.push('/')}
                aria-label="Back to home"
                style={{
                  background: W, border: BORDER.sticker, boxShadow: SHADOW.chip,
                  borderRadius: 999, padding: '5px 13px', fontFamily: FONTS.display,
                  fontWeight: 800, fontSize: 13, color: COLORS.ink, cursor: 'pointer', marginBottom: 10,
                }}
              >
                ◀ back
              </button>
              <Tag bg={W} color={COLORS.ink}>🔊 sounds</Tag>
              <h1 style={{ fontFamily: FONTS.display, fontSize: 27, fontWeight: 800, color: W, margin: '8px 0 2px', letterSpacing: -0.5 }}>
                learn to speak from zero
              </h1>
              <p style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.92, margin: 0 }}>
                <em>uitspraak</em> · letters → words → flow · {course.completed} / {course.total} stages
              </p>
            </div>
            <div style={{ marginRight: -4, marginTop: -2 }}>
              <Mascot size={66} mood="happy" />
            </div>
          </div>
        </div>
      </div>

      {/* LADDER */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stages.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            ready={ready}
            primary={theme.primary}
            onOpen={() => {
              playSound('pop')
              router.push(`/dutch/sounds/${stage.id}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function StageRow({
  stage,
  ready,
  primary,
  onOpen,
}: {
  stage: PronStage
  ready: boolean
  primary: string
  onOpen: () => void
}) {
  const complete = ready && isStageComplete(stage)
  const unlocked = !ready ? stage.order <= 1 : isStageUnlocked(stage)
  const progress = ready ? getStageProgress(stage) : { done: 0, total: 1 }
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  const bg = complete ? COLORS.mint2 : unlocked ? W : COLORS.lav2
  const dim = !unlocked

  const body = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: dim ? 0.55 : 1 }}>
      {/* number / lock / check disc */}
      <div
        style={{
          width: 38, height: 38, flexShrink: 0, borderRadius: 999,
          background: complete ? COLORS.green : unlocked ? primary : COLORS.ink45,
          border: BORDER.thin, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W,
        }}
      >
        {complete ? '✓' : unlocked ? stage.order + 1 : '🔒'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink, lineHeight: 1.2 }}>
          {stage.title}
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink60, fontStyle: 'italic' }}>
          {stage.subtitle}
        </div>
        {unlocked && !complete && progress.total > 0 && (
          <div style={{ marginTop: 6, height: 6, background: W, borderRadius: 99, border: BORDER.thin, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: primary }} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink60, flexShrink: 0 }}>
        {complete ? 'done' : unlocked ? `${progress.done}/${progress.total}` : 'locked'}
      </div>
    </div>
  )

  if (!unlocked) {
    return (
      <Sticker color={bg} radius={16} padding={12}>
        {body}
      </Sticker>
    )
  }
  return (
    <Sticker color={bg} radius={16} padding={12} onClick={onOpen}>
      {body}
    </Sticker>
  )
}
