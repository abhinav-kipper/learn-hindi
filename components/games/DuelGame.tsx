'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Duel, DuelItem } from '@/types/game'
import { drawDuelRound, getDuelBest, recordDuelResult } from '@/lib/games'
import { addMistake } from '@/lib/mistakes'
import { playSound, playCombo } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import {
  Sticker,
  Tag,
  Mascot,
  Confetti,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
  useChaina,
} from '@/components/design'

const W = '#fff' // @design-allow: white literal

const SET_SIZE = 10
const NUM_SETS = 3
const TOTAL = SET_SIZE * NUM_SETS // 30, played as 3 rounds of 10

type Phase = 'intro' | 'playing' | 'checkpoint' | 'done'
type Reaction = 'correct' | 'wrong' | null

function buzz(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* ignore */
  }
}

export function DuelGame({ duel }: { duel: Duel }) {
  const router = useRouter()
  const theme = useTheme()
  const { play } = useChaina()
  const { config } = useLanguage()
  const prefix = config.storagePrefix

  const [phase, setPhase] = useState<Phase>('intro')
  const [items, setItems] = useState<DuelItem[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<'left' | 'right' | null>(null)
  const [reaction, setReaction] = useState<Reaction>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [flash, setFlash] = useState<number | null>(null)
  const [best, setBest] = useState<{ score: number; total: number } | null>(null)
  const [newBest, setNewBest] = useState(false)

  const scoreRef = useRef(0)
  scoreRef.current = score
  const firedMilestones = useRef<Set<number>>(new Set())

  useEffect(() => {
    setBest(getDuelBest(prefix, duel.id))
  }, [prefix, duel.id])

  useEffect(() => {
    if (flash === null) return
    const t = window.setTimeout(() => setFlash(null), 900)
    return () => window.clearTimeout(t)
  }, [flash])

  const total = items.length
  const current = items[index]
  const setNum = Math.floor(index / SET_SIZE) + 1
  const inSet = (index % SET_SIZE) + 1

  function start() {
    setItems(drawDuelRound(duel, TOTAL))
    setIndex(0)
    setScore(0)
    setCombo(0)
    setPicked(null)
    setReaction(null)
    setNewBest(false)
    firedMilestones.current = new Set()
    setPhase('playing')
    playSound('tap')
    buzz(10)
  }

  function pick(side: 'left' | 'right') {
    if (picked || !current) return
    buzz(12) // immediate tap feedback on the card
    const correct = side === current.answer
    setPicked(side)
    setReaction(correct ? 'correct' : 'wrong')

    if (correct) {
      const nextCombo = combo + 1
      setCombo(nextCombo)
      setScore((s) => s + 1)
      if (nextCombo >= 2) playCombo(nextCombo)
      else playSound('correct')
      // Streak milestone: flash + escalating buzz + a Chaina cheer (once each).
      if (nextCombo % 5 === 0 && !firedMilestones.current.has(nextCombo)) {
        firedMilestones.current.add(nextCombo)
        setFlash(nextCombo)
        buzz([15, 40, 15, 40, 15])
        play('streakKept')
      }
    } else {
      setCombo(0)
      playSound('wrong')
      buzz([0, 55])
      const correctLabel = current.answer === 'left' ? duel.left.label : duel.right.label
      addMistake(
        {
          original: current.prompt,
          correction: `${current.prompt} is ${correctLabel.toLowerCase()}`,
          reason: current.explain || '',
        },
        'noun-gender',
        prefix,
        'quiz',
      )
    }
    window.setTimeout(advance, 1150)
  }

  function advance() {
    const next = index + 1
    if (next >= TOTAL) {
      const finalScore = scoreRef.current
      const result = recordDuelResult(prefix, duel.id, finalScore, TOTAL)
      setNewBest(!best || finalScore > best.score)
      setBest(result)
      setPhase('done')
      // Full done celebration.
      playSound('levelup')
      buzz([30, 60, 30, 60, 60])
      play(finalScore / TOTAL >= 0.6 ? 'lessonComplete' : 'correctAnswer')
      return
    }
    setIndex(next)
    setPicked(null)
    setReaction(null)
    if (next % SET_SIZE === 0) {
      setPhase('checkpoint')
      playSound('complete')
      buzz([20, 50, 20])
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DottedBg />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 12, padding: '50px 18px 14px' }}>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          style={{ background: W, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 99, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.ink, flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: 19, color: COLORS.ink, marginRight: 36 }}>
          {duel.title}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 18px 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {phase === 'intro' && <IntroView duel={duel} best={best} onStart={start} primary={theme.primary} />}
        {phase === 'playing' && current && (
          <PlayView duel={duel} item={current} setNum={setNum} inSet={inSet} combo={combo} picked={picked} reaction={reaction} onPick={pick} />
        )}
        {phase === 'checkpoint' && (
          <CheckpointView setNum={Math.floor(index / SET_SIZE)} score={score} answered={index} combo={combo} onContinue={() => setPhase('playing')} primary={theme.primary} />
        )}
        {phase === 'done' && (
          <DoneView score={score} total={TOTAL} best={best} newBest={newBest} onAgain={start} onClose={() => router.back()} primary={theme.primary} />
        )}
      </div>

      {/* streak flash */}
      <AnimatePresence>
        {flash !== null && (
          <motion.div
            key={flash}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.3, y: -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            style={{ position: 'fixed', top: '38%', left: 0, right: 0, textAlign: 'center', zIndex: 60, pointerEvents: 'none' }}
          >
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 40, color: COLORS.orange, textShadow: `2px 2px 0 ${COLORS.ink}` }}>
              🔥 {flash} streak!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'done' && score / Math.max(TOTAL, 1) >= 0.6 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          <Confetti active />
        </div>
      )}
    </div>
  )
}

function IntroView({ duel, best, onStart, primary }: { duel: Duel; best: { score: number; total: number } | null; onStart: () => void; primary: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60 }}>{duel.subtitle}</div>
      {duel.tip && (
        <Sticker color={COLORS.butter} radius={18} padding={14}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>💡</span>
            <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.45 }}>{duel.tip}</span>
          </div>
        </Sticker>
      )}
      <RuleCard side={duel.left} color={COLORS.peach2} accent={COLORS.orange} />
      <RuleCard side={duel.right} color={COLORS.lav2} accent={COLORS.pink} />
      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink45 }}>
        3 rounds of 10{best ? ` · 🏆 best ${best.score}/${best.total}` : ''}
      </div>
      <div style={{ flex: 1 }} />
      <button type="button" onClick={onStart} style={{ width: '100%', padding: '15px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 22, fontFamily: FONTS.display, fontWeight: 800, fontSize: 17, cursor: 'pointer', textTransform: 'lowercase' }}>
        start game
      </button>
    </motion.div>
  )
}

function RuleCard({ side, color, accent }: { side: Duel['left']; color: string; accent: string }) {
  return (
    <Sticker color={color} radius={18} padding={16}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: accent, marginBottom: 8 }}>{side.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {side.bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: accent, fontWeight: 800, lineHeight: 1.4 }}>•</span>
            <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink, lineHeight: 1.4 }}>{b}</span>
          </div>
        ))}
      </div>
    </Sticker>
  )
}

function PlayView({
  duel,
  item,
  setNum,
  inSet,
  combo,
  picked,
  reaction,
  onPick,
}: {
  duel: Duel
  item: DuelItem
  setNum: number
  inSet: number
  combo: number
  picked: 'left' | 'right' | null
  reaction: Reaction
  onPick: (s: 'left' | 'right') => void
}) {
  const correct = picked ? picked === item.answer : null
  const cardColor = reaction === 'correct' ? COLORS.mint2 : reaction === 'wrong' ? COLORS.redBg : W
  const cardAnim =
    reaction === 'wrong'
      ? { x: [0, -11, 11, -8, 8, -4, 0] }
      : reaction === 'correct'
      ? { scale: [1, 1.07, 0.98, 1] }
      : { x: 0, scale: 1 }

  function btnStyle(side: 'left' | 'right', base: string) {
    let bg = base
    if (picked) {
      if (side === item.answer) bg = COLORS.mint
      else if (side === picked) bg = COLORS.redBg
      else bg = W
    }
    return {
      flex: 1,
      padding: '20px 12px',
      background: bg,
      color: COLORS.ink,
      border: BORDER.sticker,
      boxShadow: picked && side === picked ? SHADOW.stickerPressed : SHADOW.sticker,
      borderRadius: 18,
      fontFamily: FONTS.display,
      fontWeight: 800,
      fontSize: 18,
      cursor: picked ? 'default' : 'pointer',
      transition: 'background 0.18s, box-shadow 0.12s',
    } as const
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
        {/* 10-segment within-set progress */}
        <div style={{ flex: 1, display: 'flex', gap: 3 }}>
          {Array.from({ length: SET_SIZE }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 99, background: i < inSet - (picked ? 0 : 1) ? COLORS.orange : W, border: BORDER.thin }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: combo >= 2 ? COLORS.orange : COLORS.ink45 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          {combo}x
        </div>
      </div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink45, marginTop: 5 }}>
        round {setNum} of {NUM_SETS} · {inSet}/{SET_SIZE}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${setNum}-${inSet}`}
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            style={{ width: '100%' }}
          >
            {/* inner wrapper carries the press reaction (shake / pop) */}
            <motion.div animate={cardAnim} transition={{ duration: reaction === 'wrong' ? 0.4 : 0.3 }}>
              <Sticker color={cardColor} radius={22} padding={28}>
                <div style={{ textAlign: 'center' }}>
                  {item.emoji && <div style={{ fontSize: 44, marginBottom: 6 }}>{item.emoji}</div>}
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 34, color: COLORS.ink, letterSpacing: -0.5 }}>{item.prompt}</div>
                  {picked && item.hint && (
                    <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60, marginTop: 8 }}>{item.hint}</div>
                  )}
                </div>
              </Sticker>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ minHeight: 26, textAlign: 'center', marginBottom: 10 }}>
        {picked && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: correct ? COLORS.green : COLORS.red }}>
            {correct ? 'correct! 🎉' : `it's ${(item.answer === 'left' ? duel.left.label : duel.right.label).toLowerCase()}`}
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => onPick('left')} disabled={!!picked} style={btnStyle('left', COLORS.peach2)}>{duel.left.label}</button>
        <button type="button" onClick={() => onPick('right')} disabled={!!picked} style={btnStyle('right', COLORS.lav2)}>{duel.right.label}</button>
      </div>
    </div>
  )
}

function CheckpointView({ setNum, score, answered, combo, onContinue, primary }: { setNum: number; score: number; answered: number; combo: number; onContinue: () => void; primary: string }) {
  useEffect(() => {
    buzz([20, 50, 20])
  }, [])
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
      <Mascot size={104} mood="happy" />
      <Tag bg={primary} color={W} border={COLORS.ink}>round {setNum} of {NUM_SETS} done</Tag>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, color: COLORS.ink, lineHeight: 1 }}>{score}/{answered} so far</div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60 }}>
        {combo >= 3 ? `on a ${combo} streak, keep it going!` : 'take a breath, then round ' + (setNum + 1)}
      </div>
      <button type="button" onClick={onContinue} style={{ marginTop: 8, padding: '14px 40px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase' }}>
        next round
      </button>
    </motion.div>
  )
}

function DoneView({ score, total, best, newBest, onAgain, onClose, primary }: { score: number; total: number; best: { score: number; total: number } | null; newBest: boolean; onAgain: () => void; onClose: () => void; primary: string }) {
  const pct = total ? Math.round((score / total) * 100) : 0
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <Mascot size={120} mood="happy" />
      {newBest && <Tag bg={COLORS.orange} color={W} border={COLORS.ink}>new best!</Tag>}
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: primary, lineHeight: 1 }}>{score}/{total}</div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 15, color: COLORS.ink60 }}>
        {pct}% right{best ? ` · best ${best.score}/${best.total}` : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300, marginTop: 8 }}>
        <button type="button" onClick={onAgain} style={{ padding: '14px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase' }}>
          play again
        </button>
        <button type="button" onClick={onClose} style={{ padding: '12px', background: W, color: COLORS.ink, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, cursor: 'pointer', textTransform: 'lowercase' }}>
          back to play
        </button>
      </div>
    </motion.div>
  )
}
