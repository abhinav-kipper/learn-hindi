'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getReviewPhrases, markReviewed, saveReviewSession, ReviewPhrase } from '@/lib/review'
import { getVocabReview } from '@/lib/vocab-review'
import { getAllCategories } from '@/lib/vocabulary'
import { getDutchAllCategories } from '@/lib/dutch/vocabulary'
import { getProgress, updateStreak } from '@/lib/progress'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { Sticker, Tag, Cutting, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
const W = '#fff' // @design-allow: white literal

const REVIEW_CARD_COUNT = 5

function timestampKey(prefix: string): string {
  return `${prefix}-daily-review-timestamp`
}

function shouldShowReview(prefix: string): boolean {
  if (typeof window === 'undefined') return false
  const progress = getProgress(prefix)
  if (progress.completedLessons.length === 0) return false
  const lastReview = localStorage.getItem(timestampKey(prefix))
  if (!lastReview) return true
  const lastTime = parseInt(lastReview, 10)
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return now - lastTime >= twentyFourHours
}

function recordReviewTimestamp(prefix: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(timestampKey(prefix), Date.now().toString())
}

export function DailyReviewPopup() {
  const { language, config } = useLanguage()
  const prefix = config.storagePrefix
  const [show, setShow] = useState(false)
  const [state, setState] = useState<'prompt' | 'reviewing' | 'complete'>('prompt')
  const [phrases, setPhrases] = useState<ReviewPhrase[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowReview(prefix)) {
        setShow(true)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [prefix])

  const handleDismiss = useCallback(() => {
    recordReviewTimestamp(prefix)
    setShow(false)
  }, [prefix])

  const handleLetsGo = useCallback(() => {
    const vocabReviewWords = getVocabReview()
    const categories = language === 'dutch' ? getDutchAllCategories() : getAllCategories()
    const vocabPhrases: ReviewPhrase[] = []

    for (const hindi of vocabReviewWords) {
      for (const cat of categories) {
        const word = cat.words.find((w) => w.hindi === hindi)
        if (word) {
          vocabPhrases.push({
            phraseId: `vocab-${hindi}`,
            lessonId: `vocab-${cat.id}`,
            phrase: {
              hindi: word.hindi,
              english: word.english,
              pronunciation: word.pronunciation,
              context: word.example,
            },
            lastReviewed: null,
            correctCount: 0,
            wrongCount: 0,
            interval: 0,
            easeFactor: 2.5,
            nextReviewAt: null,
          })
          break
        }
      }
    }

    const lessonPhrases = getReviewPhrases(REVIEW_CARD_COUNT, prefix)
    const vocabSlice = vocabPhrases.slice(0, 2)
    const lessonSlice = lessonPhrases.slice(0, REVIEW_CARD_COUNT - vocabSlice.length)
    const mixed = [...vocabSlice, ...lessonSlice].slice(0, REVIEW_CARD_COUNT)

    if (mixed.length === 0) {
      handleDismiss()
      return
    }
    setPhrases(mixed)
    setCurrentIndex(0)
    setRevealed(false)
    setGotItCount(0)
    setState('reviewing')
  }, [language, prefix, handleDismiss])

  const handleGotIt = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, true, prefix)
    setGotItCount((prev) => prev + 1)
    playSound('correct')
    advance()
  }

  const handleStillLearning = () => {
    const phrase = phrases[currentIndex]
    markReviewed(phrase.phraseId, false, prefix)
    playSound('pop')
    advance()
  }

  const advance = () => {
    setDirection(1)
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setRevealed(false)
    } else {
      saveReviewSession(phrases.length, gotItCount + 1, prefix)
      updateStreak(prefix)
      recordReviewTimestamp(prefix)
      setState('complete')
      playSound('complete')
      setTimeout(() => setShow(false), 2500)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={state === 'prompt' ? handleDismiss : undefined}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(54,40,30,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                background: COLORS.butter,
                borderTopLeftRadius: 36,
                borderTopRightRadius: 36,
                borderTop: BORDER.sticker,
                borderLeft: BORDER.sticker,
                borderRight: BORDER.sticker,
                boxShadow: SHADOW.sheet,
                padding: '18px 20px 50px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div
                  style={{
                    width: 48,
                    height: 5,
                    background: COLORS.ink,
                    opacity: 0.5,
                    borderRadius: 99,
                  }}
                />
              </div>

              {state === 'prompt' && (
                <PromptView
                  onLetsGo={handleLetsGo}
                  onDismiss={handleDismiss}
                  languageName={config.name}
                />
              )}
              {state === 'reviewing' && phrases.length > 0 && (
                <ReviewView
                  phrases={phrases}
                  currentIndex={currentIndex}
                  revealed={revealed}
                  direction={direction}
                  onReveal={() => {
                    setRevealed(true)
                    playSound('pop')
                  }}
                  onGotIt={handleGotIt}
                  onStillLearning={handleStillLearning}
                />
              )}
              {state === 'complete' && (
                <CompleteView gotItCount={gotItCount} total={phrases.length} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PromptView({
  onLetsGo,
  onDismiss,
  languageName,
}: {
  onLetsGo: () => void
  onDismiss: () => void
  languageName: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <Cutting size={88} />
      </div>
      <Tag>daily review</Tag>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 22,
          color: COLORS.ink,
          marginTop: 8,
          letterSpacing: -0.4,
        }}
      >
        ready for a quick review?
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 13,
          color: COLORS.ink60,
          marginTop: 6,
          marginBottom: 18,
        }}
      >
        {REVIEW_CARD_COUNT} flashcards to keep your {languageName} sharp
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={onLetsGo}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 22,
            background: COLORS.orange,
            color: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          let&apos;s go →
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            width: '100%',
            padding: 10,
            background: 'transparent',
            color: COLORS.ink60,
            border: 'none',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          not now
        </button>
      </div>
    </motion.div>
  )
}

function ReviewView({
  phrases,
  currentIndex,
  revealed,
  direction,
  onReveal,
  onGotIt,
  onStillLearning,
}: {
  phrases: ReviewPhrase[]
  currentIndex: number
  revealed: boolean
  direction: number
  onReveal: () => void
  onGotIt: () => void
  onStillLearning: () => void
}) {
  const currentPhrase = phrases[currentIndex]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 200 : -200, opacity: 0 }),
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Tag bg={COLORS.orange} color={W} border={COLORS.ink}>
          review · {currentIndex + 1} / {phrases.length}
        </Tag>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {phrases.map((_, i) => (
          <div
            key={i}
            style={{
              flex: i === currentIndex ? 2 : 1,
              height: 6,
              background: i < currentIndex ? COLORS.green : i === currentIndex ? COLORS.orange : W,
              borderRadius: 99,
              border: BORDER.thin,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <Sticker color={W} radius={20} padding={18} onClick={() => !revealed && onReveal()}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 24,
                color: COLORS.ink,
                textAlign: 'center',
                lineHeight: 1.15,
                letterSpacing: -0.4,
              }}
            >
              {currentPhrase.phrase.hindi}
            </div>
            {currentPhrase.phrase.pronunciation && (
              <div
                style={{
                  marginTop: 4,
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 11,
                  color: COLORS.ink45,
                  textAlign: 'center',
                }}
              >
                {currentPhrase.phrase.pronunciation}
              </div>
            )}
            {revealed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: COLORS.mint2,
                  border: BORDER.thin,
                  borderRadius: 14,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.green,
                  }}
                >
                  {currentPhrase.phrase.english}
                </div>
                {currentPhrase.phrase.context && (
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: FONTS.body,
                      fontWeight: 600,
                      fontSize: 11,
                      color: COLORS.ink60,
                    }}
                  >
                    {currentPhrase.phrase.context}
                  </div>
                )}
              </motion.div>
            ) : (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 12,
                  color: COLORS.ink45,
                  textAlign: 'center',
                }}
              >
                tap to reveal
              </div>
            )}
          </Sticker>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10, marginTop: 14 }}
            >
              <button
                type="button"
                onClick={onStillLearning}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 18,
                  background: W,
                  color: COLORS.ink,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                still learning
              </button>
              <button
                type="button"
                onClick={onGotIt}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 18,
                  background: COLORS.green,
                  color: W,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                got it!
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CompleteView({ gotItCount, total }: { gotItCount: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '12px 0' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ animation: 'happy-hop 1.4s ease-in-out infinite' }}>
          <Cutting size={90} mood="happy" />
        </div>
      </div>
      <Tag>review done</Tag>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 22,
          color: COLORS.ink,
          marginTop: 8,
          letterSpacing: -0.4,
        }}
      >
        nice, see you tomorrow!
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 13,
          color: COLORS.ink60,
          marginTop: 4,
        }}
      >
        {gotItCount}/{total} phrases nailed
      </div>
    </motion.div>
  )
}
