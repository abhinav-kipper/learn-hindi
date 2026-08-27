'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sticker, Tag, Mascot, Confetti, COLORS, FONTS, BORDER, useTheme } from '@/components/design'
import { playSound, playCombo } from '@/lib/sounds'
import { speak } from '@/lib/speech'
import {
  isCorrect,
  scrambleWords,
  PASS_THRESHOLD,
  type Exercise,
  type OrderExercise,
} from '@/lib/dutch/cheatsheet'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic correct color
const RED = '#b94a4a' // @design-allow: semantic wrong color
const LETTERS = ['A', 'B', 'C', 'D', 'E']

type Props = {
  title: string
  subtitle: string
  exercises: Exercise[]
  onExit: () => void
  onFinish?: (score: number, total: number) => void
  /** Label for the primary button on the done screen. */
  doneCtaLabel?: string
  onDoneCta?: () => void
}

export function DrillRunner({
  title,
  subtitle,
  exercises,
  onExit,
  onFinish,
  doneCtaLabel,
  onDoneCta,
}: Props) {
  const theme = useTheme()
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [checked, setChecked] = useState(false)
  const [wasRight, setWasRight] = useState(false)
  const [done, setDone] = useState(false)

  const ex = exercises[index]
  const total = exercises.length
  const finishedRef = useRef(false)

  // Per-exercise response state.
  const [picked, setPicked] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [placed, setPlaced] = useState<string[]>([])
  const [tray, setTray] = useState<string[]>([])

  useEffect(() => {
    setPicked(null)
    setTyped('')
    setPlaced([])
    setChecked(false)
    setWasRight(false)
    if (ex?.kind === 'order') setTray(scrambleWords(ex as OrderExercise))
    else setTray([])
  }, [ex])

  const passed = total > 0 && score / total >= PASS_THRESHOLD

  useEffect(() => {
    if (!done || finishedRef.current) return
    finishedRef.current = true
    playSound(passed ? 'levelup' : 'complete')
    onFinish?.(score, total)
  }, [done, passed, score, total, onFinish])

  const commit = (right: boolean) => {
    setChecked(true)
    setWasRight(right)
    if (right) {
      const next = combo + 1
      setCombo(next)
      setScore((s) => s + 1)
      if (next >= 2) playCombo(next)
      else playSound('correct')
    } else {
      setCombo(0)
      playSound('wrong')
    }
  }

  const goNext = () => {
    if (index + 1 >= total) {
      setDone(true)
      return
    }
    playSound('swipe')
    setIndex((i) => i + 1)
  }

  if (total === 0) {
    return (
      <Shell title={title} subtitle={subtitle} onExit={onExit}>
        <Sticker color={W} radius={18} padding={18}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: 0 }}>
            Nothing to practise here yet.
          </p>
        </Sticker>
      </Shell>
    )
  }

  if (done) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: COLORS.lav,
          padding: '40px 16px 60px',
          overflow: 'hidden',
        }}
      >
        <Confetti active={passed} />
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <Mascot size={110} mood={passed ? 'happy' : 'idle'} />
          <h1
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 26,
              color: COLORS.ink,
              margin: '10px 0 4px',
            }}
          >
            {passed ? 'Goed gedaan!' : 'Nice work'}
          </h1>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.ink60,
              margin: '0 0 18px',
            }}
          >
            {passed
              ? 'That is a solid pass. This one is ready to sit in your long-term memory.'
              : 'Read the sheet once more, then run it again. Two passes usually does it.'}
          </p>

          <Sticker color={passed ? COLORS.mint : COLORS.butter} radius={22} padding={20}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 44,
                color: COLORS.ink,
                lineHeight: 1,
              }}
            >
              {score}
              <span style={{ fontSize: 22, opacity: 0.55 }}> / {total}</span>
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 13,
                color: COLORS.ink60,
                marginTop: 6,
                fontWeight: 700,
              }}
            >
              {Math.round((score / total) * 100)}% correct, pass mark is 80%
            </div>
          </Sticker>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {doneCtaLabel && onDoneCta && (
              <Sticker color={theme.primary} radius={18} padding={14} onClick={onDoneCta}>
                <span
                  style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W }}
                >
                  {doneCtaLabel}
                </span>
              </Sticker>
            )}
            <Sticker
              color={W}
              radius={18}
              padding={14}
              onClick={() => {
                finishedRef.current = false
                setIndex(0)
                setScore(0)
                setCombo(0)
                setDone(false)
                playSound('pop')
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 15,
                  color: COLORS.ink,
                }}
              >
                Run it again
              </span>
            </Sticker>
            <Sticker color={W} radius={18} padding={14} onClick={onExit}>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 15,
                  color: COLORS.ink,
                }}
              >
                Back to the sheet
              </span>
            </Sticker>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Shell title={title} subtitle={subtitle} onExit={onExit}>
      {/* progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {exercises.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              border: BORDER.thin,
              background: i < index ? theme.primary : i === index ? COLORS.butter : W,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <span style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, color: COLORS.ink60 }}>
          {index + 1} of {total}
        </span>
        {combo >= 2 && (
          <motion.span
            key={combo}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            style={{
              fontFamily: FONTS.display,
              fontSize: 12,
              fontWeight: 800,
              color: COLORS.ink,
              background: COLORS.butter,
              border: BORDER.thin,
              borderRadius: 99,
              padding: '2px 10px',
            }}
          >
            🔥 {combo} in a row
          </motion.span>
        )}
      </div>

      <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 14 }}>
        <Tag bg={COLORS.lav2} color={COLORS.ink}>
          {ex.kind === 'mcq' ? 'choose one' : ex.kind === 'fill' ? 'fill the gap' : 'word order'}
        </Tag>
        <p
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 17,
            color: COLORS.ink,
            margin: '8px 0 0',
            lineHeight: 1.35,
          }}
        >
          {ex.prompt}
        </p>
      </Sticker>

      {ex.kind === 'mcq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ex.options.map((opt, i) => {
            const isPicked = picked === i
            const showCorrect = checked && i === ex.correct
            const showWrong = checked && isPicked && i !== ex.correct
            const bg = showCorrect ? COLORS.mint : showWrong ? COLORS.redBg : W
            return (
              <motion.div
                key={i}
                animate={showWrong ? { x: [0, -7, 7, -4, 0] } : { x: 0 }}
                transition={{ duration: 0.32 }}
                style={{ opacity: checked && !showCorrect && !showWrong ? 0.55 : 1 }}
              >
                <Sticker
                  color={bg}
                  radius={16}
                  padding={0}
                  onClick={
                    checked
                      ? undefined
                      : () => {
                          setPicked(i)
                          commit(isCorrect(ex, i))
                        }
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div
                      style={{
                        width: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: BORDER.thin,
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 15,
                        color: COLORS.ink,
                        flexShrink: 0,
                      }}
                    >
                      {showCorrect ? '✓' : showWrong ? '✕' : LETTERS[i]}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        fontFamily: FONTS.body,
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: COLORS.ink,
                        lineHeight: 1.35,
                      }}
                    >
                      {opt}
                    </div>
                  </div>
                </Sticker>
              </motion.div>
            )
          })}
        </div>
      )}

      {ex.kind === 'fill' && (
        <Sticker color={COLORS.butter} radius={18} padding={14}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              fontFamily: FONTS.body,
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.ink,
            }}
          >
            {ex.before && <span>{ex.before}</span>}
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !checked && typed.trim()) commit(isCorrect(ex, typed))
              }}
              disabled={checked}
              placeholder="..."
              aria-label="Your answer"
              style={{
                flex: '1 1 120px',
                minWidth: 110,
                padding: '9px 12px',
                borderRadius: 12,
                border: BORDER.sticker,
                background: checked ? (wasRight ? COLORS.mint : COLORS.redBg) : W,
                fontFamily: FONTS.body,
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.ink,
                outline: 'none',
              }}
            />
            {ex.after && <span>{ex.after}</span>}
          </div>
          {!checked && (
            <Sticker
              color={typed.trim() ? theme.primary : COLORS.lav2}
              radius={14}
              padding={11}
              onClick={typed.trim() ? () => commit(isCorrect(ex, typed)) : undefined}
              style={{ marginTop: 12 }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 14,
                  color: typed.trim() ? W : COLORS.ink,
                }}
              >
                Check
              </span>
            </Sticker>
          )}
        </Sticker>
      )}

      {ex.kind === 'order' && (
        <div>
          <Sticker
            color={checked ? (wasRight ? COLORS.mint : COLORS.redBg) : COLORS.butter}
            radius={18}
            padding={12}
            style={{ minHeight: 62, marginBottom: 12 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, minHeight: 34 }}>
              {placed.length === 0 && (
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: COLORS.ink45,
                    fontStyle: 'italic',
                    alignSelf: 'center',
                  }}
                >
                  Tap the words below in the right order
                </span>
              )}
              {placed.map((word, i) => (
                <WordTile
                  key={`${word}-${i}`}
                  word={word}
                  bg={W}
                  onClick={
                    checked
                      ? undefined
                      : () => {
                          playSound('tap')
                          setPlaced((p) => p.filter((_, j) => j !== i))
                          setTray((t) => [...t, word])
                        }
                  }
                />
              ))}
            </div>
          </Sticker>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {tray.map((word, i) => (
              <WordTile
                key={`${word}-${i}`}
                word={word}
                bg={COLORS.lav2}
                onClick={
                  checked
                    ? undefined
                    : () => {
                        playSound('tap')
                        const nextPlaced = [...placed, word]
                        setTray((t) => t.filter((_, j) => j !== i))
                        setPlaced(nextPlaced)
                        if (nextPlaced.length === (ex as OrderExercise).answer.length) {
                          commit(isCorrect(ex, nextPlaced))
                        }
                      }
                }
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 16 }}
          >
            <Sticker color={wasRight ? COLORS.mint2 : COLORS.peach2} radius={18} padding={14}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 15,
                  color: wasRight ? GREEN : RED,
                  marginBottom: 6,
                }}
              >
                {wasRight ? '✓ Correct' : '✕ Not quite'}
              </div>
              {!wasRight && <CorrectAnswer ex={ex} />}
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 13.5,
                  color: COLORS.ink,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {ex.explain}
              </p>
            </Sticker>

            <Sticker
              color={theme.primary}
              radius={18}
              padding={14}
              onClick={goNext}
              style={{ marginTop: 12 }}
            >
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W }}>
                {index + 1 >= total ? 'See your score' : 'Next question'}
              </span>
            </Sticker>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  )
}

function CorrectAnswer({ ex }: { ex: Exercise }) {
  const text =
    ex.kind === 'mcq'
      ? ex.options[ex.correct]
      : ex.kind === 'fill'
        ? ex.answers[0]
        : ex.answer.join(' ')
  const speakable = ex.kind !== 'mcq'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 14.5,
          fontWeight: 800,
          color: COLORS.ink,
          background: COLORS.butter,
          border: BORDER.thin,
          borderRadius: 10,
          padding: '5px 10px',
        }}
      >
        {text}
      </div>
      {speakable && (
        <button
          aria-label="Hear the answer"
          onClick={() => speak(text, 'nl')}
          style={{
            width: 28,
            height: 28,
            borderRadius: 99,
            background: COLORS.mint2,
            border: BORDER.thin,
            cursor: 'pointer',
            fontSize: 12,
            padding: 0,
          }}
        >
          🔊
        </button>
      )}
    </div>
  )
}

function WordTile({
  word,
  bg,
  onClick,
}: {
  word: string
  bg: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        fontFamily: FONTS.body,
        fontSize: 14.5,
        fontWeight: 700,
        color: COLORS.ink,
        background: bg,
        border: BORDER.sticker,
        borderRadius: 12,
        padding: '7px 11px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {word}
    </button>
  )
}

function Shell({
  title,
  subtitle,
  onExit,
  children,
}: {
  title: string
  subtitle: string
  onExit: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100dvh', background: COLORS.lav, padding: '22px 16px 60px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.ink,
            fontSize: 14,
            fontFamily: FONTS.body,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 8,
          }}
        >
          ← Leave practice
        </button>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 22,
            color: COLORS.ink,
            margin: '0 0 2px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 13,
            color: COLORS.ink60,
            margin: '0 0 16px',
            fontStyle: 'italic',
          }}
        >
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  )
}
