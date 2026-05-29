'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sticker,
  Tag,
  Mascot,
  Confetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
  useChaina,
  canFire,
  markFired,
} from '@/components/design'
import {
  getStage,
  getStages,
  markCardDone,
  isCardDone,
  markEarQuizPassed,
  isEarQuizPassed,
  blendWordId,
  type PronCard,
  type EarQuiz,
  type BlendSet,
} from '@/lib/hindi/pronunciation'
import { speak, speakUrl, stopSpeaking } from '@/lib/speech'
import { getHindiSoundsAudioUrl } from '@/lib/hindi/sounds-audio'
import { playSound } from '@/lib/sounds'
import PronounceButton from '@/components/PronounceButton'

const W = '#fff' // @design-allow: white literal

export default function HindiSoundsStagePage({ params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = use(params)
  const router = useRouter()
  const theme = useTheme()
  const { play } = useChaina()
  const stage = getStage(stageId)

  const [done, setDone] = useState<Set<string>>(new Set())
  const [quizPassed, setQuizPassed] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  useEffect(() => {
    if (!stage) return
    const initial = new Set<string>()
    for (const c of stage.cards) if (isCardDone(c.id)) initial.add(c.id)
    if (stage.blend) for (const w of stage.blend.words) if (isCardDone(blendWordId(w.whole))) initial.add(blendWordId(w.whole))
    setDone(initial)
    setQuizPassed(stage.earQuiz ? isEarQuizPassed(stage.id) : false)
  }, [stage])

  useEffect(() => () => stopSpeaking(), [])

  // Stage completion, derived null-safe so the celebration effect below stays
  // an unconditional hook (no early-return-then-hook rules-of-hooks break).
  const cardsAllDone = !!stage && stage.cards.every((c) => done.has(c.id))
  const blendAllDone = !stage?.blend || stage.blend.words.every((w) => done.has(blendWordId(w.whole)))
  const quizOk = !stage?.earQuiz || quizPassed
  const complete = !!stage && cardsAllDone && blendAllDone && quizOk

  useEffect(() => {
    if (complete && !celebrated) {
      setCelebrated(true)
      playSound('levelup')
      if (canFire('pronStageDone', 'debounce-800ms')) {
        play('pronStageDone')
        markFired('pronStageDone', 'debounce-800ms')
      }
    }
  }, [complete, celebrated, play])

  if (!stage) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: 24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FONTS.body, color: COLORS.ink }}>
          Stage not found.{' '}
          <button
            onClick={() => router.push('/sounds')}
            style={{ background: COLORS.butter, border: BORDER.sticker, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}
          >
            ← Sounds
          </button>
        </div>
      </div>
    )
  }

  const sayIt = (text: string, id: string) => {
    if (speakingId === id) {
      stopSpeaking()
      setSpeakingId(null)
      return
    }
    playSound('pop')
    setSpeakingId(id)
    const finish = () => setSpeakingId(null)
    // Prefer a pre-rendered ElevenLabs clip; fall back to live Google TTS.
    const clip = getHindiSoundsAudioUrl(text)
    if (clip) speakUrl(clip, finish, () => speak(text, 'hi', finish))
    else speak(text, 'hi', finish)
  }

  const markDone = (id: string) => {
    if (done.has(id)) return
    markCardDone(id)
    setDone((prev) => new Set(prev).add(id))
    playSound('correct')
  }

  const onQuizPass = () => {
    markEarQuizPassed(stage.id)
    setQuizPassed(true)
  }

  const allStages = getStages()
  const next = allStages.find((s) => s.order === stage.order + 1)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, paddingBottom: 120, position: 'relative' }}>
      {complete && celebrated && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          <Confetti active={true} />
        </div>
      )}

      {/* HEADER */}
      <div
        style={{
          padding: '44px 20px 16px',
          background: theme.primary,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/sounds')}
            aria-label="Back to Sounds"
            style={{
              background: W, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 999,
              padding: '5px 13px', fontFamily: FONTS.display, fontWeight: 800, fontSize: 13,
              color: COLORS.ink, cursor: 'pointer', marginBottom: 10,
            }}
          >
            ◀ sounds
          </button>
          <Tag bg={W} color={COLORS.ink}>stage {stage.order + 1} · 🔊</Tag>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: W, margin: '8px 0 2px', letterSpacing: -0.4 }}>
            {stage.title}
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 13, color: W, opacity: 0.9, margin: 0 }}>{stage.goal}</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        {/* Intro bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <Mascot size={64} mood="wave" />
          </div>
          <Sticker color={W} radius={16} padding={12}>
            <div style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.5 }}>{stage.intro}</div>
          </Sticker>
        </div>

        {/* Sound cards */}
        {stage.cards.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stage.cards.map((card) => (
              <SoundCardItem
                key={card.id}
                card={card}
                done={done.has(card.id)}
                speakingSound={speakingId === `${card.id}:sound`}
                speakingWord={speakingId === card.id}
                primary={theme.primary}
                onPlaySound={() => sayIt(card.say ?? card.grapheme, `${card.id}:sound`)}
                onPlayWord={() => sayIt(card.anchor.word, card.id)}
                onGotIt={() => markDone(card.id)}
              />
            ))}
          </div>
        )}

        {/* Blend builder */}
        {stage.blend && (
          <BlendBuilderBlock
            blend={stage.blend}
            done={done}
            speakingId={speakingId}
            primary={theme.primary}
            onPlay={sayIt}
            onGotIt={(whole) => markDone(blendWordId(whole))}
          />
        )}

        {/* Ear quiz */}
        {stage.earQuiz && (
          <EarQuizBlock
            quiz={stage.earQuiz}
            passed={quizPassed}
            speakingId={speakingId}
            primary={theme.primary}
            onPlay={sayIt}
            onPass={onQuizPass}
          />
        )}

        {/* Completion */}
        {complete && (
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Sticker color={COLORS.mint2} radius={20} padding={18}>
              <div style={{ textAlign: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink }}>
                ✓ stage complete!
              </div>
              <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink60, marginTop: 4 }}>
                {next ? 'the next stages are unlocked.' : 'you finished the whole course. wah!'}
              </div>
            </Sticker>
            {next ? (
              <button
                onClick={() => { playSound('swipe'); router.push(`/sounds/${next.id}`) }}
                style={ctaStyle(theme.primary)}
              >
                next: {next.title} →
              </button>
            ) : (
              <button onClick={() => { playSound('tap'); router.push('/sounds') }} style={ctaStyle(theme.primary)}>
                back to the ladder →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ctaStyle(primary: string): React.CSSProperties {
  return {
    width: '100%', padding: 16, borderRadius: 20, background: primary, color: W,
    border: BORDER.sticker, boxShadow: SHADOW.sticker, fontFamily: FONTS.display,
    fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase',
  }
}

function PlayButton({ speaking, primary, onClick }: { speaking: boolean; primary: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={speaking ? 'Stop' : 'Hear it'}
      style={{
        width: 34, height: 34, flexShrink: 0, borderRadius: 999,
        background: speaking ? primary : W, color: speaking ? W : COLORS.ink,
        border: BORDER.sticker, cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        {speaking ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M8 5v14l11-7z" />}
      </svg>
    </button>
  )
}

function SoundCardItem({
  card,
  done,
  speakingSound,
  speakingWord,
  primary,
  onPlaySound,
  onPlayWord,
  onGotIt,
}: {
  card: PronCard
  done: boolean
  speakingSound: boolean
  speakingWord: boolean
  primary: string
  onPlaySound: () => void
  onPlayWord: () => void
  onGotIt: () => void
}) {
  return (
    <Sticker color={done ? COLORS.mint2 : W} radius={16} padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Grapheme tile = tap to hear the SOUND/letter itself */}
        <button
          onClick={onPlaySound}
          aria-label={`Hear the sound ${card.grapheme}`}
          style={{
            position: 'relative', minWidth: 56, height: 52, padding: '0 10px', flexShrink: 0, borderRadius: 12,
            background: speakingSound ? primary : COLORS.butter, border: BORDER.sticker, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: speakingSound ? W : COLORS.ink,
          }}
        >
          {card.grapheme}
          <span
            aria-hidden
            style={{
              position: 'absolute', right: -5, bottom: -5, width: 20, height: 20, borderRadius: 999,
              background: W, border: BORDER.thin, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill={COLORS.ink}>
              {speakingSound ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M8 5v14l11-7z" />}
            </svg>
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.35 }}>{card.hint}</div>
          <div style={{ marginTop: 3, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
            {card.anchor.word}{' '}
            <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12, color: COLORS.ink60 }}>· {card.anchor.en}</span>
          </div>
          {card.note && (
            <div style={{ marginTop: 2, fontFamily: FONTS.body, fontSize: 11, fontStyle: 'italic', color: COLORS.ink45 }}>{card.note}</div>
          )}
        </div>
        {/* Word playback, labelled so it's distinct from the sound tile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <PlayButton speaking={speakingWord} primary={primary} onClick={onPlayWord} />
          <span style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 800, color: COLORS.ink60, textTransform: 'uppercase', letterSpacing: 0.4 }}>word</span>
        </div>
        <button
          onClick={onGotIt}
          disabled={done}
          aria-label={done ? 'Got it' : 'Mark got it'}
          style={{
            flexShrink: 0, borderRadius: 999, padding: '7px 12px', border: BORDER.sticker,
            background: done ? COLORS.green : COLORS.cream, color: done ? W : COLORS.ink,
            boxShadow: done ? 'none' : SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800,
            fontSize: 12, cursor: done ? 'default' : 'pointer', textTransform: 'lowercase',
          }}
        >
          {done ? '✓ got it' : 'got it'}
        </button>
      </div>
      <PronounceButton target={card.anchor.word} reference={card.anchor.dev} language="hindi" />
    </Sticker>
  )
}

function BlendBuilderBlock({
  blend,
  done,
  speakingId,
  primary,
  onPlay,
  onGotIt,
}: {
  blend: BlendSet
  done: Set<string>
  speakingId: string | null
  primary: string
  onPlay: (text: string, id: string) => void
  onGotIt: (whole: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {blend.words.map((w) => {
        const wholeId = blendWordId(w.whole)
        const isDone = done.has(wholeId)
        return (
          <Sticker key={w.whole} color={isDone ? COLORS.mint2 : W} radius={16} padding={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {w.parts.map((p, i) => {
                const partId = `${w.whole}-part-${i}`
                return (
                  <button
                    key={i}
                    onClick={() => onPlay(p.text, partId)}
                    style={{
                      borderRadius: 10, padding: '8px 12px', border: BORDER.sticker,
                      background: speakingId === partId ? primary : COLORS.butter,
                      color: speakingId === partId ? W : COLORS.ink,
                      fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, cursor: 'pointer',
                    }}
                  >
                    {p.text}
                  </button>
                )
              })}
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink60 }}>→</span>
              <button
                onClick={() => onPlay(w.whole, `${w.whole}-whole`)}
                style={{
                  borderRadius: 10, padding: '8px 14px', border: BORDER.sticker,
                  background: speakingId === `${w.whole}-whole` ? primary : COLORS.cream,
                  color: speakingId === `${w.whole}-whole` ? W : COLORS.ink,
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, cursor: 'pointer',
                }}
              >
                🔊 {w.whole}
              </button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink60 }}>{w.en}</span>
              <button
                onClick={() => onGotIt(w.whole)}
                disabled={isDone}
                style={{
                  borderRadius: 999, padding: '6px 12px', border: BORDER.sticker,
                  background: isDone ? COLORS.green : COLORS.cream, color: isDone ? W : COLORS.ink,
                  boxShadow: isDone ? 'none' : SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800,
                  fontSize: 12, cursor: isDone ? 'default' : 'pointer', textTransform: 'lowercase',
                }}
              >
                {isDone ? '✓ built' : 'built it'}
              </button>
            </div>
          </Sticker>
        )
      })}
    </div>
  )
}

function EarQuizBlock({
  quiz,
  passed,
  speakingId,
  primary,
  onPlay,
  onPass,
}: {
  quiz: EarQuiz
  passed: boolean
  speakingId: string | null
  primary: string
  onPlay: (text: string, id: string) => void
  onPass: () => void
}) {
  const [correct, setCorrect] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<Record<number, Set<number>>>({})

  useEffect(() => {
    if (passed) setCorrect(new Set(quiz.items.map((_, i) => i)))
  }, [passed, quiz.items])

  const pick = (itemIdx: number, optIdx: number, item: EarQuiz['items'][number]) => {
    if (correct.has(itemIdx)) return
    if (optIdx === item.correctIndex) {
      playSound('correct')
      const nextCorrect = new Set(correct).add(itemIdx)
      setCorrect(nextCorrect)
      if (nextCorrect.size === quiz.items.length) onPass()
    } else {
      playSound('wrong')
      setWrong((prev) => ({ ...prev, [itemIdx]: new Set(prev[itemIdx] ?? []).add(optIdx) }))
    }
  }

  return (
    <div style={{ marginTop: 18 }}>
      <Sticker color={COLORS.butter} radius={18} padding={16}>
        <div style={{ fontFamily: FONTS.tag, fontSize: 10, color: primary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
          🎧 ear training {passed && '· passed ✓'}
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.ink, marginBottom: 12 }}>
          {quiz.prompt}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quiz.items.map((item, itemIdx) => {
            const itemCorrect = correct.has(itemIdx)
            const playId = `quiz-${itemIdx}`
            return (
              <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlayButton speaking={speakingId === playId} primary={primary} onClick={() => onPlay(item.say, playId)} />
                <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.options.map((opt, optIdx) => {
                    const isWinner = itemCorrect && optIdx === item.correctIndex
                    const isWrong = (wrong[itemIdx]?.has(optIdx)) && !itemCorrect
                    return (
                      <motion.button
                        key={optIdx}
                        onClick={() => pick(itemIdx, optIdx, item)}
                        disabled={itemCorrect || isWrong}
                        animate={isWrong ? { x: [-5, 5, -3, 3, 0] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          borderRadius: 10, padding: '8px 12px', border: BORDER.sticker,
                          background: isWinner ? COLORS.mint : isWrong ? COLORS.peach2 : W,
                          color: COLORS.ink, fontFamily: FONTS.body, fontWeight: 700, fontSize: 14,
                          cursor: itemCorrect || isWrong ? 'default' : 'pointer',
                          opacity: isWrong ? 0.55 : 1, boxShadow: itemCorrect && !isWinner ? 'none' : SHADOW.chip,
                        }}
                      >
                        {isWinner && '✓ '}{opt}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Sticker>
    </div>
  )
}
