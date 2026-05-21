'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getProgress } from '@/lib/progress'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { isOnboardingComplete, getUserProfile } from '@/lib/onboarding'
import { playSound, isMuted, toggleMute } from '@/lib/sounds'

type Tab = 'situations' | 'foundations'

export default function Home() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [completedCount, setCompletedCount] = useState(0)
  const [muted, setMuted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('situations')
  const lessons = getAllLessons()
  const foundations = getAllFoundations()

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
    setMuted(isMuted())
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLessons = activeTab === 'situations' ? lessons : foundations

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Hey {userName}!
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {dailyGoal} min today — you got this!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StreakCounter />
          <button
            onClick={() => { const m = toggleMute(); setMuted(m) }}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {muted ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
                <path d="M14.22 7.22a.75.75 0 0 1 1.06 0L16.5 8.44l1.22-1.22a.75.75 0 1 1 1.06 1.06L17.56 9.5l1.22 1.22a.75.75 0 1 1-1.06 1.06L16.5 10.56l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22-1.22-1.22a.75.75 0 0 1 0-1.06Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
                <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 mt-3">
        <button
          onClick={() => { setActiveTab('situations'); playSound('tap') }}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            activeTab === 'situations'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
          }`}
        >
          Situations
        </button>
        <button
          onClick={() => { setActiveTab('foundations'); playSound('tap') }}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            activeTab === 'foundations'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
          }`}
        >
          Foundations
        </button>
      </div>

      {completedCount === 0 && activeTab === 'situations' && (
        <div className="mb-4 p-3 bg-[var(--accent-soft)] rounded-xl border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--accent-text)] font-medium">
            Start with lesson 1 — everything builds from here
          </p>
        </div>
      )}

      <div className="h-[calc(100dvh-220px)] overflow-y-auto snap-y snap-mandatory space-y-4 pb-8 scrollbar-hide">
        {currentLessons.map((lesson, index) => {
          const isFirst = index === 0 && activeTab === 'situations'
          const isLocked = activeTab === 'situations' && completedCount === 0 && index > 0

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
