'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { VERBS, Tense, shuffle, getDistractors, type Verb, type ConjRow } from '@/lib/conjugations'
import { playSound } from '@/lib/sounds'
import { useChaina } from '@/components/design'
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

const W = '#fff' // @design-allow: white literal
const BUTTER_MOTIF = '#d4a44a' // @design-allow: butter motif palette accent
const LAV_MOTIF = '#7a5da8' // @design-allow: lav motif palette accent

const TENSES: Tense[] = ['present', 'past', 'future']
const TENSE_LABELS: Record<Tense, string> = {
  present: 'present',
  past: 'past',
  future: 'future',
}

const TENSE_BG: Record<Tense, string> = {
  present: COLORS.mint,
  past: COLORS.peach,
  future: COLORS.lav2,
}

const VERB_PALETTES = [
  { bg: COLORS.peach2, motifBg: COLORS.orange },
  { bg: COLORS.mint2, motifBg: COLORS.teal },
  { bg: COLORS.butter, motifBg: BUTTER_MOTIF },
  { bg: COLORS.lav2, motifBg: LAV_MOTIF },
  { bg: COLORS.peach, motifBg: COLORS.orange },
]

interface DrillCard {
  verb: Verb
  tense: Tense
  row: ConjRow
  options: string[]
  correct: string
}

function buildDeck(verb: Verb, tense: Tense): DrillCard[] {
  const rows = verb.tenses[tense]
  return shuffle(rows).map((row) => {
    const distractors = getDistractors(verb, tense, row.form)
    const options = shuffle([row.form, ...distractors.slice(0, 3)])
    return { verb, tense, row, options, correct: row.form }
  })
}

export default function ConjugationDrillPage() {
  const router = useRouter()
  const { play } = useChaina()
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null)
  const [selectedTense, setSelectedTense] = useState<Tense>('present')
  const [deck, setDeck] = useState<DrillCard[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  const startDrill = useCallback((verb: Verb, tense: Tense) => {
    const newDeck = buildDeck(verb, tense)
    setDeck(newDeck)
    setCardIdx(0)
    setChosen(null)
    setScore({ correct: 0, total: 0 })
    setDone(false)
    setSelectedVerb(verb)
    setSelectedTense(tense)
    playSound('tap')
  }, [])

  const handleChoice = (choice: string) => {
    if (chosen !== null) return
    setChosen(choice)
    const isCorrect = choice === deck[cardIdx].correct
    playSound(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) play('conjugationCorrect')
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const handleNext = () => {
    if (cardIdx + 1 >= deck.length) {
      setDone(true)
    } else {
      setCardIdx((i) => i + 1)
      setChosen(null)
    }
    playSound('swipe')
  }

  // Selection screen
  if (!selectedVerb) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: COLORS.lav,
          paddingBottom: 110,
        }}
      >
        <DottedBg />

        {/* HEADER BAND */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          style={{
            position: 'relative',
            padding: '50px 20px 18px',
            background: COLORS.lav2,
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
                router.back()
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
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div style={{ marginRight: -6, marginTop: -6 }}>
              <Cutting size={66} />
            </div>
          </div>
          <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
            <Tag>🔡 conjugation drill</Tag>
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
              flex your verbs
            </div>
          </div>
        </motion.div>

        <div
          style={{
            padding: '16px 20px 0',
            maxWidth: 480,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* TENSE SEGMENTED PICKER */}
          <div
            style={{
              background: COLORS.ink,
              borderRadius: 99,
              padding: 4,
              display: 'flex',
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              marginBottom: 14,
            }}
          >
            {TENSES.map((t) => {
              const active = selectedTense === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedTense(t)
                    playSound('tap')
                  }}
                  style={{
                    flex: 1,
                    position: 'relative',
                    textAlign: 'center',
                    padding: '7px 0',
                    borderRadius: 99,
                    background: 'transparent',
                    color: active ? COLORS.ink : COLORS.cream,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    border: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="tense-active"
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: COLORS.cream,
                        borderRadius: 99,
                      }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{TENSE_LABELS[t]}</span>
                </button>
              )
            })}
          </div>

          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 12,
              color: COLORS.ink60,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            pick a verb to drill the {TENSE_LABELS[selectedTense]} tense
          </div>

          {/* VERB CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {VERBS.map((verb, i) => {
              const palette = VERB_PALETTES[i % VERB_PALETTES.length]
              return (
                <motion.div
                  key={verb.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.06,
                    type: 'spring',
                    stiffness: 240,
                    damping: 22,
                  }}
                >
                  <Sticker
                    color={palette.bg}
                    radius={20}
                    padding={0}
                    onClick={() => startDrill(verb, selectedTense)}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <div
                        style={{
                          background: palette.motifBg,
                          width: 64,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRight: BORDER.sticker,
                          flexShrink: 0,
                          color: W,
                          fontFamily: FONTS.display,
                          fontWeight: 800,
                          fontSize: 22,
                        }}
                      >
                        {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div style={{ flex: 1, padding: '14px 14px 12px 14px', minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: FONTS.display,
                              fontWeight: 800,
                              fontSize: 18,
                              color: COLORS.ink,
                              letterSpacing: -0.3,
                            }}
                          >
                            {verb.infinitive}
                          </span>
                          {verb.transitive && (
                            <Tag bg={COLORS.lav} color={COLORS.ink} border={COLORS.ink}>
                              transitive
                            </Tag>
                          )}
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.body,
                            fontWeight: 700,
                            fontSize: 12,
                            color: COLORS.ink60,
                          }}
                        >
                          {verb.meaning}
                        </div>
                      </div>
                      <div
                        style={{
                          background: COLORS.ink,
                          color: COLORS.butter,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 16px',
                          fontFamily: FONTS.display,
                          fontWeight: 800,
                          fontSize: 22,
                        }}
                      >
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </Sticker>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Done screen
  if (done) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const isGood = pct >= 80
    const isOk = pct >= 50
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: `linear-gradient(180deg, ${COLORS.peach} 0%, ${COLORS.mint2} 100%)`,
          overflow: 'hidden',
          padding: '50px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isGood && <ChaiConfetti active count={36} />}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          style={{ animation: isGood ? 'happy-hop 1.4s ease-in-out infinite' : undefined }}
        >
          <Cutting size={150} mood={isGood ? 'happy' : 'idle'} />
        </motion.div>
        <div style={{ marginTop: 16, textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <Tag>drill done</Tag>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 44,
              color: COLORS.ink,
              marginTop: 8,
              lineHeight: 1,
              letterSpacing: -0.8,
            }}
          >
            {score.correct}/{score.total}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 14,
              color: COLORS.ink60,
              marginTop: 8,
              maxWidth: 280,
              margin: '8px auto 0',
            }}
          >
            {isGood
              ? 'excellent — you know this tense well!'
              : isOk
              ? 'good start — drill again to lock it in.'
              : 'keep going, repetition is key.'}
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
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
            type="button"
            onClick={() => startDrill(selectedVerb, selectedTense)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 22,
              background: COLORS.orange,
              color: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.sticker,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            drill again ↺
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedVerb(null)
              setDone(false)
            }}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 22,
              background: W,
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
            change verb
          </button>
        </div>
      </div>
    )
  }

  // Active drill
  const card = deck[cardIdx]

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        paddingBottom: 110,
      }}
    >
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: TENSE_BG[card.tense],
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
              setSelectedVerb(null)
            }}
            aria-label="Back to verb pick"
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
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Cutting
              size={66}
              mood={chosen && chosen === card.correct ? 'happy' : 'idle'}
            />
          </div>
        </div>
        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>
            {TENSE_LABELS[card.tense]} · {selectedVerb.infinitive}
          </Tag>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 24,
              color: COLORS.ink,
              lineHeight: 1.05,
              marginTop: 6,
              letterSpacing: -0.4,
            }}
          >
            {selectedVerb.meaning}
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
        {deck.map((_, i) => (
          <div
            key={i}
            style={{
              height: 8,
              flex: i === cardIdx ? 2 : 1,
              borderRadius: 99,
              background: i < cardIdx ? COLORS.green : i === cardIdx ? COLORS.orange : W,
              border: BORDER.thin,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      <div
        style={{
          padding: '18px 20px 0',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* PROMPT STICKER */}
            <Sticker color={W} radius={26} padding={22}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.tag,
                    fontSize: 10,
                    background: COLORS.orange,
                    color: W,
                    padding: '3px 9px',
                    borderRadius: 99,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    border: BORDER.thin,
                  }}
                >
                  card {cardIdx + 1} of {deck.length}
                </span>
                {selectedVerb.transitive && card.tense === 'past' && (
                  <Tag bg={COLORS.butter} color={COLORS.ink} border={COLORS.ink}>
                    🪢 ne
                  </Tag>
                )}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 12,
                  color: COLORS.ink60,
                  textTransform: 'lowercase',
                  letterSpacing: 0.2,
                }}
              >
                conjugate for this subject
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 32,
                  color: COLORS.ink,
                  lineHeight: 1.1,
                  letterSpacing: -0.6,
                }}
              >
                {card.row.subject}
              </div>
              {selectedVerb.transitive && card.tense === 'past' && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    background: COLORS.butter,
                    border: BORDER.thin,
                    borderRadius: 12,
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 11,
                    color: COLORS.ink60,
                    lineHeight: 1.4,
                  }}
                >
                  ne construction — the verb agrees with the gender &amp; number of the direct
                  object, not the subject.
                </div>
              )}
            </Sticker>

            {/* OPTIONS */}
            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {card.options.map((opt, i) => {
                const isChosen = chosen === opt
                const isCorrect = opt === card.correct
                const showResult = chosen !== null
                const isPickedWrong = showResult && isChosen && !isCorrect
                const pastels = [COLORS.peach2, COLORS.mint2, COLORS.butter, COLORS.lav2]
                let bg: string = pastels[i % pastels.length]
                if (showResult && isCorrect) bg = COLORS.mint
                else if (isPickedWrong) bg = COLORS.redBg
                const faded = showResult && !isCorrect && !isChosen

                return (
                  <motion.button
                    key={opt}
                    type="button"
                    onClick={() => handleChoice(opt)}
                    disabled={showResult}
                    whileTap={!showResult ? { scale: 0.96 } : undefined}
                    animate={
                      isPickedWrong
                        ? { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
                        : { x: 0 }
                    }
                    style={{
                      padding: '16px 12px',
                      borderRadius: 18,
                      background: bg,
                      color: COLORS.ink,
                      border: BORDER.sticker,
                      boxShadow: SHADOW.chip,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 16,
                      cursor: showResult ? 'default' : 'pointer',
                      opacity: faded ? 0.55 : 1,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textAlign: 'center',
                    }}
                  >
                    {opt}
                    {showResult && isCorrect && (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: COLORS.green,
                          color: W,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          border: BORDER.thin,
                        }}
                      >
                        ✓
                      </span>
                    )}
                    {isPickedWrong && (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: COLORS.red,
                          color: W,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          border: BORDER.thin,
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {chosen !== null && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: 16,
                  borderRadius: 22,
                  background: COLORS.green,
                  color: W,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                {cardIdx + 1 >= deck.length ? 'see results →' : 'next →'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
