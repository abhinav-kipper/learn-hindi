'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getProgress } from '@/lib/progress'
import { getQuizScores, getAverageQuizScore } from '@/lib/quiz'
import { getReviewSessions } from '@/lib/review'
import { getAllLessons } from '@/lib/lessons'
import { playSound } from '@/lib/sounds'

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
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [streakDays, setStreakDays] = useState<boolean[]>([])

  useEffect(() => {
    const progress = getProgress()
    const lessons = getAllLessons()
    const quizScores = getQuizScores()
    const reviewSessions = getReviewSessions()

    // Compute phrases learned (9 phrases per lesson average)
    const completedLessons = lessons.filter(l => progress.completedLessons.includes(l.id))
    const phrasesLearned = completedLessons.reduce((sum, l) => sum + l.phrases.length, 0)

    setStats({
      phrasesLearned,
      practiceCount: progress.practiceSessionCount,
      quizAverage: getAverageQuizScore(),
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

    // Build streak calendar (last 7 days)
    const today = new Date()
    const days: boolean[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      // A day is active if it's the lastActiveDate or within the streak
      if (progress.lastActiveDate && progress.currentStreak > 0) {
        const lastActive = new Date(progress.lastActiveDate)
        const daysDiff = Math.floor((lastActive.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        days.push(daysDiff >= 0 && daysDiff < progress.currentStreak)
      } else {
        days.push(false)
      }
    }
    setStreakDays(days)
  }, [])

  if (!stats) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const lessons = getAllLessons()
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const reorderedLabels = [...Array(7)].map((_, i) => {
    const idx = (today - 6 + i + 7) % 7
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
            {streakDays.map((active, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  active ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-300'
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
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Lesson Progress</h3>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isComplete = stats && getProgress().completedLessons.includes(lesson.id)
              return (
                <div key={lesson.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
                    <span className="text-[var(--text-tertiary)]">{isComplete ? '100%' : '0%'}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isComplete ? '100%' : '0%' }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${
                        isComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-[var(--border)]'
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
