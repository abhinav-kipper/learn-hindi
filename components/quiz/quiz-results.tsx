'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { Sticker, Tag, Cutting, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
import { useLanguage } from '@/lib/language-context'
import { getAverageQuizScore } from '@/lib/quiz'
import type { QuizQuestion, QuizResult } from '@/types/quiz'
import { playSound } from '@/lib/sounds'

interface QuizResultsProps {
  score: number
  total: number
  onTryAgain: () => void
  onGoHome: () => void
  questions?: QuizQuestion[]
  results?: QuizResult[]
}

export function QuizResults({
  score,
  total,
  onTryAgain,
  onGoHome,
  questions,
  results,
}: QuizResultsProps) {
  const router = useRouter()
  const { config } = useLanguage()
  const confettiTriggered = useRef(false)
  const percentage = Math.round((score / total) * 100)
  const isGreatScore = percentage >= 70
  const avg = getAverageQuizScore(config.storagePrefix)

  useEffect(() => {
    if (isGreatScore && !confettiTriggered.current) {
      confettiTriggered.current = true
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [COLORS.peach, COLORS.mint, COLORS.lav2, COLORS.butter, COLORS.rose],
      })
    }
  }, [isGreatScore])

  const getMessage = () => {
    if (percentage === 100) return 'perfect — wah!'
    if (percentage >= 80) return 'you crushed it!'
    if (percentage >= 70) return 'bahut accha!'
    if (percentage >= 50) return 'good effort, yaar.'
    return 'keep at it, dost.'
  }

  // Missed questions for "worth revisiting"
  const missed = (questions ?? [])
    .map((q, idx) => {
      const r = results?.[idx]
      if (!r || r.isCorrect) return null
      const correctAnswer = q.answers.find((a) => a.isCorrect)
      if (!correctAnswer) return null
      return { question: q, correct: correctAnswer.text }
    })
    .filter((x): x is { question: QuizQuestion; correct: string } => x !== null)

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav }}>
      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.mint,
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
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              router.push('/')
            }}
            aria-label="Close"
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: '#fff',
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div style={{ marginRight: -6, marginTop: -6, animation: isGreatScore ? 'happy-hop 1.4s ease-in-out infinite' : undefined }}>
            <Cutting size={70} mood={isGreatScore ? 'happy' : 'idle'} />
          </div>
        </div>
        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>quiz complete</Tag>
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
            {getMessage()}
          </div>
        </div>
      </motion.div>

      <div
        style={{
          padding: '16px 20px 120px',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* SCORE HERO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
        >
          <Sticker color={COLORS.butter} radius={26} padding={22}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  background: COLORS.orange,
                  borderRadius: 22,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.chip,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  animation: 'float-y 3s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 38,
                    lineHeight: 1,
                  }}
                >
                  {score}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.tag,
                    fontSize: 10,
                    letterSpacing: 1,
                    marginTop: 4,
                  }}
                >
                  of {total}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Tag bg={COLORS.green} color="#fff" border={COLORS.ink}>
                  {percentage}% correct
                </Tag>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 20,
                    color: COLORS.ink,
                    marginTop: 6,
                    lineHeight: 1.1,
                  }}
                >
                  {isGreatScore ? 'shabash!' : 'keep going!'}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    color: COLORS.ink60,
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  avg this week: {avg.toFixed(1)} / {total}
                </div>
              </div>
            </div>
          </Sticker>
        </motion.div>

        {/* WORTH REVISITING */}
        {missed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={{ marginTop: 24 }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                color: COLORS.ink,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              worth revisiting
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {missed.map(({ question, correct }, i) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Sticker color="#fff" radius={16} padding={12}>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 15,
                        color: COLORS.ink,
                        lineHeight: 1.2,
                      }}
                    >
                      {question.prompt}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 11,
                        fontWeight: 600,
                        color: COLORS.ink60,
                        marginTop: 4,
                      }}
                    >
                      <span style={{ color: COLORS.green, fontWeight: 800 }}>✓ {correct}</span>
                    </div>
                  </Sticker>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA ROW */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: 24, display: 'flex', gap: 10 }}
        >
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playSound('tap')
                router.push('/mistakes')
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 22,
                background: '#fff',
                color: COLORS.ink,
                border: BORDER.sticker,
                boxShadow: SHADOW.chip,
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                textTransform: 'lowercase',
              }}
            >
              drill missed →
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              onTryAgain()
            }}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 22,
              background: COLORS.orange,
              color: '#fff',
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            play again ↺
          </button>
        </motion.div>

        <button
          type="button"
          onClick={onGoHome}
          style={{
            marginTop: 12,
            width: '100%',
            padding: 12,
            borderRadius: 22,
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
          back to home
        </button>
      </div>
    </div>
  )
}
