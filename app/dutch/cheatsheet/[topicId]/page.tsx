'use client'

import { use, useEffect, useState } from 'react'
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
import { SectionView } from '@/components/cheatsheet/CheatBlocks'
import { DutchTermProvider } from '@/components/cheatsheet/DutchTerm'
import {
  getTopicById,
  getGroupOfTopic,
  getNextTopic,
  getTopicScore,
  isTopicStudied,
  markTopicStudied,
  unmarkTopicStudied,
  PASS_THRESHOLD,
  type TopicScore,
} from '@/lib/dutch/cheatsheet'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color

export default function CheatsheetTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = use(params)
  const router = useRouter()
  const theme = useTheme()
  const topic = getTopicById(topicId)
  const group = getGroupOfTopic(topicId)
  const next = getNextTopic(topicId)

  const [studied, setStudied] = useState(false)
  const [score, setScore] = useState<TopicScore | undefined>(undefined)

  useEffect(() => {
    if (!topic) return
    setStudied(isTopicStudied(topicId))
    setScore(getTopicScore(topicId))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }, [topicId, topic])

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

  const passed = score && score.total > 0 && score.best / score.total >= PASS_THRESHOLD

  const onToggleRead = () => {
    if (studied) {
      playSound('tap')
      unmarkTopicStudied(topicId)
      setStudied(false)
    } else {
      playSound('complete')
      markTopicStudied(topicId)
      setStudied(true)
    }
  }

  return (
    <DutchTermProvider>
      <div style={{ minHeight: '100dvh', background: COLORS.lav, paddingBottom: 120 }}>
        {/* HEADER */}
        <div
          style={{
            padding: '44px 20px 20px',
            background: `linear-gradient(160deg, ${theme.bandFrom}, ${theme.bandTo})`,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            borderBottom: BORDER.sticker,
          }}
        >
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <button
              onClick={() => router.push('/dutch/cheatsheet')}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.ink,
                fontSize: 14,
                fontFamily: FONTS.body,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                marginBottom: 10,
              }}
            >
              ← All cheatsheets
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 36, lineHeight: 1 }}>{topic.emoji}</span>
              <div style={{ flex: 1 }}>
                {group && <Tag>{group.title}</Tag>}
                <h1
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 26,
                    color: COLORS.ink,
                    margin: '7px 0 3px',
                    lineHeight: 1.15,
                  }}
                >
                  {topic.title}
                </h1>
                <p
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: COLORS.ink60,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  {topic.subtitle_nl}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 20px 0' }}>
          {/* Summary */}
          <Sticker color={COLORS.cream} radius={18} padding={15} style={{ marginBottom: 18 }}>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: 14.5,
                color: COLORS.ink,
                margin: 0,
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              {topic.summary}
            </p>
          </Sticker>

          {/* Sections */}
          {topic.sections.map((section, i) => (
            <SectionView key={i} section={section} index={i} />
          ))}

          {/* Takeaways */}
          <Sticker color={COLORS.mint} radius={20} padding={16} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                color: COLORS.ink,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
                marginBottom: 10,
              }}
            >
              Remember this much
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              {topic.key_takeaways.map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    color: COLORS.ink,
                    lineHeight: 1.45,
                    fontWeight: 600,
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </Sticker>

          {/* Practice CTA */}
          <Sticker
            color={theme.primary}
            radius={20}
            padding={16}
            onClick={() => {
              playSound('pop')
              router.push(`/dutch/cheatsheet/${topicId}/practice`)
            }}
            style={{ marginBottom: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Mascot size={48} mood="happy" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: W }}>
                  Practise this topic
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 12.5,
                    color: W,
                    opacity: 0.92,
                    marginTop: 2,
                  }}
                >
                  {topic.exercises.length} questions
                  {score
                    ? ` · best ${score.best}/${score.total}${passed ? ' ✓' : ''}`
                    : ' · not tried yet'}
                </div>
              </div>
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>
                →
              </span>
            </div>
          </Sticker>

          {/* Mark as read */}
          <Sticker
            color={studied ? COLORS.mint2 : W}
            radius={16}
            padding={13}
            onClick={onToggleRead}
            style={{ marginBottom: 12 }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14.5,
                color: studied ? GREEN : COLORS.ink,
                textAlign: 'center',
              }}
            >
              {studied ? '✓ Marked as read, tap to undo' : 'Mark as read'}
            </div>
          </Sticker>

          {next && (
            <Sticker
              color={W}
              radius={16}
              padding={13}
              onClick={() => {
                playSound('swipe')
                router.push(`/dutch/cheatsheet/${next.id}`)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 19 }}>{next.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 11.5,
                      color: COLORS.ink45,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Next up
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 15,
                      color: COLORS.ink,
                    }}
                  >
                    {next.title}
                  </div>
                </div>
                <span
                  style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink }}
                >
                  →
                </span>
              </div>
            </Sticker>
          )}
        </div>
      </div>
    </DutchTermProvider>
  )
}
