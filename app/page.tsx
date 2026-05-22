'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllLessons } from '@/lib/lessons'
import { getAllFoundations } from '@/lib/foundations'
import { getDutchLessons } from '@/lib/dutch/lessons'
import { getDutchFoundations } from '@/lib/dutch/foundations'
import { getProgress, getTodaySessions } from '@/lib/progress'
import { LessonCard } from '@/components/lesson-card'
import { StreakCounter } from '@/components/streak-counter'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { isOnboardingComplete, getUserProfile } from '@/lib/onboarding'
import { playSound, isMuted, toggleMute } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { DutchWelcomeModal } from '@/components/dutch-welcome-modal'
import { getReasonInfo, reorderLessonsByReason } from '@/lib/personalization'
import { getLastActiveLesson } from '@/lib/last-active-lesson'
import { getLessonPercent } from '@/lib/phrase-progress'
import { getUniversalLessonById } from '@/lib/all-content'
import { isLessonComplete } from '@/lib/progress'

type Tab = 'situations' | 'foundations'

export default function Home() {
  const router = useRouter()
  const { language, config } = useLanguage()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [reason, setReason] = useState('')
  const [completedCount, setCompletedCount] = useState(0)
  const [todaySessions, setTodaySessions] = useState(0)
  const [muted, setMuted] = useState(false)
  const tabStorageKey = `${config.storagePrefix}-home-tab`
  const [activeTab, setActiveTab] = useState<Tab>('situations')
  const [continueInfo, setContinueInfo] = useState<{ id: string; title: string; percent: number } | null>(null)

  const setTab = (next: Tab) => {
    setActiveTab(next)
    if (typeof window !== 'undefined') localStorage.setItem(tabStorageKey, next)
    playSound('tap')
  }

  const rawLessons = language === 'dutch' ? getDutchLessons() : getAllLessons()
  const foundations = language === 'dutch' ? getDutchFoundations() : getAllFoundations()
  // Reorder situations by the user's onboarding reason — Hindi only (Dutch has
  // too few lessons to bother reordering)
  const lessons = language === 'hindi' ? reorderLessonsByReason(rawLessons, reason) : rawLessons
  const reasonInfo = getReasonInfo(reason)

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace('/onboarding')
      return
    }
    const profile = getUserProfile()
    setUserName(profile.name || 'Friend')
    setDailyGoal(profile.dailyGoal)
    setReason(profile.reason || '')
    const progress = getProgress(config.storagePrefix)
    setCompletedCount(progress.completedLessons.length)
    setTodaySessions(getTodaySessions(config.storagePrefix))
    setMuted(isMuted())

    // Restore the last-active tab for this language (Situations vs Foundations).
    const storedTab = localStorage.getItem(tabStorageKey)
    if (storedTab === 'situations' || storedTab === 'foundations') {
      setActiveTab(storedTab)
    } else {
      setActiveTab('situations')
    }

    // Resolve the "Continue …" CTA target. Skip if it's already completed.
    const lastId = getLastActiveLesson(config.storagePrefix)
    if (lastId && !isLessonComplete(lastId, config.storagePrefix)) {
      const lesson = getUniversalLessonById(lastId)
      if (lesson) {
        setContinueInfo({
          id: lesson.id,
          title: lesson.title,
          percent: getLessonPercent(lesson, config.storagePrefix),
        })
      } else {
        setContinueInfo(null)
      }
    } else {
      setContinueInfo(null)
    }

    setReady(true)
  }, [router, language, config.storagePrefix, tabStorageKey])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLessons = activeTab === 'situations' ? lessons : foundations

  return (
    <>
    {language === 'dutch' && <DutchWelcomeModal />}
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Hey {userName}!
          </h1>
          <DailyGoalBar today={todaySessions} goal={dailyGoal} />
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

      {reasonInfo && language === 'hindi' && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-xs font-medium text-[var(--accent-text)]">
          <span>{reasonInfo.emoji}</span>
          <span>{reasonInfo.label}</span>
        </div>
      )}

      {continueInfo && (
        <button
          onClick={() => { playSound('tap'); router.push(`/lessons/${continueInfo.id}`) }}
          className="w-full mt-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-left shadow-md hover:opacity-95 transition-opacity flex items-center justify-between"
        >
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">Continue</p>
            <p className="text-sm font-bold truncate">{continueInfo.title}</p>
            <p className="text-xs opacity-80">{continueInfo.percent}% done — pick up where you left off</p>
          </div>
          <span className="text-xl flex-shrink-0 ml-2">→</span>
        </button>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 mt-3">
        <button
          onClick={() => setTab('situations')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            activeTab === 'situations'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
          }`}
        >
          Situations
        </button>
        <button
          onClick={() => setTab('foundations')}
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
            {language === 'dutch'
              ? 'Start with lesson 1 — or jump to Foundations to learn the grammar core first!'
              : 'Start with lesson 1 — everything builds from here'}
          </p>
        </div>
      )}

      <div className="h-[calc(100dvh-220px)] overflow-y-auto snap-y snap-mandatory space-y-4 pb-8 scrollbar-hide">
        {currentLessons.map((lesson, index) => {
          const isFirst = index === 0 && activeTab === 'situations'
          const isLocked = activeTab === 'situations' && completedCount === 0 && index > 0 && language === 'hindi'

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
    </>
  )
}

function DailyGoalBar({ today, goal }: { today: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((today / goal) * 100)) : 0
  const hit = today >= goal && goal > 0
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          {hit ? `Daily goal hit — ${today}/${goal} 🎯` : `${today} of ${goal} today`}
        </p>
      </div>
      <div className="w-40 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            hit
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
              : 'bg-gradient-to-r from-indigo-400 to-violet-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
