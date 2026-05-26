'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getProgress } from '@/lib/progress'
import { getQuizScores, getAverageQuizScore } from '@/lib/quiz'
import { getReviewSessions } from '@/lib/review'
import { getAllLessons, getAllContent } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getLessonPercent } from '@/lib/phrase-progress'
import { getFavorites } from '@/lib/favorites'
import { getMistakes } from '@/lib/mistakes'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import type { Lesson } from '@/types/lesson'
import {
  Sticker,
  Tag,
  Cutting,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
const W = '#fff' // @design-allow: white literal

interface Stats {
  phrasesLearned: number
  practiceCount: number
  quizAverage: number
  lessonsCompleted: number
  currentStreak: number
  lastActiveDate: string
  mistakesCount: number
  favoritesCount: number
}

interface ActivityItem {
  type: 'lesson' | 'quiz' | 'review'
  description: string
  date: string
}

export default function ProgressPage() {
  const router = useRouter()
  const { language, config } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [streakDays, setStreakDays] = useState<Array<'active' | 'pending' | 'inactive'>>([])

  useEffect(() => {
    const prefix = config.storagePrefix
    const progress = getProgress(prefix)
    const allContent =
      language === 'dutch' ? [...getDutchLessons(), ...getDutchFoundations()] : getAllContent()
    const quizScores = getQuizScores(prefix)
    const reviewSessions = getReviewSessions(prefix)
    const completedLessons = allContent.filter((l) => progress.completedLessons.includes(l.id))
    const phrasesLearned = completedLessons.reduce((sum, l) => sum + l.phrases.length, 0)

    setStats({
      phrasesLearned,
      practiceCount: progress.practiceSessionCount,
      quizAverage: getAverageQuizScore(prefix),
      lessonsCompleted: progress.completedLessons.length,
      currentStreak: progress.currentStreak,
      lastActiveDate: progress.lastActiveDate,
      mistakesCount: getMistakes(prefix).length,
      favoritesCount: getFavorites(prefix).length,
    })

    const recentActivities: ActivityItem[] = []
    quizScores.slice(-3).forEach((score) => {
      recentActivities.push({
        type: 'quiz',
        description: `Quiz: ${score.score}/${score.total} correct`,
        date: score.date,
      })
    })
    reviewSessions.slice(-3).forEach((session) => {
      recentActivities.push({
        type: 'review',
        description: `Review: ${session.gotIt}/${session.reviewed} mastered`,
        date: session.date,
      })
    })
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setActivities(recentActivities.slice(0, 5))

    // 7-day streak calendar — DST-safe via YYYY-MM-DD comparison
    const todayStr = new Date().toISOString().split('T')[0]
    const activeSet = new Set<string>()
    if (progress.lastActiveDate && progress.currentStreak > 0) {
      const last = new Date(progress.lastActiveDate)
      for (let i = 0; i < progress.currentStreak; i++) {
        const d = new Date(last)
        d.setDate(d.getDate() - i)
        activeSet.add(d.toISOString().split('T')[0])
      }
    }

    const dayStates: Array<'active' | 'pending' | 'inactive'> = []
    const todayDate = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (activeSet.has(dateStr)) dayStates.push('active')
      else if (dateStr === todayStr && progress.currentStreak > 0) dayStates.push('pending')
      else dayStates.push('inactive')
    }
    setStreakDays(dayStates)
  }, [language, config.storagePrefix])

  const lessons = useMemo(
    () => (language === 'dutch' ? getDutchLessons() : getAllLessons()),
    [language],
  )
  const foundations = useMemo(
    () => (language === 'dutch' ? getDutchFoundations() : getAllFoundations()),
    [language],
  )

  if (!stats) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: COLORS.lav,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            border: `3px solid ${COLORS.ink}`, // @design-allow: CSS spinner ring, not a sticker surface
            borderTopColor: 'transparent',
          }}
        />
      </div>
    )
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayDow = new Date().getDay()
  const reorderedLabels = [...Array(7)].map((_, i) => {
    const idx = (todayDow - (6 - i) + 7) % 7
    return dayLabels[idx]
  })

  const nextMilestone = [7, 14, 30, 100].find((m) => m > stats.currentStreak) ?? null
  const milestoneRemaining = nextMilestone ? nextMilestone - stats.currentStreak : 0

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.lav2,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <div>
            <Tag>✦ progress</Tag>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 28,
                color: COLORS.ink,
                lineHeight: 1.05,
                marginTop: 6,
                letterSpacing: -0.5,
              }}
            >
              your story so far
            </div>
          </div>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting size={62} />
          </div>
        </div>
      </motion.div>

      <div
        style={{
          padding: '16px 20px 0',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* STREAK HERO */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 22 }}
        >
          <Sticker color={COLORS.orange2} radius={26} padding={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: COLORS.orange,
                  borderRadius: 18,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                  flexShrink: 0,
                  animation: 'float-y 3s ease-in-out infinite',
                }}
              >
                <span style={{ animation: 'flame-flicker 1.6s ease-in-out infinite' }}>🔥</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Tag>day streak</Tag>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 44,
                    color: COLORS.ink,
                    lineHeight: 1,
                    letterSpacing: -1,
                    marginTop: 4,
                  }}
                >
                  <AnimatedNumber value={stats.currentStreak} />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 2,
                  }}
                >
                  {nextMilestone
                    ? `next milestone: ${nextMilestone} days · ${milestoneRemaining} to go`
                    : 'you are crushing it 🏆'}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 4,
              }}
            >
              {streakDays.map((state, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    background:
                      state === 'active' ? COLORS.orange : state === 'pending' ? W : W,
                    border:
                      state === 'pending'
                        ? `2.5px dashed ${COLORS.ink}`
                        : `2px solid ${COLORS.ink}`,
                    color: state === 'active' ? W : COLORS.ink45,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                >
                  {state === 'active' ? '✓' : reorderedLabels[i]}
                </div>
              ))}
            </div>
          </Sticker>
        </motion.div>

        {/* 2x2 STAT GRID */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          <StatTile
            emoji="📝"
            value={stats.phrasesLearned}
            label="phrases"
            bg={COLORS.mint2}
            delay={0}
          />
          <StatTile
            emoji="💬"
            value={stats.practiceCount}
            label="practice"
            bg={COLORS.butter}
            delay={0.05}
          />
          <StatTile
            emoji="🎯"
            value={stats.quizAverage}
            suffix="%"
            label="quiz avg"
            bg={COLORS.peach2}
            delay={0.1}
          />
          <StatTile
            emoji="📚"
            value={stats.lessonsCompleted}
            label="lessons"
            bg={COLORS.lav2}
            delay={0.15}
          />
        </motion.div>

        {/* TOOLS ROW */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}
        >
          <ToolTile
            emoji="🔍"
            value={stats.mistakesCount}
            label="mistakes"
            bg={COLORS.redBg}
            onClick={() => router.push('/mistakes')}
          />
          <ToolTile
            emoji="⭐"
            value={stats.favoritesCount}
            label="saved"
            bg={COLORS.butter}
            onClick={() => router.push('/favorites')}
          />
          <ToolTile
            emoji="🔡"
            label="drill"
            bg={COLORS.mint2}
            onClick={() => router.push('/drill/conjugation')}
          />
        </motion.div>

        {/* LESSON PROGRESS */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Sticker color={W} radius={22} padding={18}>
            <LessonGroup
              title="situations"
              lessons={lessons}
              prefix={config.storagePrefix}
            />
            <div style={{ height: 1, borderTop: `1px dashed ${COLORS.ink45}`, margin: '14px 0' }} />
            <LessonGroup
              title="foundations"
              lessons={foundations}
              prefix={config.storagePrefix}
            />
          </Sticker>
        </motion.div>

        {/* RECENT ACTIVITY */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                color: COLORS.ink,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              recent
            </div>
            <Sticker color={W} radius={18} padding={14}>
              {activities.map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom:
                      i < activities.length - 1 ? `1px dashed ${COLORS.ink45}33` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: COLORS.creamBg,
                      border: BORDER.thin,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {activity.type === 'quiz' ? '🎯' : activity.type === 'review' ? '🔄' : '📖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: FONTS.body,
                        fontWeight: 700,
                        fontSize: 13,
                        color: COLORS.ink,
                      }}
                    >
                      {activity.description}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.tag,
                        fontSize: 9,
                        color: COLORS.ink45,
                        marginTop: 2,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {relativeDate(activity.date)}
                    </div>
                  </div>
                </div>
              ))}
            </Sticker>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function relativeDate(iso: string): string {
  const today = new Date().toISOString().split('T')[0]
  const date = new Date(iso).toISOString().split('T')[0]
  if (date === today) return 'today'
  const a = Date.parse(date + 'T00:00:00Z')
  const b = Date.parse(today + 'T00:00:00Z')
  const days = Math.round((b - a) / (1000 * 60 * 60 * 24))
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  return `${Math.floor(days / 7)} weeks ago`
}

function StatTile({
  emoji,
  value,
  suffix,
  label,
  bg,
  delay,
}: {
  emoji: string
  value: number
  suffix?: string
  label: string
  bg: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <Sticker color={bg} radius={18} padding={14}>
        <div style={{ fontSize: 20 }}>{emoji}</div>
        <div
          style={{
            marginTop: 4,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            lineHeight: 1,
          }}
        >
          <AnimatedNumber value={value} suffix={suffix} />
        </div>
        <div
          style={{
            fontFamily: FONTS.tag,
            fontSize: 10,
            color: COLORS.ink60,
            marginTop: 4,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      </Sticker>
    </motion.div>
  )
}

function ToolTile({
  emoji,
  value,
  label,
  bg,
  onClick,
}: {
  emoji: string
  value?: number
  label: string
  bg: string
  onClick: () => void
}) {
  return (
    <Sticker
      color={bg}
      radius={16}
      padding={10}
      onClick={() => {
        playSound('tap')
        onClick()
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24 }}>{emoji}</div>
        {value !== undefined && (
          <div
            style={{
              marginTop: 2,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 20,
              color: COLORS.ink,
              lineHeight: 1,
            }}
          >
            {value}
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.tag,
            fontSize: 9,
            color: COLORS.ink60,
            marginTop: value !== undefined ? 4 : 6,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      </div>
    </Sticker>
  )
}

function LessonGroup({
  title,
  lessons,
  prefix,
}: {
  title: string
  lessons: Lesson[]
  prefix: string
}) {
  const [expandDone, setExpandDone] = useState(false)
  const rows = useMemo(
    () => lessons.map((l) => ({ lesson: l, pct: getLessonPercent(l, prefix) })),
    [lessons, prefix],
  )
  const active = rows.filter((r) => r.pct < 100)
  const done = rows.filter((r) => r.pct === 100)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 14,
            color: COLORS.ink,
            textTransform: 'lowercase',
            letterSpacing: -0.2,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 12,
            color: COLORS.ink60,
          }}
        >
          {done.length}/{rows.length} done
        </span>
      </div>

      {active.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {done.length > 0 && (
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 10,
                color: COLORS.ink45,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: -2,
              }}
            >
              still to do ({active.length})
            </div>
          )}
          {active.map(({ lesson, pct }) => (
            <LessonRow key={lesson.id} title={lesson.title} pct={pct} />
          ))}
        </div>
      ) : (
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 12,
            color: COLORS.green,
          }}
        >
          all done — nice work 🎉
        </div>
      )}

      {done.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => {
              playSound('tap')
              setExpandDone((v) => !v)
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 12,
              color: COLORS.ink60,
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            <span>{done.length} completed</span>
            <motion.span
              animate={{ rotate: expandDone ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block' }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {expandDone && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {done.map(({ lesson }) => (
                    <div
                      key={lesson.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 0',
                      }}
                    >
                      <span style={{ color: COLORS.green, fontWeight: 800 }}>✓</span>
                      <span
                        style={{
                          fontFamily: FONTS.body,
                          fontWeight: 700,
                          fontSize: 12,
                          color: COLORS.ink60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function LessonRow({ title, pct }: { title: string; pct: number }) {
  const notStarted = pct === 0
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONTS.body,
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            color: COLORS.ink60,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 8,
            flex: 1,
          }}
        >
          {title}
        </span>
        <span style={{ color: notStarted ? COLORS.ink45 : COLORS.ink60, fontStyle: notStarted ? 'italic' : 'normal' }}>
          {notStarted ? 'not started' : `${pct}%`}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 8,
          background: notStarted ? COLORS.lav : W,
          borderRadius: 99,
          border: BORDER.thin,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: pct > 0 ? COLORS.orange : 'transparent',
            borderRight: pct > 0 && pct < 100 ? BORDER.thin : 'none',
          }}
        />
      </div>
    </div>
  )
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 900
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
      {suffix || ''}
    </span>
  )
}
