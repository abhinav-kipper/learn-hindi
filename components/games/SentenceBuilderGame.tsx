'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { SentenceGame } from '@/types/game'
import { drawSentenceGame, getSentenceBest, recordSentenceResult, getSentenceProgress, saveSentenceProgress, clearSentenceProgress, SENTENCE_TOTAL, SENTENCE_PER_ROUND, type Build } from '@/lib/sentence-game'
import { addMistake } from '@/lib/mistakes'
import { playSound, playCombo } from '@/lib/sounds'
import { speak } from '@/lib/speech'
import { useLanguage } from '@/lib/language-context'
import { Sticker, Tag, Mascot, Confetti, DottedBg, COLORS, FONTS, BORDER, SHADOW, useTheme, useChaina } from '@/components/design'

const W = '#fff' // @design-allow: white literal
const NUM_ROUNDS = SENTENCE_TOTAL / SENTENCE_PER_ROUND // 3

type Phase = 'intro' | 'playing' | 'checkpoint' | 'done'
type Status = 'correct' | 'wrong' | null

function buzz(p: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(p)
  } catch {
    /* ignore */
  }
}

export function SentenceBuilderGame({ game }: { game: SentenceGame }) {
  const router = useRouter()
  const theme = useTheme()
  const { play } = useChaina()
  const { config } = useLanguage()
  const prefix = config.storagePrefix

  const [phase, setPhase] = useState<Phase>('intro')
  const [builds, setBuilds] = useState<Build[]>([])
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [status, setStatus] = useState<Status>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState<{ score: number; total: number } | null>(null)
  const [newBest, setNewBest] = useState(false)
  const [resume, setResume] = useState<{ round: number } | null>(null)

  const scoreRef = useRef(0)
  scoreRef.current = score

  useEffect(() => {
    setBest(getSentenceBest(prefix, game.id))
    const p = getSentenceProgress(prefix, game.id)
    setResume(p ? { round: Math.floor(p.index / SENTENCE_PER_ROUND) + 1 } : null)
  }, [prefix, game.id])

  const current = builds[index]
  const setNum = Math.floor(index / SENTENCE_PER_ROUND) + 1
  const inSet = (index % SENTENCE_PER_ROUND) + 1
  const tileById = (id: number) => current?.tiles.find((t) => t.id === id)

  function start() {
    clearSentenceProgress(prefix, game.id)
    setResume(null)
    setBuilds(drawSentenceGame(game))
    setIndex(0)
    setPlaced([])
    setStatus(null)
    setScore(0)
    setCombo(0)
    setNewBest(false)
    setPhase('playing')
    playSound('tap')
  }

  function resumeGame() {
    const p = getSentenceProgress(prefix, game.id)
    if (!p) {
      start()
      return
    }
    setBuilds(p.builds)
    setIndex(p.index)
    setScore(p.score)
    setPlaced([])
    setStatus(null)
    setCombo(0)
    setNewBest(false)
    setPhase('playing')
    playSound('tap')
  }

  function place(id: number) {
    if (status || !current) return
    const np = [...placed, id]
    setPlaced(np)
    buzz(8)
    playSound('tap')
    if (np.length === current.correct.length) evaluate(np)
  }

  function unplace(id: number) {
    if (status) return
    setPlaced((p) => p.filter((x) => x !== id))
    buzz(6)
  }

  function evaluate(finalPlaced: number[]) {
    if (!current) return
    const built = finalPlaced.map((id) => tileById(id)?.w ?? '')
    const ok = built.length === current.correct.length && built.every((w, i) => w === current.correct[i])
    if (ok) {
      setStatus('correct')
      const nextCombo = combo + 1
      setCombo(nextCombo)
      setScore((s) => s + 1)
      if (nextCombo >= 2) playCombo(nextCombo)
      else playSound('correct')
      buzz([12, 30, 12])
      speak(current.correct.join(' '), 'hi')
    } else {
      setStatus('wrong')
      setCombo(0)
      playSound('wrong')
      buzz([0, 60])
      addMistake(
        { original: current.english, correction: current.correct.join(' '), reason: 'Hindi puts the verb at the end.' },
        'pronouns-verbs',
        prefix,
        'quiz',
      )
    }
    window.setTimeout(advance, ok ? 1250 : 1900)
  }

  function advance() {
    const next = index + 1
    if (next >= SENTENCE_TOTAL) {
      clearSentenceProgress(prefix, game.id)
      const finalScore = scoreRef.current
      const result = recordSentenceResult(prefix, game.id, finalScore, SENTENCE_TOTAL)
      setNewBest(!best || finalScore > best.score)
      setBest(result)
      setPhase('done')
      playSound('levelup')
      buzz([30, 60, 30, 60, 60])
      play(finalScore / SENTENCE_TOTAL >= 0.6 ? 'lessonComplete' : 'correctAnswer')
      return
    }
    setIndex(next)
    setPlaced([])
    setStatus(null)
    if (next % SENTENCE_PER_ROUND === 0) {
      // Round done: checkpoint + save so the player can resume from here.
      saveSentenceProgress(prefix, game.id, { builds, index: next, score: scoreRef.current })
      setPhase('checkpoint')
      playSound('complete')
      buzz([20, 50, 20])
    }
  }

  const tray = current ? current.tiles.filter((t) => !placed.includes(t.id)) : []

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DottedBg />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 12, padding: '50px 18px 14px' }}>
        <button type="button" onClick={() => router.back()} aria-label="Close" style={{ background: W, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 99, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.ink, flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: 19, color: COLORS.ink, marginRight: 36 }}>{game.title}</div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 18px 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {phase === 'intro' && <Intro game={game} best={best} resume={resume} onStart={start} onResume={resumeGame} primary={theme.primary} />}
        {phase === 'playing' && current && (
          <Play game={game} build={current} setNum={setNum} inSet={inSet} combo={combo} placed={placed} tray={tray} status={status} tileById={tileById} onPlace={place} onUnplace={unplace} />
        )}
        {phase === 'checkpoint' && (
          <Checkpoint setNum={Math.floor(index / SENTENCE_PER_ROUND)} score={score} answered={index} onContinue={() => setPhase('playing')} primary={theme.primary} />
        )}
        {phase === 'done' && (
          <Done score={score} total={SENTENCE_TOTAL} best={best} newBest={newBest} onAgain={start} onClose={() => router.back()} primary={theme.primary} />
        )}
      </div>

      {phase === 'done' && score / Math.max(SENTENCE_TOTAL, 1) >= 0.6 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}><Confetti active /></div>
      )}
    </div>
  )
}

function RoundStepper({ setNum }: { setNum: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {Array.from({ length: NUM_ROUNDS }).map((_, i) => {
        const n = i + 1
        const done = n < setNum
        const active = n === setNum
        return (
          <div key={n} style={{ flex: 1, height: 26, borderRadius: 99, border: BORDER.sticker, background: done ? COLORS.mint : active ? COLORS.orange : W, boxShadow: active ? SHADOW.chip : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: active ? W : COLORS.ink }}>
            {done ? `Round ${n} ✓` : `Round ${n}`}
          </div>
        )
      })}
    </div>
  )
}

function Tile({ word, onClick, tone }: { word: string; onClick?: () => void; tone: 'tray' | 'placed' | 'correct' | 'wrong' }) {
  const bg = tone === 'correct' ? COLORS.mint : tone === 'wrong' ? COLORS.redBg : tone === 'placed' ? COLORS.peach2 : W
  return (
    <button type="button" onClick={onClick} disabled={!onClick} style={{ background: bg, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 13, padding: '10px 14px', fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, color: COLORS.ink, cursor: onClick ? 'pointer' : 'default' }}>
      {word}
    </button>
  )
}

function Play({ game, build, setNum, inSet, combo, placed, tray, status, tileById, onPlace, onUnplace }: {
  game: SentenceGame
  build: Build
  setNum: number
  inSet: number
  combo: number
  placed: number[]
  tray: { id: number; w: string }[]
  status: Status
  tileById: (id: number) => { id: number; w: string } | undefined
  onPlace: (id: number) => void
  onUnplace: (id: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <RoundStepper setNum={setNum} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', gap: 3 }}>
          {Array.from({ length: SENTENCE_PER_ROUND }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 99, background: i < inSet - (status ? 0 : 1) ? COLORS.orange : W, border: BORDER.thin }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: combo >= 2 ? COLORS.orange : COLORS.ink45 }}>
          <span style={{ fontSize: 16 }}>⚡</span>{combo}x
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink45, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {game.question || 'build the sentence'}
      </div>
      <Sticker color={COLORS.butter} radius={16} padding={14}>
        <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 800, fontSize: 17, color: COLORS.ink, lineHeight: 1.3 }}>{build.english}</div>
      </Sticker>

      {/* answer zone */}
      <motion.div animate={status === 'wrong' ? { x: [0, -10, 10, -7, 7, 0] } : {}} transition={{ duration: 0.4 }} style={{ marginTop: 16 }}>
        <div style={{ minHeight: 60, border: BORDER.stickerDashed, borderRadius: 16, background: status === 'correct' ? COLORS.mint2 : status === 'wrong' ? COLORS.redBg : W, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: placed.length ? 'flex-start' : 'center', transition: 'background 0.2s' }}>
          {placed.length === 0 ? (
            <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink45 }}>tap the words below in order</span>
          ) : (
            placed.map((id) => {
              const t = tileById(id)
              if (!t) return null
              return <Tile key={id} word={t.w} tone={status ? (status === 'correct' ? 'correct' : 'wrong') : 'placed'} onClick={status ? undefined : () => onUnplace(id)} />
            })
          )}
        </div>
      </motion.div>

      {/* correct answer on a miss */}
      {status === 'wrong' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10, textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink60 }}>the right order</div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.green, marginTop: 2 }}>{build.correct.join(' ')}</div>
        </motion.div>
      )}

      <div style={{ flex: 1 }} />

      {/* tile tray */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 52 }}>
        <AnimatePresence>
          {tray.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <Tile word={t.w} tone="tray" onClick={status ? undefined : () => onPlace(t.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Checkpoint({ setNum, score, answered, onContinue, primary }: { setNum: number; score: number; answered: number; onContinue: () => void; primary: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
      <Mascot size={104} mood="happy" />
      <Tag bg={primary} color={W} border={COLORS.ink}>round {setNum} of {NUM_ROUNDS} done</Tag>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, color: COLORS.ink, lineHeight: 1 }}>{score}/{answered} so far</div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60 }}>next round gets a little trickier</div>
      <button type="button" onClick={onContinue} style={{ marginTop: 8, padding: '14px 40px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase' }}>next round</button>
    </motion.div>
  )
}

function Intro({ game, best, resume, onStart, onResume, primary }: { game: SentenceGame; best: { score: number; total: number } | null; resume: { round: number } | null; onStart: () => void; onResume: () => void; primary: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60 }}>{game.subtitle}</div>
      {game.tip && (
        <Sticker color={COLORS.butter} radius={18} padding={14}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>💡</span>
            <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.45 }}>{game.tip}</span>
          </div>
        </Sticker>
      )}
      <Sticker color={COLORS.mint2} radius={18} padding={16}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink, marginBottom: 6 }}>how it works</div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
          Tap the Hindi words to build the sentence that matches the English. It gets trickier each round: round 2 sneaks in a decoy word, round 3 adds two.
        </div>
      </Sticker>
      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink45 }}>
        3 rounds of {SENTENCE_PER_ROUND}{best ? ` · 🏆 best ${best.score}/${best.total}` : ''}
      </div>
      <div style={{ flex: 1 }} />
      {resume ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={onResume} style={{ width: '100%', padding: '15px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 22, fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, cursor: 'pointer', textTransform: 'lowercase' }}>
            continue · round {resume.round} of {NUM_ROUNDS}
          </button>
          <button type="button" onClick={onStart} style={{ width: '100%', padding: '12px', background: W, color: COLORS.ink, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, cursor: 'pointer', textTransform: 'lowercase' }}>
            start over
          </button>
        </div>
      ) : (
        <button type="button" onClick={onStart} style={{ width: '100%', padding: '15px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 22, fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, cursor: 'pointer', textTransform: 'lowercase' }}>start game</button>
      )}
    </motion.div>
  )
}

function Done({ score, total, best, newBest, onAgain, onClose, primary }: { score: number; total: number; best: { score: number; total: number } | null; newBest: boolean; onAgain: () => void; onClose: () => void; primary: string }) {
  const pct = total ? Math.round((score / total) * 100) : 0
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <Mascot size={120} mood="happy" />
      {newBest && <Tag bg={COLORS.orange} color={W} border={COLORS.ink}>new best!</Tag>}
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: primary, lineHeight: 1 }}>{score}/{total}</div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink60 }}>{pct}% right{best ? ` · best ${best.score}/${best.total}` : ''}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, marginTop: 8 }}>
        <button type="button" onClick={onAgain} style={{ padding: '14px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase' }}>play again</button>
        <button type="button" onClick={onClose} style={{ padding: '12px', background: W, color: COLORS.ink, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, cursor: 'pointer', textTransform: 'lowercase' }}>back to play</button>
      </div>
    </motion.div>
  )
}
