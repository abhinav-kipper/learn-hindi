'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker, Tag, Mascot, Confetti,
  COLORS, FONTS, BORDER,
  useChaina, canFire, markFired, useTheme,
} from '@/components/design'
import {
  drawMockSet,
  scoreMockAttempt,
  saveMockAttempt,
  MOCK_SIZE,
  QUESTIONS_PER_TEXT,
  PASS_THRESHOLD,
  MOCK_TIMER_MS,
  type LezenText,
} from '@/lib/dutch/lezen'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color
const ROSE_LIGHT = '#f4c5c5' // @design-allow: wrong-answer highlight

const TOTAL_Q = MOCK_SIZE * QUESTIONS_PER_TEXT // 20

export default function LezenMockPage() {
  const router = useRouter()
  const theme = useTheme()
  const texts = useMemo<LezenText[]>(() => drawMockSet(), [])
  const [textIdx, setTextIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Array<0 | 1 | 2 | 3 | null>>(() =>
    Array(TOTAL_Q).fill(null) as Array<0 | 1 | 2 | 3 | null>,
  )
  const [done, setDone] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [timeLeftMs, setTimeLeftMs] = useState(MOCK_TIMER_MS)
  const { play } = useChaina()
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (done) return
    tickRef.current = setInterval(() => {
      setTimeLeftMs((ms) => {
        if (ms <= 1000) {
          if (tickRef.current) clearInterval(tickRef.current)
          setDone(true)
          return 0
        }
        return ms - 1000
      })
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [done])

  const flatIndex = textIdx * QUESTIONS_PER_TEXT + qIdx
  const text = texts[textIdx]
  const q = text?.questions[qIdx]

  const result = useMemo(() => done
    ? scoreMockAttempt(texts, answers.map((a) => (a ?? 0) as 0|1|2|3))
    : null, [done, texts, answers])

  useEffect(() => {
    if (!done || !result) return
    saveMockAttempt({
      ts: Date.now(),
      score: result.score,
      total: result.total,
      passed: result.passed,
      text_ids: texts.map((t) => t.id),
    })
    if (result.passed) {
      playSound('levelup')
      if (canFire('lezenMockPassed', 'debounce-800ms')) {
        play('lezenMockPassed')
        markFired('lezenMockPassed', 'debounce-800ms')
      }
    } else {
      playSound('complete')
      if (canFire('knmAttemptComplete', 'debounce-800ms')) {
        play('knmAttemptComplete')
        markFired('knmAttemptComplete', 'debounce-800ms')
      }
    }
  }, [done, result, texts, play])

  const onSelect = (i: 0 | 1 | 2 | 3) => {
    if (revealed) return
    const next = [...answers]
    next[flatIndex] = i
    setAnswers(next)
    setRevealed(true)
    playSound(i === q!.correct_index ? 'correct' : 'wrong')
    setTimeout(() => {
      if (qIdx === QUESTIONS_PER_TEXT - 1) {
        if (textIdx === texts.length - 1) {
          setDone(true)
        } else {
          setTextIdx(textIdx + 1)
          setQIdx(0)
          setRevealed(false)
        }
      } else {
        setQIdx(qIdx + 1)
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
            : `Need ${Math.ceil(TOTAL_Q * PASS_THRESHOLD)} / ${TOTAL_Q} to pass`}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Sticker color={theme.primary} radius={16} padding={12} onClick={() => router.push('/dutch/lezen')}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: W, padding: '0 8px' }}>Back to Lezen</div>
          </Sticker>
          <Sticker color={COLORS.butter} radius={16} padding={12} onClick={() => location.reload()}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, color: COLORS.ink, padding: '0 8px' }}>Try again</div>
          </Sticker>
        </div>
      </div>
    )
  }

  const min = Math.floor(timeLeftMs / 60000)
  const sec = Math.floor((timeLeftMs % 60000) / 1000)
  const timerStr = `${min}:${sec.toString().padStart(2, '0')}`
  const timerLow = timeLeftMs < 5 * 60 * 1000

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Tag>{`Q ${flatIndex + 1} / ${TOTAL_Q}`}</Tag>
            <Tag bg={timerLow ? ROSE_LIGHT : COLORS.butter}>
              {timerStr}
            </Tag>
          </div>
        </div>

        <div style={{
          height: 8, background: W, borderRadius: 4, border: BORDER.sticker, marginBottom: 18,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={false}
            animate={{ width: `${((flatIndex + (revealed ? 1 : 0)) / TOTAL_Q) * 100}%` }}
            style={{ height: '100%', background: theme.primary }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        <Sticker color={W} radius={18} padding={14} style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink, marginBottom: 6,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {text.title_nl}
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}>
            {text.body_nl}
          </div>
        </Sticker>

        <Sticker color={W} radius={16} padding={14} style={{ marginBottom: 12 }}>
          <Tag bg={COLORS.butter}>{q!.type}</Tag>
          <div style={{
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink,
            marginTop: 8, lineHeight: 1.4,
          }}>
            {q!.question_nl}
          </div>
        </Sticker>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q!.options_nl.map((opt, i) => {
            const isSelected = answers[flatIndex] === i
            const isCorrect = i === q!.correct_index
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
                radius={12}
                padding={12}
                onClick={() => onSelect(i as 0 | 1 | 2 | 3)}
              >
                <div style={{
                  fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 16,
                    width: 26, height: 26, borderRadius: '50%', background: COLORS.lav,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showCorrect && <span style={{ fontSize: 20 }}>✓</span>}
                  {showWrong && <span style={{ fontSize: 20 }}>✕</span>}
                </div>
              </Sticker>
            )
          })}
        </div>

        {revealed && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
            <Sticker color={COLORS.butter} radius={10} padding={10}>
              <div style={{
                fontFamily: FONTS.body, fontSize: 12, fontStyle: 'italic', color: COLORS.ink, lineHeight: 1.4,
              }}>
                {q!.explanation_en}
              </div>
            </Sticker>
          </motion.div>
        )}
      </div>
    </div>
  )
}
