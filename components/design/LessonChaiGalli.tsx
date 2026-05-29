'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Lesson, Phrase } from '@/types/lesson'
import { Sticker } from './Sticker'
import { Tag } from './Tag'
import { Mascot } from './Mascot'
import { useTheme } from './theme'
import { DottedBg } from './DottedBg'
import { Confetti as ChaiConfetti } from './Confetti'
import { COLORS, FONTS, BORDER, SHADOW, paletteToBg, deriveLessonStyle } from './tokens'
const W = '#fff' // @design-allow: white literal
const STAR_GOLD = '#f59e0b' // @design-allow: favourite-star gold, not a system token
const CONTEXT_GREEN = '#3a6a4a' // @design-allow: phrase context label green, not a system token
const SWIPE_DIST = 60 // px of horizontal drag that commits a page turn
const SWIPE_VEL = 350 // px/s flick velocity that commits a page turn
import { useLanguage } from '@/lib/language-context'
import { isFavorite, toggleFavorite } from '@/lib/favorites'
import { markPhraseViewed, computeLessonResume } from '@/lib/phrase-progress'
import { setLastActiveLesson } from '@/lib/last-active-lesson'
import { isLessonComplete, markLessonComplete, updateStreak } from '@/lib/progress'
import { playSound } from '@/lib/sounds'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { useChaina, canFire, markFired } from '@/components/design'
import { TheoryView } from '@/components/lesson/TheoryView'
import GlossableText from '@/components/GlossableText'

interface Props {
  lesson: Lesson
  /** 1-based index within its content list. Used for the "chapter NN" tag. Optional. */
  chapterNumber?: number
  /** Whether this lesson is a situation or a foundation. Used by the header tag. */
  kind?: 'situations' | 'foundations'
}

export function LessonChaiGalli({ lesson, chapterNumber, kind = 'situations' }: Props) {
  const router = useRouter()
  const theme = useTheme()
  const { config } = useLanguage()

  const resume = useMemo(() => computeLessonResume(lesson, config.storagePrefix), [lesson, config.storagePrefix])
  const { play } = useChaina()
  const [idx, setIdx] = useState(resume.phraseIndex)
  const [dir, setDir] = useState<1 | -1>(1)
  const [revealed, setRevealed] = useState<Set<number>>(new Set([resume.phraseIndex]))
  const consecutiveRevealsRef = useRef(0)
  const [completed, setCompleted] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)

  useEffect(() => {
    setCompleted(isLessonComplete(lesson.id, config.storagePrefix))
    markPhraseViewed(lesson.id, idx, config.storagePrefix)
    setLastActiveLesson(lesson.id, config.storagePrefix)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const arm = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (canFire('idleNudge', 'once-per-session')) {
          play('idleNudge')
          markFired('idleNudge', 'once-per-session')
        }
      }, 25_000)
    }
    arm()
    const handlers = ['click', 'keydown', 'touchstart'] as const
    handlers.forEach(e => window.addEventListener(e, arm, { passive: true }))
    return () => {
      handlers.forEach(e => window.removeEventListener(e, arm))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { palette } = deriveLessonStyle(lesson.id, (chapterNumber ?? 1) - 1)
  const headerBg = paletteToBg(palette)

  const total = lesson.phrases.length
  const phrase = lesson.phrases[idx]

  const reveal = () => {
    if (revealed.has(idx)) return
    const next = new Set(revealed)
    next.add(idx)
    setRevealed(next)
    playSound('pop')
    markPhraseViewed(lesson.id, idx, config.storagePrefix)

    consecutiveRevealsRef.current += 1
    if (
      consecutiveRevealsRef.current >= 3 &&
      canFire(`phraseStreak-${lesson.id}`, 'once-per-session')
    ) {
      play('phraseStreak')
      markFired(`phraseStreak-${lesson.id}`, 'once-per-session')
    }
  }

  const go = (d: -1 | 1) => {
    const next = idx + d
    if (next < 0 || next >= total) return
    setDir(d)
    setIdx(next)
    consecutiveRevealsRef.current = 0
    playSound('swipe')
    markPhraseViewed(lesson.id, next, config.storagePrefix)
    setLastActiveLesson(lesson.id, config.storagePrefix)
  }

  const allRevealed = revealed.size >= total
  const handleMarkComplete = () => {
    if (completed) return
    if (!allRevealed) return
    markLessonComplete(lesson.id, config.storagePrefix)
    updateStreak(config.storagePrefix)
    setCompleted(true)
    setCelebrate(true)
    playSound('levelup')
    play('lessonComplete')
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [COLORS.peach, COLORS.mint, COLORS.lav2, COLORS.butter, COLORS.rose],
      ticks: 90,
      gravity: 1.1,
      scalar: 1,
    })
  }

  if (celebrate) {
    return (
      <LessonCelebration
        lesson={lesson}
        onPractice={() => router.push(`/practice/${lesson.id}`)}
        onHome={() => router.push('/')}
      />
    )
  }

  // Show TheoryView for any foundation with a `theory` block — chapter
  // first, phrases as drill. The phrase view has a 📖 chapter button to
  // re-open theory at any time, and the chapter's CTA enters phrases —
  // so navigation between the two modes is always available.
  if (lesson.theory && !showPhrases) {
    return (
      <TheoryView
        theory={lesson.theory}
        title={lesson.title}
        onStartPhrases={() => {
          playSound('swipe')
          setShowPhrases(true)
        }}
        onGoToPractice={() => router.push(`/practice/${lesson.id}`)}
      />
    )
  }

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
          background: headerBg,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => {
                playSound('tap')
                router.push('/')
              }}
              aria-label="Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: 99,
                background: W,
                border: BORDER.sticker,
                boxShadow: SHADOW.chip,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: COLORS.ink,
                padding: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            {lesson.theory && (
              <button
                onClick={() => {
                  playSound('tap')
                  setShowPhrases(false)
                }}
                aria-label="Read chapter"
                style={{
                  height: 40,
                  borderRadius: 99,
                  background: COLORS.cream,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  color: COLORS.ink,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  textTransform: 'lowercase',
                }}
              >
                📖 chapter
              </button>
            )}
          </div>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Mascot size={74} />
          </div>
        </div>
        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>
            ☼ chapter {(chapterNumber ?? 1).toString().padStart(2, '0')} · {kind}
          </Tag>
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
            {lesson.title}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(lesson.skills ?? []).map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 800,
                  fontSize: 11,
                  color: COLORS.ink,
                  background: W,
                  border: BORDER.thin,
                  padding: '3px 9px',
                  borderRadius: 99,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SEGMENTED PROGRESS */}
      <div
        style={{
          padding: '14px 20px 0',
          display: 'flex',
          gap: 4,
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {lesson.phrases.map((_, i) => (
          <div
            key={i}
            style={{
              height: 8,
              flex: i === idx ? 2 : 1,
              borderRadius: 99,
              background: i < idx ? COLORS.green : i === idx ? theme.primary : W,
              border: BORDER.thin,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* PHRASE STICKER */}
      <div
        style={{
          padding: '18px 20px 0',
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_DIST || info.velocity.x < -SWIPE_VEL) go(1)
              else if (info.offset.x > SWIPE_DIST || info.velocity.x > SWIPE_VEL) go(-1)
            }}
            initial={{ opacity: 0, rotateY: dir > 0 ? 28 : -28, x: dir * 50 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: dir > 0 ? -22 : 22, x: dir * -50 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              transformPerspective: 1000,
              transformOrigin: dir > 0 ? 'left center' : 'right center',
              touchAction: 'pan-y',
              cursor: 'grab',
            }}
          >
            <PhraseSticker
              phrase={phrase}
              idx={idx}
              total={total}
              revealed={revealed.has(idx)}
              onReveal={reveal}
              lessonId={lesson.id}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PREV / NEXT */}
      <div
        style={{
          padding: '14px 20px 0',
          display: 'flex',
          gap: 10,
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <NavButton label="← prev" disabled={idx === 0} onClick={() => go(-1)} />
        <NavButton label="next →" disabled={idx === total - 1} onClick={() => go(1)} />
      </div>

      {/* MARK COMPLETE — only after every phrase has been revealed (gated to ensure phrase progress is real) */}
      {(completed || allRevealed) && (
        <div
          style={{
            padding: '16px 20px 0',
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          {completed ? (
            <Sticker
              color={COLORS.mint2}
              radius={22}
              padding="18px"
              onClick={() => {
                playSound('tap')
                router.push(`/practice/${lesson.id}`)
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 16,
                  color: COLORS.ink,
                  textTransform: 'lowercase',
                }}
              >
                ✓ chapter complete — practice it now →
              </div>
            </Sticker>
          ) : (
            <button
              onClick={handleMarkComplete}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: 22,
                background: COLORS.green,
                color: W,
                border: BORDER.sticker,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: SHADOW.sticker,
                letterSpacing: 0.2,
                textTransform: 'lowercase',
              }}
            >
              ✓ mark chapter complete
            </button>
          )}
        </div>
      )}
      {/* Hint when there are still unrevealed phrases */}
      {!completed && !allRevealed && (
        <div
          style={{
            padding: '16px 20px 0',
            maxWidth: 480,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: 13,
            fontStyle: 'italic',
            color: COLORS.ink45,
          }}
        >
          reveal every phrase ({revealed.size}/{total}) to unlock <strong>mark chapter complete</strong>
        </div>
      )}
    </div>
  )
}

function NavButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '10px',
        borderRadius: 99,
        background: disabled ? W : COLORS.cream,
        color: COLORS.ink,
        border: BORDER.sticker,
        boxShadow: disabled ? 'none' : SHADOW.chip,
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 14,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
        textTransform: 'lowercase',
      }}
    >
      {label}
    </button>
  )
}

function PhraseSticker({
  phrase,
  idx,
  total,
  revealed,
  onReveal,
  lessonId,
}: {
  phrase: Phrase
  idx: number
  total: number
  revealed: boolean
  onReveal: () => void
  lessonId: string
}) {
  const { config } = useLanguage()
  const { play } = useChaina()
  const theme = useTheme()
  const [starred, setStarred] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setStarred(isFavorite(lessonId, phrase.hindi, config.storagePrefix))
  }, [lessonId, phrase.hindi, config.storagePrefix])

  useEffect(() => {
    if (!speaking) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 200)
    return () => clearInterval(interval)
  }, [speaking])

  const handleStar = () => {
    const next = toggleFavorite(phrase, lessonId, config.storagePrefix)
    setStarred(next)
    playSound(next ? 'pop' : 'tap')
    if (next && canFire('favoriteSaved', 'debounce-800ms')) {
      play('favoriteSaved')
      markFired('favoriteSaved', 'debounce-800ms')
    }
  }

  const handleHear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    playSound('pop')
    setSpeaking(true)
    speak(phrase.hindi, config.ttsLocale, () => setSpeaking(false))
  }

  return (
    <Sticker color={W} radius={26} padding={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: FONTS.tag,
            fontSize: 10,
            background: theme.primary,
            color: W,
            padding: '3px 9px',
            borderRadius: 99,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            border: BORDER.thin,
          }}
        >
          phrase {idx + 1} of {total}
        </span>
        <button
          onClick={handleStar}
          aria-label={starred ? 'Unfavorite phrase' : 'Favorite phrase'}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: 26,
            transition: 'transform 0.2s',
            transform: starred ? 'scale(1.25) rotate(12deg)' : 'scale(1)',
            color: starred ? STAR_GOLD : COLORS.ink60,
          }}
        >
          {starred ? '⭐' : '☆'}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 30,
            color: COLORS.ink,
            lineHeight: 1.1,
            letterSpacing: -0.6,
          }}
        >
          <GlossableText phrase={phrase.hindi} />
        </div>
        {phrase.pronunciation && (
          <div
            style={{
              marginTop: 8,
              padding: '6px 12px',
              borderRadius: 12,
              display: 'inline-block',
              background: COLORS.butter,
              border: BORDER.thin,
              fontFamily: FONTS.body,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.ink60,
            }}
          >
            <span style={{ opacity: 0.6 }}>say it · </span>
            <span style={{ color: COLORS.ink }}>{phrase.pronunciation}</span>
          </div>
        )}
      </div>

      <div
        onClick={onReveal}
        role={revealed ? undefined : 'button'}
        tabIndex={revealed ? undefined : 0}
        onKeyDown={(e) => {
          if (!revealed && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onReveal()
          }
        }}
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 18,
          background: revealed ? COLORS.mint2 : COLORS.lav,
          border: BORDER.sticker,
          cursor: revealed ? 'default' : 'pointer',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s',
        }}
      >
        {revealed ? (
          <div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 700,
                fontSize: 17,
                color: COLORS.ink,
              }}
            >
              {phrase.english}
            </div>
            {phrase.context && (
              <div
                style={{
                  marginTop: 6,
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 12,
                  color: CONTEXT_GREEN,
                }}
              >
                ✨ {phrase.context}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: COLORS.ink60,
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <span
              style={{
                animation: 'wobble-z 1.4s ease-in-out infinite',
                display: 'inline-block',
              }}
            >
              👆
            </span>
            tap to reveal
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button
          onClick={handleHear}
          aria-label={speaking ? 'Stop' : 'Hear it'}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 99,
            background: theme.primary,
            color: W,
            border: BORDER.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 15,
            boxShadow: SHADOW.chip,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            {speaking ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M8 5v14l11-7z" />}
          </svg>
          {speaking ? 'stop' : 'hear it'}
        </button>
      </div>
    </Sticker>
  )
}

function LessonCelebration({
  lesson,
  onPractice,
  onHome,
}: {
  lesson: Lesson
  onPractice: () => void
  onHome: () => void
}) {
  const theme = useTheme()
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: `linear-gradient(180deg, ${COLORS.peach} 0%, ${COLORS.mint2} 100%)`,
        overflow: 'hidden',
        padding: '60px 20px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ChaiConfetti active count={48} />

      {/* expanding rings */}
      <div
        style={{ position: 'absolute', top: '34%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
      >
        {[0, 0.2, 0.4, 0.6].map((delay) => (
          <div
            key={delay}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: `3px solid ${COLORS.ink}`, // @design-allow: celebration ring animation, not a sticker surface
              opacity: 0.3,
              animation: `ring-grow 2.4s ease-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Mascot */}
      <div
        style={{
          position: 'relative',
          animation: 'happy-hop 1.4s ease-in-out infinite',
          marginTop: 16,
        }}
      >
        <Mascot size={170} mood="happy" />
      </div>

      <div style={{ marginTop: 18, textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 10 }}>
        <Tag>chapter complete</Tag>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 36,
            color: COLORS.ink,
            lineHeight: 1.05,
            marginTop: 8,
            letterSpacing: -0.5,
          }}
        >
          shabash, dost!
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 14,
            color: COLORS.ink60,
            marginTop: 6,
          }}
        >
          you crushed{' '}
          <span style={{ color: COLORS.ink, fontWeight: 800 }}>{lesson.title}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          width: '100%',
          maxWidth: 360,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <StatSticker value={lesson.phrases.length} label="phrases" color={COLORS.butter} />
        <StatSticker value={(lesson.grammar_notes ?? []).length} label="notes" color={COLORS.peach2} />
        <StatSticker value={(lesson.skills ?? []).length} label="skills" color={COLORS.mint2} />
      </div>

      <div
        style={{
          marginTop: 'auto',
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <button
          onClick={onPractice}
          style={{
            width: '100%',
            padding: 18,
            borderRadius: 22,
            background: theme.primary,
            color: W,
            border: BORDER.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 17,
            cursor: 'pointer',
            boxShadow: SHADOW.sticker,
            textTransform: 'lowercase',
          }}
        >
          practice now →
        </button>
        <button
          onClick={onHome}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 22,
            background: W,
            color: COLORS.ink,
            border: BORDER.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: SHADOW.chip,
            textTransform: 'lowercase',
          }}
        >
          back to home
        </button>
      </div>
    </div>
  )
}

function StatSticker({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Sticker color={color} radius={18} padding={12}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 26,
            color: COLORS.ink,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 11,
            color: COLORS.ink60,
            marginTop: 3,
            textTransform: 'lowercase',
          }}
        >
          {label}
        </div>
      </div>
    </Sticker>
  )
}
