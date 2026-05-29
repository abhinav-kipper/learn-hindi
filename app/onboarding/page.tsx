'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { saveUserProfile } from '@/lib/onboarding'
import { playSound } from '@/lib/sounds'
import {
  Sticker,
  Tag,
  Cutting,
  DottedBg,
  Confetti as ChaiConfetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
} from '@/components/design'
import { useChaina } from '@/components/design'
const W = '#fff' // @design-allow: white literal

const reasons = [
  { id: 'family', label: 'partner/family speaks Hindi', emoji: '👨‍👩‍👧' },
  { id: 'bollywood', label: 'want to understand Bollywood', emoji: '🎬' },
  { id: 'moving', label: 'moving to India', emoji: '✈️' },
  { id: 'curious', label: 'just curious yaar', emoji: '🤷' },
]

const goals = [
  { minutes: 5, label: '5 min, quick chai break', emoji: '☕' },
  { minutes: 10, label: '10 min, solid practice', emoji: '💪' },
  { minutes: 15, label: '15+ min, full immersion', emoji: '🔥' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { play } = useChaina()
  const [slide, setSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [gender, setGender] = useState<'female' | 'male'>('female')
  const [dailyGoal, setDailyGoal] = useState(5)
  const [showConfetti, setShowConfetti] = useState(false)

  const totalSlides = 5

  const next = useCallback(() => {
    setDirection(1)
    setSlide((s) => Math.min(s + 1, totalSlides - 1))
    playSound('swipe')
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > slide ? 1 : -1)
      setSlide(index)
    },
    [slide],
  )

  const finish = useCallback(() => {
    saveUserProfile({
      name: name.trim() || 'Friend',
      reason,
      gender,
      dailyGoal,
      onboardingComplete: true,
    })
    setShowConfetti(true)
    playSound('complete')
    setTimeout(() => {
      router.push('/')
    }, 1800)
  }, [name, reason, gender, dailyGoal, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('chaina-first-ever-seen') === '1') return
    play('firstEver')
    localStorage.setItem('chaina-first-ever-seen', '1')
    // Reset the last-session timestamp so home doesn't fire welcomeBack right after.
    localStorage.setItem('chaina-last-session-ts', String(Date.now()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: `linear-gradient(180deg, ${COLORS.peach} 0%, ${COLORS.butter} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <DottedBg opacity={0.35} />

      {/* PROGRESS PILLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingTop: 50,
          paddingBottom: 14,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
            style={{
              width: i === slide ? 28 : 10,
              height: 10,
              borderRadius: 99,
              background: i === slide ? COLORS.ink : i < slide ? COLORS.orange : W,
              border: BORDER.thin,
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* SLIDE CONTENT */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 2 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            {slide === 0 && <SlideWelcome onNext={next} />}
            {slide === 1 && <SlideHowItWorks onNext={next} />}
            {slide === 2 && (
              <SlideAboutYou
                name={name}
                setName={setName}
                gender={gender}
                setGender={setGender}
                reason={reason}
                setReason={setReason}
                onNext={next}
              />
            )}
            {slide === 3 && (
              <SlideDailyGoal dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} onNext={next} />
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

function PrimaryCTA({
  label,
  onClick,
  disabled,
  delay,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  delay?: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0.5 }}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: 24,
        padding: '16px 28px',
        borderRadius: 22,
        background: disabled ? W : COLORS.orange,
        color: disabled ? COLORS.ink60 : W,
        border: BORDER.sticker,
        boxShadow: disabled ? 'none' : SHADOW.sticker,
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 17,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        textTransform: 'lowercase',
      }}
    >
      {label}
    </motion.button>
  )
}

function SlideWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 360 }}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
      >
        <Cutting size={170} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: 12 }}
      >
        <Tag>namaste, dost</Tag>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          marginTop: 10,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 38,
          color: COLORS.ink,
          letterSpacing: -0.8,
          lineHeight: 1,
        }}
      >
        bolna seekho
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 14,
          color: COLORS.ink60,
          marginTop: 10,
          maxWidth: 280,
          lineHeight: 1.4,
        }}
      >
        learn to speak Hindi the way people actually talk
      </motion.p>
      <PrimaryCTA label="let's go →" onClick={onNext} delay={0.6} />
    </div>
  )
}

function SlideHowItWorks({ onNext }: { onNext: () => void }) {
  const steps = [
    { emoji: '📖', text: 'learn phrases from real situations', bg: COLORS.peach2 },
    { emoji: '💬', text: 'practice with AI conversations', bg: COLORS.mint2 },
    { emoji: '🎯', text: 'quiz yourself to remember', bg: COLORS.butter },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 360, width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tag>how it works</Tag>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          marginTop: 10,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 28,
          color: COLORS.ink,
          letterSpacing: -0.5,
          marginBottom: 18,
        }}
      >
        three simple steps
      </motion.h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 240, damping: 22 }}
          >
            <Sticker color={step.bg} radius={18} padding={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: W,
                    borderRadius: 12,
                    border: BORDER.thin,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  {step.emoji}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.ink,
                    textAlign: 'left',
                    lineHeight: 1.2,
                  }}
                >
                  {step.text}
                </div>
              </div>
            </Sticker>
          </motion.div>
        ))}
      </div>
      <PrimaryCTA label="next →" onClick={onNext} delay={0.6} />
    </div>
  )
}

function SlideAboutYou({
  name,
  setName,
  gender,
  setGender,
  reason,
  setReason,
  onNext,
}: {
  name: string
  setName: (n: string) => void
  gender: 'female' | 'male'
  setGender: (g: 'female' | 'male') => void
  reason: string
  setReason: (r: string) => void
  onNext: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 360, width: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Tag>about you</Tag>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          marginTop: 10,
          marginBottom: 18,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 26,
          color: COLORS.ink,
          letterSpacing: -0.5,
          textAlign: 'center',
        }}
      >
        let&apos;s personalize this
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ width: '100%', marginBottom: 14 }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 6,
          }}
        >
          your name
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="dost"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 99,
            border: BORDER.sticker,
            background: W,
            color: COLORS.ink,
            fontFamily: FONTS.body,
            fontSize: 15,
            fontWeight: 700,
            boxShadow: SHADOW.chip,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        style={{ width: '100%', marginBottom: 14 }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 6,
          }}
        >
          you are
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(['female', 'male'] as const).map((g) => (
            <Sticker
              key={g}
              color={gender === g ? COLORS.mint : W}
              radius={16}
              padding={10}
              selected={gender === g}
              onClick={() => {
                setGender(g)
                playSound('pop')
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{g === 'female' ? '👩' : '👨'}</div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 11,
                    color: COLORS.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {g}
                </div>
              </div>
            </Sticker>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{ width: '100%' }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 12,
            color: COLORS.ink,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 8,
          }}
        >
          why are you here?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {reasons.map((r) => (
            <Sticker
              key={r.id}
              color={reason === r.id ? COLORS.mint : W}
              radius={16}
              padding={10}
              selected={reason === r.id}
              onClick={() => {
                setReason(r.id)
                playSound('pop')
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{r.emoji}</div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 11,
                    color: COLORS.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {r.label}
                </div>
              </div>
            </Sticker>
          ))}
        </div>
      </motion.div>

      <PrimaryCTA label="next →" onClick={onNext} delay={0.4} />
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 360, width: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Tag>daily goal</Tag>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          marginTop: 10,
          marginBottom: 18,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 28,
          color: COLORS.ink,
          letterSpacing: -0.5,
        }}
      >
        how much per day?
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {goals.map((g, i) => (
          <motion.div
            key={g.minutes}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 240, damping: 22 }}
          >
            <Sticker
              color={dailyGoal === g.minutes ? COLORS.mint : W}
              radius={18}
              padding={14}
              selected={dailyGoal === g.minutes}
              onClick={() => {
                setDailyGoal(g.minutes)
                playSound('pop')
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: W,
                    borderRadius: 12,
                    border: BORDER.thin,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {g.emoji}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 14,
                    color: COLORS.ink,
                    textAlign: 'left',
                    lineHeight: 1.2,
                  }}
                >
                  {g.label}
                </div>
              </div>
            </Sticker>
          </motion.div>
        ))}
      </div>

      <PrimaryCTA label="next →" onClick={onNext} delay={0.4} />
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 360,
        position: 'relative',
      }}
    >
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
          <ChaiConfetti active count={48} />
        </div>
      )}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
        style={{ animation: showConfetti ? 'happy-hop 1.4s ease-in-out infinite' : undefined }}
      >
        <Cutting size={150} mood="happy" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: 14 }}
      >
        <Tag>all set</Tag>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 30,
          color: COLORS.ink,
          marginTop: 8,
          letterSpacing: -0.6,
          lineHeight: 1.1,
        }}
      >
        ready{name ? `, ${name}` : ''}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 14,
          color: COLORS.ink60,
          marginTop: 10,
        }}
      >
        let&apos;s start with greetings &amp; fillers
      </motion.p>
      <PrimaryCTA label="start learning 🚀" onClick={onFinish} disabled={showConfetti} delay={0.6} />
    </div>
  )
}
