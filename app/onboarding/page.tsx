'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { saveUserProfile } from '@/lib/onboarding'
import { playSound } from '@/lib/sounds'

const reasons = [
  { id: 'family', label: 'Partner/family speaks Hindi', emoji: '👨‍👩‍👧' },
  { id: 'bollywood', label: 'Want to understand Bollywood', emoji: '🎬' },
  { id: 'moving', label: 'Moving to India', emoji: '✈️' },
  { id: 'curious', label: 'Just curious yaar', emoji: '🤷' },
]

const goals = [
  { minutes: 5, label: '5 min — just a quick chai break', emoji: '☕' },
  { minutes: 10, label: '10 min — solid practice', emoji: '💪' },
  { minutes: 15, label: '15+ min — full immersion', emoji: '🔥' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [showConfetti, setShowConfetti] = useState(false)

  const totalSlides = 5

  const next = useCallback(() => {
    setDirection(1)
    setSlide(s => Math.min(s + 1, totalSlides - 1))
    playSound('swipe')
  }, [])

  const goTo = useCallback((index: number) => {
    setDirection(index > slide ? 1 : -1)
    setSlide(index)
  }, [slide])

  const finish = useCallback(() => {
    saveUserProfile({
      name: name.trim() || 'Friend',
      reason,
      dailyGoal,
      onboardingComplete: true,
    })
    setShowConfetti(true)
    playSound('complete')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }, [name, reason, dailyGoal, router])

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  }

  return (
    <div className="h-dvh flex flex-col bg-[var(--bg-base)] safe-top safe-bottom overflow-hidden">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-4 px-4">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === slide
                ? 'w-8 bg-[var(--accent)]'
                : i < slide
                ? 'w-2 bg-[var(--accent)]/50'
                : 'w-2 bg-[var(--border)]'
            }`}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            {slide === 0 && <SlideWelcome onNext={next} />}
            {slide === 1 && <SlideHowItWorks onNext={next} />}
            {slide === 2 && (
              <SlideAboutYou
                name={name}
                setName={setName}
                reason={reason}
                setReason={setReason}
                onNext={next}
              />
            )}
            {slide === 3 && (
              <SlideDailyGoal
                dailyGoal={dailyGoal}
                setDailyGoal={setDailyGoal}
                onNext={next}
              />
            )}
            {slide === 4 && (
              <SlideReady name={name} onFinish={finish} showConfetti={showConfetti} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function SlideWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-7xl mb-6"
      >
        🙏
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight"
      >
        Bolna Seekho
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-[var(--text-secondary)] mt-3"
      >
        Learn to speak Hindi the way people actually talk
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onNext}
        className="mt-10 py-4 px-8 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
      >
        Let&apos;s go →
      </motion.button>
    </div>
  )
}

function SlideHowItWorks({ onNext }: { onNext: () => void }) {
  const steps = [
    { emoji: '📖', text: 'Learn phrases from real situations' },
    { emoji: '💬', text: 'Practice with AI conversations' },
    { emoji: '🎯', text: 'Quiz yourself to remember' },
  ]

  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--text-primary)] mb-8"
      >
        How it works
      </motion.h2>
      <div className="space-y-6 w-full">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-4 bg-[var(--bg-elevated)] rounded-2xl p-5"
          >
            <span className="text-3xl">{step.emoji}</span>
            <span className="text-base text-[var(--text-primary)] font-medium text-left">{step.text}</span>
          </motion.div>
        ))}
      </div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="mt-10 py-4 px-8 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
      >
        Next →
      </motion.button>
    </div>
  )
}

function SlideAboutYou({
  name,
  setName,
  reason,
  setReason,
  onNext,
}: {
  name: string
  setName: (n: string) => void
  reason: string
  setReason: (r: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        About you
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-[var(--text-secondary)] mb-6"
      >
        So we can personalize your experience
      </motion.p>

      {/* Name input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full mb-6"
      >
        <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-base"
        />
      </motion.div>

      {/* Reason */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full mb-6"
      >
        <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
          Why are you learning Hindi?
        </label>
        <div className="grid grid-cols-1 gap-2">
          {reasons.map((r) => (
            <button
              key={r.id}
              onClick={() => { setReason(r.id); playSound('pop') }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left text-sm ${
                reason === r.id
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              }`}
            >
              <span className="text-lg">{r.emoji}</span>
              <span className="font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onNext}
        className="mt-4 py-4 px-8 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
      >
        Next →
      </motion.button>
    </div>
  )
}

function SlideDailyGoal({
  dailyGoal,
  setDailyGoal,
  onNext,
}: {
  dailyGoal: number
  setDailyGoal: (g: number) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        Daily goal
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-[var(--text-secondary)] mb-8"
      >
        How much time per day?
      </motion.p>

      <div className="space-y-3 w-full">
        {goals.map((g, i) => (
          <motion.button
            key={g.minutes}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => { setDailyGoal(g.minutes); playSound('pop') }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
              dailyGoal === g.minutes
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]'
            }`}
          >
            <span className="text-2xl">{g.emoji}</span>
            <span className={`font-medium ${
              dailyGoal === g.minutes ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}>
              {g.label}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onNext}
        className="mt-10 py-4 px-8 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
      >
        Next →
      </motion.button>
    </div>
  )
}

function SlideReady({
  name,
  onFinish,
  showConfetti,
}: {
  name: string
  onFinish: () => void
  showConfetti: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-7xl mb-6"
      >
        🎉
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-[var(--text-primary)]"
      >
        You&apos;re ready{name ? `, ${name}` : ''}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-base text-[var(--text-secondary)] mt-3"
      >
        Let&apos;s start with your first lesson — Greetings &amp; Fillers
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onFinish}
        disabled={showConfetti}
        className="mt-10 py-4 px-8 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg disabled:opacity-80"
      >
        Start learning 🚀
      </motion.button>
    </div>
  )
}

function ConfettiEffect() {
  const particles = Array.from({ length: 40 })
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const duration = 2 + Math.random() * 2
        const color = colors[i % colors.length]
        const size = 6 + Math.random() * 8
        const rotation = Math.random() * 360

        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
            animate={{ y: '100vh', opacity: 0, rotate: rotation + 360 }}
            transition={{ duration, delay, ease: 'easeIn' }}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        )
      })}
    </div>
  )
}
