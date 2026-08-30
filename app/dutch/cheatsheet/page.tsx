'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import {
  Sticker,
  Tag,
  Mascot,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  useTheme,
} from '@/components/design'
import {
  getGroups,
  getTopics,
  getScores,
  getStudiedCount,
  isTopicStudied,
  markTopicStudied,
  unmarkTopicStudied,
  getWeakTopics,
  getTotalExerciseCount,
  PASS_THRESHOLD,
  MIXED_REVIEW_SIZE,
  type TopicScore,
  type CheatTopic,
} from '@/lib/dutch/cheatsheet'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color

const GROUP_COLORS: Record<string, string> = {
  start: COLORS.peach,
  grammar: COLORS.mint,
  people: COLORS.butter,
  sentences: COLORS.lav2,
  time: COLORS.rose,
}

export default function CheatsheetHubPage() {
  const router = useRouter()
  const theme = useTheme()
  const groups = getGroups()
  const totalTopics = getTopics().length
  const totalExercises = getTotalExerciseCount()

  const [studied, setStudied] = useState(0)
  const [scores, setScores] = useState<Record<string, TopicScore>>({})
  const [studiedIds, setStudiedIds] = useState<Set<string>>(new Set())
  const [weakCount, setWeakCount] = useState(0)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['start']))

  useEffect(() => {
    setStudied(getStudiedCount())
    setScores(getScores())
    setStudiedIds(new Set(getTopics().filter((t) => isTopicStudied(t.id)).map((t) => t.id)))
    setWeakCount(getWeakTopics().length)
  }, [])

  const passedCount = Object.values(scores).filter(
    (s) => s.total > 0 && s.best / s.total >= PASS_THRESHOLD,
  ).length
  const pct = totalTopics > 0 ? Math.round((passedCount / totalTopics) * 100) : 0

  const toggleCovered = (id: string) => {
    setStudiedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        unmarkTopicStudied(id)
        next.delete(id)
        playSound('tap')
      } else {
        markTopicStudied(id)
        next.add(id)
        playSound('correct')
      }
      setStudied(next.size)
      return next
    })
  }

  const toggleGroup = (id: string) => {
    playSound('tap')
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        paddingBottom: 120,
      }}
    >
      <DottedBg />

      {/* HEADER BAND */}
      <div
        style={{
          position: 'relative',
          padding: '46px 20px 22px',
          background: `linear-gradient(160deg, ${theme.bandFrom}, ${theme.bandTo})`,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          borderBottom: BORDER.sticker,
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/')}
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
            ← Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Tag>Cheatsheets</Tag>
              <h1
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 27,
                  color: COLORS.ink,
                  margin: '7px 0 3px',
                  lineHeight: 1.15,
                }}
              >
                Every concept, one page each
              </h1>
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 13,
                  color: COLORS.ink60,
                  margin: 0,
                }}
              >
                <em>de basis op een rij</em> · {totalTopics} topics · {totalExercises} practice
                questions
              </p>
            </div>
            <Mascot size={64} mood="happy" />
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '16px 20px 0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Mastery bar */}
        <Sticker color={W} radius={18} padding={16} style={{ marginBottom: 14 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 13,
              color: COLORS.ink,
              marginBottom: 6,
            }}
          >
            <span>Topics passed</span>
            <span>
              {passedCount} / {totalTopics}
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: COLORS.lav,
              borderRadius: 5,
              overflow: 'hidden',
              border: BORDER.sticker,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', background: theme.primary }}
            />
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 12,
              color: COLORS.ink60,
              marginTop: 8,
            }}
          >
            {studied} read
            {weakCount > 0 ? `, ${weakCount} still shaky` : ''}. A topic counts as passed once you
            score 80% or more on its drill.
          </div>
        </Sticker>

        {/* Mixed review */}
        <Sticker
          color={theme.primary}
          radius={20}
          padding={16}
          onClick={() => {
            playSound('pop')
            router.push('/dutch/cheatsheet/review')
          }}
          style={{ marginBottom: 22 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span style={{ fontSize: 30 }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: W }}>
                Mixed review
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
                {MIXED_REVIEW_SIZE} questions pulled from every topic at once
              </div>
            </div>
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: W }}>
              →
            </span>
          </div>
        </Sticker>

        {/* Groups */}
        {groups.map((group) => {
          const isOpen = openGroups.has(group.id)
          const groupPassed = group.topics.filter((t) => {
            const s = scores[t.id]
            return s && s.total > 0 && s.best / s.total >= PASS_THRESHOLD
          }).length
          return (
            <div key={group.id} style={{ marginBottom: 14 }}>
              <Sticker
                color={GROUP_COLORS[group.id] ?? COLORS.peach}
                radius={18}
                padding={14}
                onClick={() => toggleGroup(group.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ fontSize: 24 }}>{group.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 17,
                        color: COLORS.ink,
                      }}
                    >
                      {group.title}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 12,
                        color: COLORS.ink60,
                        fontStyle: 'italic',
                      }}
                    >
                      {group.subtitle_nl}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.ink,
                    }}
                  >
                    {groupPassed} / {group.topics.length} {isOpen ? '▴' : '▾'}
                  </div>
                </div>
                {isOpen && (
                  <p
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 12.5,
                      color: COLORS.ink60,
                      margin: '10px 0 0',
                      lineHeight: 1.45,
                    }}
                  >
                    {group.blurb}
                  </p>
                )}
              </Sticker>

              {isOpen && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 8,
                    paddingLeft: 8,
                  }}
                >
                  {group.topics.map((topic) => (
                    <TopicRow
                      key={topic.id}
                      topic={topic}
                      score={scores[topic.id]}
                      covered={studiedIds.has(topic.id)}
                      onOpen={() => {
                        playSound('tap')
                        router.push(`/dutch/cheatsheet/${topic.id}`)
                      }}
                      onToggleCovered={() => toggleCovered(topic.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


/**
 * One topic on the hub. Tapping the row opens the sheet; the check circle marks
 * it as covered, and so does a swipe (right to mark, left to clear). The drag is
 * direction-locked to the x axis so the list still scrolls normally.
 */
function TopicRow({
  topic,
  score,
  covered,
  onOpen,
  onToggleCovered,
}: {
  topic: CheatTopic
  score: TopicScore | undefined
  covered: boolean
  onOpen: () => void
  onToggleCovered: () => void
}) {
  const x = useMotionValue(0)
  // A swipe also ends in a DOM click on the card, which would navigate away.
  // Framer's onDragEnd can land after that click, so instead compare where the
  // pointer went down with where the click came up and swallow it if it moved.
  const downX = useRef(0)
  const markOpacity = useTransform(x, [0, 60], [0, 1])
  const clearOpacity = useTransform(x, [-60, 0], [1, 0])
  const ratio = score && score.total > 0 ? score.best / score.total : null
  const hasPassed = ratio !== null && ratio >= PASS_THRESHOLD

  return (
    <div
      style={{ position: 'relative' }}
      onPointerDownCapture={(e) => {
        downX.current = e.clientX
      }}
      onClickCapture={(e) => {
        if (Math.abs(e.clientX - downX.current) > 8) {
          e.stopPropagation()
          e.preventDefault()
        }
      }}
    >
      {/* what the swipe reveals underneath */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          background: covered ? COLORS.lav2 : COLORS.mint,
          border: BORDER.sticker,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 13,
          color: COLORS.ink,
        }}
      >
        <motion.span style={{ opacity: markOpacity }}>
          {covered ? '✕ not yet' : '✓ covered'}
        </motion.span>
        <motion.span style={{ opacity: clearOpacity }}>
          {covered ? '✕ not yet' : '✓ covered'}
        </motion.span>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        style={{ x, position: 'relative' }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 70) onToggleCovered()
        }}
      >
        <Sticker
          color={W}
          radius={14}
          padding={12}
          onClick={onOpen}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ fontSize: 21 }}>{topic.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 15,
                  color: COLORS.ink,
                }}
              >
                {topic.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 11.5,
                  color: COLORS.ink45,
                  fontStyle: 'italic',
                }}
              >
                {topic.subtitle_nl}
              </div>
            </div>

            {ratio !== null && (
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 11,
                  fontWeight: 800,
                  color: hasPassed ? GREEN : COLORS.ink60,
                  background: hasPassed ? COLORS.mint : COLORS.butter,
                  borderRadius: 99,
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {hasPassed ? '\u2713 ' : ''}
                {score!.best}/{score!.total}
              </span>
            )}

            <button
              aria-label={covered ? `Mark ${topic.title} as not covered` : `Mark ${topic.title} as covered`}
              aria-pressed={covered}
              onClick={(e) => {
                e.stopPropagation()
                onToggleCovered()
              }}
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: 99,
                border: BORDER.sticker,
                background: covered ? COLORS.mint : W,
                color: COLORS.ink,
                fontSize: 14,
                lineHeight: 1,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {covered ? '✓' : ''}
            </button>
          </div>
        </Sticker>
      </motion.div>
    </div>
  )
}
