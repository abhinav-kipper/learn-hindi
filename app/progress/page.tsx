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
import { useLanguage } from '@/lib/language-context'
import type { Lesson } from '@/types/lesson'

interface Stats {
  phrasesLearned: number
  practiceCount: number
  quizAverage: number
  lessonsCompleted: number
  currentStreak: number
  lastActiveDate: string
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
    const allContent = language === 'dutch' ? [...getDutchLessons(), ...getDutchFoundations()] : getAllContent()
    const quizScores = getQuizScores(prefix)
    const reviewSessions = getReviewSessions(prefix)

    const completedLessons = allContent.filter(l => progress.completedLessons.includes(l.id))
    const phrasesLearned = completedLessons.reduce((sum, l) => sum + l.phrases.length, 0)

    setStats({
      phrasesLearned,
      practiceCount: progress.practiceSessionCount,
      quizAverage: getAverageQuizScore(prefix),
      lessonsCompleted: progress.completedLessons.length,
      currentStreak: progress.currentStreak,
      lastActiveDate: progress.lastActiveDate,
    })

    const recentActivities: ActivityItem[] = []
    quizScores.slice(-3).forEach(score => {
      recentActivities.push({
        type: 'quiz',
        description: `Quiz: ${score.score}/${score.total} correct`,
        date: score.date,
      })
    })
    reviewSessions.slice(-3).forEach(session => {
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
      if (activeSet.has(dateStr)) {
        dayStates.push('active')
      } else if (dateStr === todayStr && progress.currentStreak > 0) {
        dayStates.push('pending')
      } else {
        dayStates.push('inactive')
      }
    }
    setStreakDays(dayStates)
  }, [language, config.storagePrefix])

  const lessons = useMemo(
    () => language === 'dutch' ? getDutchLessons() : getAllLessons(),
    [language],
  )
  const foundations = useMemo(
    () => language === 'dutch' ? getDutchFoundations() : getAllFoundations(),
    [language],
  )

  if (!stats) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayDow = new Date().getDay()
  const reorderedLabels = [...Array(7)].map((_, i) => {
    const idx = (todayDow - (6 - i) + 7) % 7
    return dayLabels[idx]
  })

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 safe-top pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Progress</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Home
          </button>
        </div>

        {/* Streak section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔥</span>
            <div>
              <AnimatedNumber value={stats.currentStreak} className="text-3xl font-extrabold text-orange-700" />
              <p className="text-sm text-orange-600/70">day streak</p>
            </div>
          </div>
          <div className="flex justify-between">
            {streakDays.map((state, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  state === 'active'
                    ? 'bg-orange-400 text-white'
                    : state === 'pending'
                      ? 'bg-transparent border-2 border-dashed border-orange-300 text-orange-500'
                      : 'bg-orange-100 text-orange-300'
                }`}>
                  {reorderedLabels[i]}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Phrases" value={stats.phrasesLearned} icon="📝" delay={0.05} />
          <StatCard label="Practice" value={stats.practiceCount} icon="💬" delay={0.1} />
          <StatCard label="Quiz avg" value={stats.quizAverage} suffix="%" icon="🎯" delay={0.15} />
          <StatCard label="Lessons" value={stats.lessonsCompleted} icon="📚" delay={0.2} />
        </div>

        {/* Tools row — compact 3-col grid replacing the old full-width tiles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-3 mb-4"
        >
          <ToolButton emoji="🔍" label="Mistakes" onClick={() => router.push('/mistakes')} />
          <ToolButton emoji="⭐" label="Saved" onClick={() => router.push('/favorites')} />
          <ToolButton emoji="🔡" label="Drill" onClick={() => router.push('/drill/conjugation')} />
        </motion.div>

        {/* Lesson progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm mb-4"
        >
          <LessonGroup title="Situations" lessons={lessons} prefix={config.storagePrefix} accent="violet" />
          <div className="h-px bg-[var(--border)] my-5" />
          <LessonGroup title="Foundations" lessons={foundations} prefix={config.storagePrefix} accent="indigo" />
        </motion.div>

        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm"
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent activity</h3>
            <div className="space-y-2">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="text-lg">
                    {activity.type === 'quiz' ? '🎯' : activity.type === 'review' ? '🔄' : '📖'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]">{activity.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ToolButton({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => { playSound('tap'); onClick() }}
      className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/40 transition-colors"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
    </motion.button>
  )
}

function LessonGroup({
  title,
  lessons,
  prefix,
  accent,
}: {
  title: string
  lessons: Lesson[]
  prefix: string
  accent: 'violet' | 'indigo'
}) {
  const [expandDone, setExpandDone] = useState(false)

  const rows = useMemo(() => lessons.map(l => ({
    lesson: l,
    pct: getLessonPercent(l, prefix),
  })), [lessons, prefix])

  const active = rows.filter(r => r.pct < 100)
  const done = rows.filter(r => r.pct === 100)

  const activeBar = accent === 'violet'
    ? 'bg-gradient-to-r from-indigo-400 to-violet-500'
    : 'bg-gradient-to-r from-indigo-300 to-violet-400'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        <span className="text-xs text-[var(--text-tertiary)] font-medium">
          {done.length}/{rows.length} done
        </span>
      </div>

      {active.length > 0 ? (
        <div className="space-y-3">
          {active.map(({ lesson, pct }) => (
            <LessonRow key={lesson.id} title={lesson.title} pct={pct} barClass={pct > 0 ? activeBar : 'bg-[var(--border)]'} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-emerald-600 font-medium">All done — nice work 🎉</p>
      )}

      {done.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => { playSound('tap'); setExpandDone(v => !v) }}
            className="w-full flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium py-2 hover:text-[var(--text-primary)] transition-colors"
          >
            <span>{done.length} completed</span>
            <motion.span animate={{ rotate: expandDone ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-1.5">
                  {done.map(({ lesson }) => (
                    <div key={lesson.id} className="flex items-center gap-2 py-1">
                      <span className="text-emerald-500 text-xs">✓</span>
                      <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{lesson.title}</span>
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

function LessonRow({ title, pct, barClass }: { title: string; pct: number; barClass: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)] truncate mr-2">{title}</span>
        <span className="text-[var(--text-tertiary)]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${barClass}`}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, suffix, delay }: {
  label: string
  value: number
  icon: string
  suffix?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border)] shadow-sm"
    >
      <span className="text-xl">{icon}</span>
      <div className="mt-2">
        <AnimatedNumber value={value} className="text-2xl font-bold text-[var(--text-primary)]" suffix={suffix} />
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

function AnimatedNumber({ value, className, suffix }: { value: number; className: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 1000
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
    <span className={className}>
      {display}{suffix || ''}
    </span>
  )
}
