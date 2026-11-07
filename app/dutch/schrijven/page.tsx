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
  useTheme,
} from '@/components/design'
import {
  getSchrijfTasks,
  getTasksByType,
  getDoneCount,
  isTaskDone,
  getNextTask,
  TASK_TYPES,
  EXAM_TASK_COUNT,
  EXAM_MINUTES,
  type SchrijfTask,
} from '@/lib/dutch/schrijven'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color

export default function SchrijvenModulePage() {
  const router = useRouter()
  const theme = useTheme()
  const [doneCount, setDoneCount] = useState(0)
  const [next, setNext] = useState<SchrijfTask | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDoneCount(getDoneCount())
    setNext(getNextTask())
    setReady(true)
  }, [])

  const total = getSchrijfTasks().length

  const open = (id: string) => {
    playSound('pop')
    router.push(`/dutch/schrijven/${id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
            }}
          >
            ← Back
          </button>
          <Tag>Schrijven</Tag>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink,
            margin: '6px 0 4px',
          }}>
            Writing practice
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.7, margin: 0 }}>
            <em>Schrijven oefenen</em> · {ready ? doneCount : 0} / {total} done
          </p>
        </div>

        {/* What the real paper looks like. Writing is the paper people prepare
            for least, so say plainly what it asks for. */}
        <Sticker color={COLORS.butter} radius={18} padding={14} style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
          }}>
            The real paper
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
            <strong>{EXAM_TASK_COUNT} tasks in about {EXAM_MINUTES} minutes</strong>, on paper: a form,
            a short note, a semi-formal email and a short free text. It is marked on whether you
            covered <strong>every point the task asked for</strong>, so each task here shows you that
            checklist.
          </p>
        </Sticker>

        {ready && next && (
          <Sticker
            color={theme.primary}
            radius={22}
            padding={16}
            onClick={() => open(next.id)}
            style={{ marginBottom: 22 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Mascot size={56} mood="happy" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: W }}>
                  {doneCount === 0 ? 'Start writing' : 'Continue'}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.92, marginTop: 2 }}>
                  {next.title_en}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 11, color: W, opacity: 0.78, marginTop: 4, fontStyle: 'italic' }}>
                  Write it, then get it checked line by line.
                </div>
              </div>
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>→</span>
            </div>
          </Sticker>
        )}

        {TASK_TYPES.map((type) => {
          const tasks = getTasksByType(type.key)
          if (tasks.length === 0) return null
          return (
            <div key={type.key} style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink,
                }}>
                  {type.en} <span style={{ fontWeight: 400, fontStyle: 'italic', opacity: 0.6, fontSize: 13 }}>{type.nl}</span>
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65 }}>
                  {type.blurb}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map((t) => {
                  const done = ready && isTaskDone(t.id)
                  return (
                    <Sticker key={t.id} color={W} radius={16} padding={12} onClick={() => open(t.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                            {t.title_en}
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.65, marginTop: 1 }}>
                            {t.situation_en}
                          </div>
                        </div>
                        <span style={{
                          background: COLORS.lav, border: BORDER.sticker, borderRadius: 999,
                          padding: '1px 8px', fontFamily: FONTS.display, fontWeight: 800,
                          fontSize: 10.5, color: COLORS.ink, flexShrink: 0,
                        }}>
                          {t.tier}
                        </span>
                        {done && (
                          <span style={{
                            fontFamily: FONTS.display, fontWeight: 800, fontSize: 13,
                            color: GREEN, flexShrink: 0,
                          }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </Sticker>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
