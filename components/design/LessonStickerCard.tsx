'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sticker } from './Sticker'
import { MotifIcon } from './MotifIcon'
import { COLORS, FONTS, BORDER, deriveLessonStyle, paletteToBg, paletteToMotifBg } from './tokens'
const W = '#fff' // @design-allow: white literal
import type { Lesson } from '@/types/lesson'
import { isLessonComplete, getLessonCompletedAt } from '@/lib/progress'
import { getLessonPercent } from '@/lib/phrase-progress'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import { markAsSeen } from '@/lib/seen-lessons'

function daysAgo(isoDate: string): number {
  const todayStr = new Date().toISOString().split('T')[0]
  if (isoDate === todayStr) return 0
  const a = Date.parse(isoDate + 'T00:00:00Z')
  const b = Date.parse(todayStr + 'T00:00:00Z')
  if (isNaN(a) || isNaN(b)) return 0
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)))
}

interface Props {
  lesson: Lesson
  index: number
  routeBase?: 'lessons' | 'foundations'
  locked?: boolean
  isNew?: boolean
}

export function LessonStickerCard({ lesson, index, routeBase = 'lessons', locked = false, isNew = false }: Props) {
  const router = useRouter()
  const { config } = useLanguage()
  const { palette, motif } = deriveLessonStyle(lesson.id, index)
  const [done, setDone] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const isDone = isLessonComplete(lesson.id, config.storagePrefix)
    setDone(isDone)
    setCompletedAt(isDone ? getLessonCompletedAt(lesson.id, config.storagePrefix) : null)
    setPercent(getLessonPercent(lesson, config.storagePrefix))
  }, [lesson, config.storagePrefix])

  const totalPhrases = lesson.phrases?.length ?? 10
  const phrasesDone = Math.round((percent / 100) * totalPhrases)
  const bg = paletteToBg(palette)
  const motifBg = paletteToMotifBg(palette)

  const onClick = () => {
    if (locked) return
    playSound('pop')
    if (isNew) markAsSeen(lesson.id)
    router.push(`/${routeBase}/${lesson.id}`)
  }

  return (
    <div style={{ opacity: locked ? 0.5 : 1, pointerEvents: locked ? 'none' : 'auto', position: 'relative' }}>
      {isNew && (
        <span
          aria-label="new"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLORS.orange,
            zIndex: 2,
            boxShadow: '0 0 0 2px #fff', // @design-allow: white halo for dot contrast
          }}
        />
      )}
      <Sticker color={bg} radius={22} padding={0} onClick={onClick} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div
            style={{
              background: motifBg,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: BORDER.sticker,
              minWidth: 88,
            }}
          >
            <MotifIcon kind={motif} size={64} />
          </div>
          <div style={{ flex: 1, padding: '14px 14px 12px 14px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: FONTS.tag,
                  fontSize: 10,
                  background: COLORS.ink,
                  color: COLORS.cream,
                  padding: '2px 8px',
                  borderRadius: 99,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                #{(index + 1).toString().padStart(2, '0')}
              </span>
              {done && (
                <span
                  style={{
                    fontFamily: FONTS.tag,
                    fontSize: 10,
                    background: COLORS.green,
                    color: W,
                    padding: '2px 8px',
                    borderRadius: 99,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    border: BORDER.thin,
                  }}
                >
                  {completedAt ? `✓ done · ${daysAgo(completedAt)}d` : '✓ done'}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 17,
                color: COLORS.ink,
                lineHeight: 1.15,
                marginTop: 6,
                letterSpacing: -0.3,
              }}
            >
              {lesson.title}
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                color: COLORS.ink60,
                marginTop: 3,
                fontWeight: 600,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {lesson.situation}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(lesson.skills ?? []).slice(0, 3).map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 800,
                    fontSize: 10,
                    color: COLORS.ink,
                    background: W,
                    border: BORDER.thin,
                    padding: '2px 7px',
                    borderRadius: 99,
                    letterSpacing: 0.2,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            {!done && percent > 0 && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    height: 9,
                    background: W,
                    borderRadius: 99,
                    border: BORDER.thin,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: COLORS.orange,
                      borderRight: percent < 100 ? BORDER.thin : 'none',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 12,
                    color: COLORS.ink,
                  }}
                >
                  {phrasesDone}/{totalPhrases}
                </span>
              </div>
            )}
          </div>
        </div>
      </Sticker>
    </div>
  )
}
