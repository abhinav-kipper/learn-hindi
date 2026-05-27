'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker, Tag, Mascot, Confetti,
  COLORS, FONTS, BORDER,
  useChaina, canFire, markFired, useTheme,
} from '@/components/design'
import {
  drawDrillSet,
  scoreAttempt,
  saveAttempt,
  DRILL_SIZE,
  PASS_THRESHOLD,
  type KnmQuestion,
} from '@/lib/dutch/knm'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color
const ROSE_LIGHT = '#f4c5c5' // @design-allow: wrong-answer highlight (rose family)

export default function KnmDrillPage() {
  const router = useRouter()
  const theme = useTheme()
  const drill = useMemo<KnmQuestion[]>(() => drawDrillSet(), [])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Array<0 | 1 | 2 | 3 | null>>(
    () => Array(DRILL_SIZE).fill(null) as Array<0 | 1 | 2 | 3 | null>,
  )
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const { play } = useChaina()

  const current = drill[currentIdx]
  const result = useMemo(() => done
    ? scoreAttempt(drill, answers.map((a) => (a ?? 0) as 0|1|2|3))
    : null, [done, drill, answers])

  useEffect(() => {
    if (!done || !result) return
    saveAttempt({ ts: Date.now(), score: result.score, total: result.total, passed: result.passed })
    if (result.passed) {
      playSound('levelup')
      if (canFire('knmPassed', 'debounce-800ms')) { play('knmPassed'); markFired('knmPassed', 'debounce-800ms') }
    } else {
      playSound('complete')
      if (canFire('knmAttemptComplete', 'debounce-800ms')) { play('knmAttemptComplete'); markFired('knmAttemptComplete', 'debounce-800ms') }
    }
  }, [done, result, play])

  const onSelect = (idx: 0 | 1 | 2 | 3) => {
    if (revealed) return
    const next = [...answers]
    next[currentIdx] = idx
    setAnswers(next)
    setRevealed(true)
    playSound(idx === current.correct_index ? 'correct' : 'wrong')
    setTimeout(() => {
      if (currentIdx === DRILL_SIZE - 1) {
        setDone(true)
      } else {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
      }
    }, 1500)
  }

  if (done && result) {
    return (
      <div style={{
        minHeight: '100vh', background: COLORS.lav, padding: '24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {result.passed && <Confetti active />}
        <Mascot size={120} mood={result.passed ? 'happy' : 'idle'} />
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 32, color: COLORS.ink, margin: '16px 0 4px',
        }}>
          {result.passed ? 'Geslaagd! 🎉' : 'Bijna!'}
        </h1>
        <div style={{
          fontFamily: FONTS.display, fontSize: 56, fontWeight: 800,
          color: result.passed ? GREEN : RED,
        }}>
          {result.score} / {result.total}
        </div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, marginTop: 4,
        }}>
          {result.passed
            ? `Above the ${Math.round(PASS_THRESHOLD * 100)}% pass threshold`
            : `Need ${Math.ceil(DRILL_SIZE * PASS_THRESHOLD)} / ${DRILL_SIZE} to pass`}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Sticker color={theme.primary} radius={16} padding={12} onClick={() => router.push('/dutch/knm')}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: W, padding: '0 8px' }}>Back to KNM</div>
          </Sticker>
          <Sticker color={COLORS.butter} radius={16} padding={12} onClick={() => location.reload()}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: COLORS.ink, padding: '0 8px' }}>Try again</div>
          </Sticker>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ← Exit
          </button>
          <Tag>{`Question ${currentIdx + 1} / ${DRILL_SIZE}`}</Tag>
        </div>

        <div style={{
          height: 8, background: W, borderRadius: 4, border: BORDER.sticker, marginBottom: 18,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={false}
            animate={{ width: `${((currentIdx + (revealed ? 1 : 0)) / DRILL_SIZE) * 100}%` }}
            style={{ height: '100%', background: theme.primary }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        <Sticker color={W} radius={20} padding={18} style={{ marginBottom: 18 }}>
          <Tag bg={COLORS.butter}>{current.category}</Tag>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: COLORS.ink,
            marginTop: 10, lineHeight: 1.4,
          }}>
            {current.question_nl}
          </div>
        </Sticker>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options_nl.map((opt, i) => {
            const isSelected = answers[currentIdx] === i
            const isCorrect = i === current.correct_index
            const showCorrect = revealed && isCorrect
            const showWrong = revealed && isSelected && !isCorrect
            const bg = showCorrect ? COLORS.mint
                     : showWrong   ? ROSE_LIGHT
                     : isSelected  ? COLORS.butter
                     : W
            return (
              <Sticker
                key={i}
                color={bg}
                radius={14}
                padding={14}
                onClick={() => onSelect(i as 0 | 1 | 2 | 3)}
              >
                <div style={{
                  fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 18,
                    width: 28, height: 28, borderRadius: '50%', background: COLORS.lav,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showCorrect && <span style={{ fontSize: 22 }}>✓</span>}
                  {showWrong && <span style={{ fontSize: 22 }}>✕</span>}
                </div>
              </Sticker>
            )
          })}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 14 }}
          >
            <Sticker color={COLORS.butter} radius={12} padding={12}>
              <div style={{
                fontFamily: FONTS.body, fontSize: 13, fontStyle: 'italic',
                color: COLORS.ink, lineHeight: 1.5,
              }}>
                {current.explanation_en}
              </div>
            </Sticker>
          </motion.div>
        )}
      </div>
    </div>
  )
}
