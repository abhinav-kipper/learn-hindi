'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getProgress } from '@/lib/progress'
import { getQuizScores, getAverageQuizScore } from '@/lib/quiz'
import { getReviewSessions } from '@/lib/review'
import { getAllLessons, getAllContent } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getLessonPercent } from '@/lib/phrase-progress'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'

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
    const lessons = language === 'dutch' ? getDutchLessons() : getAllLessons()
    const foundations = language === 'dutch' ? getDutchFoundations() : getAllFoundations()
    const allContent = language === 'dutch' ? [...getDutchLessons(), ...getDutchFoundations()] : getAllContent()
    const quizScores = getQuizScores(prefix)
    const reviewSessions = getReviewSessions()

    // Compute phrases learned (from both situations and foundations)
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

    // Play streak sound if streak is active
    if (progress.currentStreak > 0) {
      playSound('streak')
    }

    // Build recent activity
    const recentActivities: ActivityItem[] = []

    // Add quiz scores
    quizScores.slice(-3).forEach(score => {
      recentActivities.push({
        type: 'quiz',
        description: `Quiz: ${score.score}/${score.total} correct`,
        date: score.date,
      })
    })

    // Add review sessions
    reviewSessions.slice(-3).forEach(session => {
      recentActivities.push({
        type: 'review',
        description: `Review: ${session.gotIt}/${session.reviewed} mastered`,
        date: session.date,
      })
    })

    // Sort by date, newest first
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setActivities(recentActivities.slice(0, 5))

    // Build streak calendar (last 7 days) — DST-safe, using YYYY-MM-DD comparison
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
        // Streak still alive (counted from yesterday or earlier) but user hasn't acted today yet
        dayStates.push('pending')
      } else {
        dayStates.push('inactive')
      }
    }
    setStreakDays(dayStates)
  }, [])

  if (!stats) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const lessons = language === 'dutch' ? getDutchLessons() : getAllLessons()
  const foundations = language === 'dutch' ? getDutchFoundations() : getAllFoundations()
  // Sun-indexed array so dayLabels[getDay()] gives the correct letter (Sun=S, Mon=M, ...)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayDow = new Date().getDay()
  const reorderedLabels = [...Array(7)].map((_, i) => {
    // Column i shows the date that is (6 - i) days ago, so its DoW is (todayDow - (6 - i)) mod 7
    const idx = (todayDow - (6 - i) + 7) % 7
    return dayLabels[idx]
  })

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 safe-top pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
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
          <StatCard label="Phrases Learned" value={stats.phrasesLearned} icon="📝" delay={0.1} />
          <StatCard label="Practice Sessions" value={stats.practiceCount} icon="💬" delay={0.15} />
          <StatCard label="Quiz Average" value={stats.quizAverage} suffix="%" icon="🎯" delay={0.2} />
          <StatCard label="Lessons Done" value={stats.lessonsCompleted} icon="📚" delay={0.25} />
        </div>

        {/* Lesson progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm mb-4"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Situations</h3>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const pct = getLessonPercent(lesson, config.storagePrefix)
              const isComplete = pct === 100
              const hasProgress = pct > 0
              return (
                <div key={lesson.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
                    <span className="text-[var(--text-tertiary)]">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : hasProgress
                            ? 'bg-gradient-to-r from-indigo-400 to-violet-500'
                            : 'bg-[var(--border)]'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-3">Foundations</h3>
          <div className="space-y-3">
            {foundations.map((lesson) => {
              const pct = getLessonPercent(lesson, config.storagePrefix)
              const isComplete = pct === 100
              const hasProgress = pct > 0
              return (
                <div key={lesson.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
                    <span className="text-[var(--text-tertiary)]">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-violet-400 to-indigo-500'
                          : hasProgress
                            ? 'bg-gradient-to-r from-indigo-300 to-violet-400'
                            : 'bg-[var(--border)]'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent activity */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm"
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
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
