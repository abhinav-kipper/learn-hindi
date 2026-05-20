'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllLessons } from '@/lib/lessons'
import { getProgress } from '@/lib/progress'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { isOnboardingComplete, getUserProfile } from '@/lib/onboarding'
import { playSound } from '@/lib/sounds'

export default function Home() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [completedCount, setCompletedCount] = useState(0)
  const lessons = getAllLessons()

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace('/onboarding')
      return
    }
    const profile = getUserProfile()
    setUserName(profile.name || 'Friend')
    setDailyGoal(profile.dailyGoal)
    const progress = getProgress()
    setCompletedCount(progress.completedLessons.length)
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Hey {userName}! 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {dailyGoal} min today — you got this!
          </p>
        </div>
        <StreakCounter />
      </div>

      {completedCount === 0 && (
        <div className="mb-4 p-3 bg-[var(--accent-soft)] rounded-xl border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--accent-text)] font-medium">
            Start with lesson 1 — everything builds from here ✨
          </p>
        </div>
      )}

      <div className="h-[calc(100dvh-180px)] overflow-y-auto snap-y snap-mandatory space-y-4 pb-8 scrollbar-hide">
        {lessons.map((lesson, index) => {
          const isFirst = index === 0
          const isLocked = completedCount === 0 && index > 0

          const card = (
            <div
              key={lesson.id}
              onClick={() => playSound('tap')}
              className={`snap-start ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <LessonCard lesson={lesson} index={index} />
            </div>
          )

          if (isFirst) {
            return (
              <FeatureTooltip
                key={lesson.id}
                id="home"
                message="Start here! Tap a lesson to begin learning."
                position="bottom"
              >
                <div className="snap-start" onClick={() => playSound('tap')}>
                  <LessonCard lesson={lesson} index={index} />
                </div>
              </FeatureTooltip>
            )
          }

          return card
        })}
      </div>
    </div>
  )
}
