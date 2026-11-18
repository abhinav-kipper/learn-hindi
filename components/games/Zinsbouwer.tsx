'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SPRINT_SECONDS,
  getConcepts,
  getConcept,
  itemsFor,
  tokens,
  checkBuild,
  displaySentence,
  drawQueue,
  explainMiss,
  recordResult,
  getStats,
  conceptAccuracy,
  getWeakConcepts,
  totalAnswered,
  getSprintBests,
  recordSprint,
  type Build,
  type Level,
  type SentenceEntry,
  type SprintBests,
} from '@/lib/dutch/zinsbouwer'
import { addMistake } from '@/lib/mistakes'
import { playSound, playCombo } from '@/lib/sounds'
import { speak } from '@/lib/speech'
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

type Phase = 'intro' | 'playing' | 'done'
type Mode = 'practice' | 'sprint'
type LevelChoice = Level | 'mixed'
type Status = 'correct' | 'wrong' | null

const QUEUE_CHUNK = 12

function buzz(p: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(p)
  } catch {
    /* ignore */
  }
}

export function Zinsbouwer() {
  const router = useRouter()
  const theme = useTheme()
  const { play } = useChaina()
  const { config } = useLanguage()
  const prefix = config.storagePrefix

  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('practice')
  const [level, setLevel] = useState<LevelChoice>('A2')
  const [focus, setFocus] = useState<string | null>(null)

  const [queue, setQueue] = useState<Build[]>([])
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [status, setStatus] = useState<Status>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(SPRINT_SECONDS)
  const [bests, setBests] = useState<SprintBests>({})
  const [newBest, setNewBest] = useState(false)

  useEffect(() => {
    setBests(getSprintBests())
  }, [])

  const drawLevel = level === 'mixed' ? null : level
  const poolSize = useMemo(() => itemsFor(drawLevel, focus).length, [drawLevel, focus])

  const current = queue[index]

  const finish = useCallback(
    (finalScore: number) => {
      setPhase('done')
      if (mode === 'sprint') {
        const prev = getSprintBests()[level] ?? -1
        const updated = recordSprint(level, finalScore)
        setBests(updated)
        setNewBest(finalScore > prev)
      }
      playSound('levelup')
      buzz([30, 60, 30])
      play(finalScore >= 8 ? 'lessonComplete' : 'correctAnswer')
    },
    [level, mode, play],
  )

  // Sprint clock. Practice has no timer at all.
  const scoreRef = useRef(0)
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    if (phase !== 'playing' || mode !== 'sprint') return
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t)
          finish(scoreRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [phase, mode, finish])

  function start() {
    const q = drawQueue({ level: drawLevel, concept: focus, count: QUEUE_CHUNK })
    if (q.length === 0) return
    setQueue(q)
    setIndex(0)
    setPlaced([])
    setStatus(null)
    setScore(0)
    setAnswered(0)
    setStreak(0)
    setBestStreak(0)
    setNewBest(false)
    setSecondsLeft(SPRINT_SECONDS)
    setPhase('playing')
    playSound('tap')
  }

  const tileById = (id: number) => current?.tiles.find((t) => t.id === id)
  const builtWords = placed.map((id) => tileById(id)?.w ?? '')

  function place(id: number) {
    if (status || !current) return
    setPlaced((p) => [...p, id])
    buzz(8)
    playSound('tap')
  }

  function unplace(id: number) {
    if (status) return
    setPlaced((p) => p.filter((x) => x !== id))
    buzz(6)
  }

  function check() {
    if (!current || status || placed.length === 0) return
    const ok = checkBuild(current.item, builtWords)
    recordResult(current.item.concept, ok)
    setAnswered((a) => a + 1)
    if (ok) {
      setStatus('correct')
      const next = streak + 1
      setStreak(next)
      setBestStreak((b) => Math.max(b, next))
      setScore((s) => s + 1)
      if (next >= 2) playCombo(next)
      else playSound('correct')
      buzz([12, 30, 12])
      speak(builtWords.join(' '), 'nl')
      if (mode === 'sprint') window.setTimeout(advance, 900)
    } else {
      setStatus('wrong')
      setStreak(0)
      playSound('wrong')
      buzz([0, 60])
      addMistake(
        {
          original: current.item.en,
          correction: displaySentence(current.item),
          reason: current.item.why,
        },
        'dutch-word-order',
        prefix,
        'quiz',
      )
      // Longer than the correct-answer pause: there is a correction to read.
      if (mode === 'sprint') window.setTimeout(advance, 2600)
    }
  }

  function advance() {
    setPlaced([])
    setStatus(null)
    setIndex((i) => {
      const next = i + 1
      if (next >= queue.length) {
        // Endless: top the queue up rather than ending the run.
        const more = drawQueue({ level: drawLevel, concept: focus, count: QUEUE_CHUNK })
        if (more.length > 0) {
          setQueue((q) => [...q, ...more])
          return next
        }
        return 0
      }
      return next
    })
  }

  const tray = current ? current.tiles.filter((t) => !placed.includes(t.id)) : []

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DottedBg />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '50px 18px 12px',
        }}
      >
        <button
          type="button"
          onClick={() => (phase === 'playing' ? finish(score) : router.back())}
          aria-label={phase === 'playing' ? 'Finish' : 'Close'}
          style={{
            background: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.chip,
            borderRadius: 99,
            width: 36,
            height: 36,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: COLORS.ink,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.ink, lineHeight: 1.1 }}>
            Sentence Builder
          </div>
          <div style={{ fontFamily: FONTS.body, fontStyle: 'italic', fontWeight: 700, fontSize: 12, color: COLORS.ink45 }}>
            Zinsbouwer
          </div>
        </div>
        {phase === 'playing' && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <StatChip label="score" value={`${score}`} />
            <StatChip label="streak" value={`${streak}`} hot={streak >= 3} primary={theme.primary} />
            {mode === 'sprint' && (
              <StatChip label="left" value={`${secondsLeft}s`} hot={secondsLeft <= 15} primary={COLORS.red} />
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 18px 24px',
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {phase === 'intro' && (
          <Intro
            mode={mode}
            setMode={setMode}
            level={level}
            setLevel={setLevel}
            focus={focus}
            setFocus={setFocus}
            poolSize={poolSize}
            bests={bests}
            primary={theme.primary}
            onStart={start}
          />
        )}
        {phase === 'playing' && current && (
          <Play
            build={current}
            placed={placed}
            tray={tray}
            status={status}
            built={builtWords}
            mode={mode}
            tileById={tileById}
            onPlace={place}
            onUnplace={unplace}
            onCheck={check}
            onNext={advance}
            primary={theme.primary}
          />
        )}
        {phase === 'done' && (
          <Done
            mode={mode}
            level={level}
            score={score}
            answered={answered}
            bestStreak={bestStreak}
            bests={bests}
            newBest={newBest}
            primary={theme.primary}
            onAgain={start}
            onChange={() => setPhase('intro')}
            onClose={() => router.back()}
          />
        )}
      </div>

      {phase === 'done' && score >= 8 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          <Confetti active />
        </div>
      )}
    </div>
  )
}

function StatChip({ label, value, hot, primary }: { label: string; value: string; hot?: boolean; primary?: string }) {
  return (
    <div
      style={{
        background: hot && primary ? primary : W,
        border: BORDER.sticker,
        boxShadow: SHADOW.chip,
        borderRadius: 13,
        padding: '4px 9px',
        textAlign: 'center',
        minWidth: 46,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.tag,
          fontSize: 7.5,
          color: hot && primary ? W : COLORS.ink45,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: hot && primary ? W : COLORS.ink, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  children,
  primary,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  primary: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? primary : W,
        color: active ? W : COLORS.ink,
        border: BORDER.sticker,
        boxShadow: active ? SHADOW.chip : 'none',
        borderRadius: 99,
        padding: '7px 13px',
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function Intro({
  mode,
  setMode,
  level,
  setLevel,
  focus,
  setFocus,
  poolSize,
  bests,
  primary,
  onStart,
}: {
  mode: Mode
  setMode: (m: Mode) => void
  level: LevelChoice
  setLevel: (l: LevelChoice) => void
  focus: string | null
  setFocus: (c: string | null) => void
  poolSize: number
  bests: SprintBests
  primary: string
  onStart: () => void
}) {
  const [openFocus, setOpenFocus] = useState(false)
  const concepts = getConcepts()
  const stats = getStats()
  const weak = getWeakConcepts(stats)
  const done = totalAnswered(stats)
  const best = bests[level]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <Sticker color={COLORS.butter} radius={18} padding={14}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>🧱</span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.45 }}>
            Word order is the thing that gives you away in Dutch, and every paper marks it. Tap the words into
            place, and after each one you get the rule it was testing.
          </span>
        </div>
      </Sticker>

      <Row label="level">
        {(['A1', 'A2', 'B1', 'mixed'] as LevelChoice[]).map((l) => (
          <Pill key={l} active={level === l} onClick={() => setLevel(l)} primary={primary}>
            {l === 'mixed' ? 'mix' : l}
          </Pill>
        ))}
      </Row>

      <Row label="how">
        <Pill active={mode === 'practice'} onClick={() => setMode('practice')} primary={primary}>
          practice
        </Pill>
        <Pill active={mode === 'sprint'} onClick={() => setMode('sprint')} primary={primary}>
          ⚡ {SPRINT_SECONDS}s sprint
        </Pill>
      </Row>

      <Sticker color={W} radius={18} padding={14}>
        <button
          type="button"
          onClick={() => setOpenFocus((o) => !o)}
          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink }}>
              {focus ? concepts[focus]?.label : 'all concepts'}
            </div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink45, marginTop: 1 }}>
              {focus ? 'tap to change or clear' : 'or drill one thing at a time'}
            </div>
          </div>
          <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink45 }}>
            {openFocus ? 'hide' : 'pick'}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openFocus && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 12 }}>
                <Pill active={focus === null} onClick={() => setFocus(null)} primary={primary}>
                  everything
                </Pill>
                {Object.entries(concepts).map(([key, c]) => {
                  const acc = conceptAccuracy(key, stats)
                  const isWeak = weak.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFocus(key)}
                      style={{
                        background: focus === key ? primary : isWeak ? COLORS.redBg : W,
                        color: focus === key ? W : COLORS.ink,
                        border: BORDER.sticker,
                        boxShadow: focus === key ? SHADOW.chip : 'none',
                        borderRadius: 99,
                        padding: '7px 12px',
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 12.5,
                        cursor: 'pointer',
                      }}
                    >
                      {c.label}
                      {acc !== null && (
                        <span style={{ opacity: 0.75, marginLeft: 5, fontSize: 11 }}>{Math.round(acc * 100)}%</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sticker>

      {weak.length > 0 && !focus && (
        <Sticker color={COLORS.redBg} radius={16} padding={12}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.45 }}>
            You keep slipping on <strong>{weak.slice(0, 3).map((k) => getConcept(k)?.label).join(', ')}</strong>. These
            come up more often until they stick.
          </div>
        </Sticker>
      )}

      <div style={{ textAlign: 'center', fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink45 }}>
        {poolSize} sentences in this set
        {done > 0 ? ` · ${done} built so far` : ''}
        {mode === 'sprint' && best !== undefined ? ` · 🏆 best ${best}` : ''}
      </div>

      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={onStart}
        disabled={poolSize === 0}
        style={{
          width: '100%',
          padding: '15px',
          background: poolSize === 0 ? COLORS.ink45 : primary,
          color: W,
          border: BORDER.sticker,
          boxShadow: SHADOW.sticker,
          borderRadius: 22,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 17,
          cursor: poolSize === 0 ? 'default' : 'pointer',
          textTransform: 'lowercase',
        }}
      >
        {mode === 'sprint' ? 'start the sprint' : 'start building'}
      </button>
    </motion.div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          fontFamily: FONTS.tag,
          fontSize: 8.5,
          color: COLORS.ink45,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          width: 34,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

/** Renders the `token` backticks the diagnosis uses as Chai Galli word chips. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <span
            key={i}
            style={{
              background: COLORS.butter,
              border: BORDER.thin,
              borderRadius: 7,
              padding: '1px 5px',
              fontFamily: FONTS.display,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function Tile({ word, onClick, tone }: { word: string; onClick?: () => void; tone: 'tray' | 'placed' | 'correct' | 'wrong' }) {
  const bg =
    tone === 'correct' ? COLORS.mint : tone === 'wrong' ? COLORS.redBg : tone === 'placed' ? COLORS.peach2 : W
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{
        background: bg,
        border: BORDER.sticker,
        boxShadow: SHADOW.chip,
        borderRadius: 13,
        padding: '9px 13px',
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 17,
        color: COLORS.ink,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {word}
    </button>
  )
}

function Play({
  build,
  placed,
  tray,
  status,
  built,
  mode,
  tileById,
  onPlace,
  onUnplace,
  onCheck,
  onNext,
  primary,
}: {
  build: Build
  placed: number[]
  tray: { id: number; w: string }[]
  status: Status
  built: string[]
  mode: Mode
  tileById: (id: number) => { id: number; w: string } | undefined
  onPlace: (id: number) => void
  onUnplace: (id: number) => void
  onCheck: () => void
  onNext: () => void
  primary: string
}) {
  const item: SentenceEntry = build.item
  const concept = getConcept(item.concept)
  const expected = tokens(item.nl).length
  // Why *their* sentence is wrong, not just what the right one was.
  const miss = status === 'wrong' ? explainMiss(item, built) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div
        style={{
          fontFamily: FONTS.tag,
          fontSize: 9,
          color: COLORS.ink45,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 6,
        }}
      >
        build this sentence
      </div>

      <Sticker color={W} radius={18} padding={14}>
        <div id="zins-prompt" style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 18, color: COLORS.ink, lineHeight: 1.3, fontStyle: 'italic' }}>
          {item.en}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <Tag bg={COLORS.peach2} color={COLORS.ink} border={COLORS.ink}>
            {concept?.label ?? item.concept}
          </Tag>
          <Tag bg={COLORS.mint2} color={COLORS.ink} border={COLORS.ink}>
            {item.level}
          </Tag>
        </div>
      </Sticker>

      {/* answer zone */}
      <motion.div animate={status === 'wrong' ? { x: [0, -10, 10, -7, 7, 0] } : {}} transition={{ duration: 0.4 }} style={{ marginTop: 14 }}>
        <div
          style={{
            minHeight: 62,
            border: BORDER.stickerDashed,
            borderRadius: 16,
            background: status === 'correct' ? COLORS.mint2 : status === 'wrong' ? COLORS.redBg : W,
            padding: 12,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: placed.length ? 'flex-start' : 'center',
            transition: 'background 0.2s',
          }}
        >
          {placed.length === 0 ? (
            <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink45 }}>
              tap the words below in order
            </span>
          ) : (
            placed.map((id) => {
              const t = tileById(id)
              if (!t) return null
              return (
                <Tile
                  key={id}
                  word={t.w}
                  tone={status ? (status === 'correct' ? 'correct' : 'wrong') : 'placed'}
                  onClick={status ? undefined : () => onUnplace(id)}
                />
              )
            })
          )}
        </div>
      </motion.div>

      {!status && (
        <div style={{ textAlign: 'center', marginTop: 7, fontFamily: FONTS.body, fontWeight: 700, fontSize: 11.5, color: COLORS.ink45 }}>
          {placed.length}/{expected} words placed
          {build.decoys > 0 ? ` · ${build.decoys} word${build.decoys > 1 ? 's' : ''} in the tray you will not need` : ''}
        </div>
      )}

      {/* feedback */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 12 }}>
            <Sticker color={status === 'correct' ? COLORS.mint2 : COLORS.butter} radius={16} padding={13}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink, marginBottom: 5 }}>
                {status === 'correct' ? 'Goed zo!' : 'Not quite'}
              </div>

              {status === 'wrong' && miss && (
                <>
                  {/* What they built, so the correction has something to point at. */}
                  <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink45 }}>
                    you built
                  </div>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.red, lineHeight: 1.35, marginBottom: 8 }}>
                    {displaySentence(item, miss.yours)}
                  </div>
                  {/* The bit that was missing: what is actually wrong with it. */}
                  <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.45, marginBottom: 9 }}>
                    <Marked text={miss.headline} />
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink45 }}>
                    the right order
                  </div>
                </>
              )}

              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: COLORS.green, lineHeight: 1.35 }}>
                {status === 'correct' ? displaySentence(item, built.join(' ')) : displaySentence(item)}
              </div>
              {mode === 'practice' && (
                <>
                  <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink, lineHeight: 1.45, marginTop: 8 }}>
                    {item.why}
                  </div>
                  {concept && (
                    <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink60, lineHeight: 1.45, marginTop: 7, paddingTop: 7, borderTop: BORDER.hairline }}>
                      <strong>{concept.label}</strong> <span style={{ fontStyle: 'italic' }}>({concept.nl})</span>
                      {': '}
                      {concept.rule}
                    </div>
                  )}
                  {(item.accept?.length ?? 0) > 0 && (
                    <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink60, marginTop: 7 }}>
                      Also correct: {item.accept!.map((a) => displaySentence(item, a)).join(' / ')}
                    </div>
                  )}
                </>
              )}
            </Sticker>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, minHeight: 12 }} />

      {/* tile tray */}
      {!status && (
        <div id="zins-tray" style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', minHeight: 50, marginBottom: 12 }}>
          <AnimatePresence>
            {tray.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              >
                <Tile word={t.w} tone="tray" onClick={() => onPlace(t.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {status && mode === 'practice' ? (
        <button
          type="button"
          onClick={onNext}
          style={{
            width: '100%',
            padding: '15px',
            background: primary,
            color: W,
            border: BORDER.sticker,
            boxShadow: SHADOW.sticker,
            borderRadius: 22,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 17,
            cursor: 'pointer',
            textTransform: 'lowercase',
          }}
        >
          next sentence
        </button>
      ) : (
        !status && (
          <button
            type="button"
            onClick={onCheck}
            disabled={placed.length === 0}
            style={{
              width: '100%',
              padding: '15px',
              background: placed.length === 0 ? COLORS.lav2 : primary,
              color: placed.length === 0 ? COLORS.ink45 : W,
              border: BORDER.sticker,
              boxShadow: placed.length === 0 ? 'none' : SHADOW.sticker,
              borderRadius: 22,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 17,
              cursor: placed.length === 0 ? 'default' : 'pointer',
              textTransform: 'lowercase',
            }}
          >
            ✓ check
          </button>
        )
      )}
    </div>
  )
}

function Done({
  mode,
  level,
  score,
  answered,
  bestStreak,
  bests,
  newBest,
  primary,
  onAgain,
  onChange,
  onClose,
}: {
  mode: Mode
  level: LevelChoice
  score: number
  answered: number
  bestStreak: number
  bests: SprintBests
  newBest: boolean
  primary: string
  onAgain: () => void
  onChange: () => void
  onClose: () => void
}) {
  const pct = answered ? Math.round((score / answered) * 100) : 0
  const weak = getWeakConcepts()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}
    >
      <Mascot size={112} mood="happy" />
      {newBest && (
        <Tag bg={primary} color={W} border={COLORS.ink}>
          new best!
        </Tag>
      )}
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, color: primary, lineHeight: 1 }}>
        {score}
        <span style={{ fontSize: 24, color: COLORS.ink45 }}>/{answered}</span>
      </div>
      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink60 }}>
        {answered === 0 ? 'nothing built yet' : `${pct}% right · best run ${bestStreak} in a row`}
        {mode === 'sprint' && bests[level] !== undefined ? ` · 🏆 ${bests[level]}` : ''}
      </div>

      {weak.length > 0 && (
        <Sticker color={COLORS.butter} radius={16} padding={13}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.45 }}>
            Worth another look: <strong>{weak.slice(0, 3).map((k) => getConcept(k)?.label).join(', ')}</strong>. Pick one
            under <em>all concepts</em> to drill it on its own.
          </div>
        </Sticker>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%', maxWidth: 300, marginTop: 6 }}>
        <button
          type="button"
          onClick={onAgain}
          style={{ padding: '14px', background: primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.sticker, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, cursor: 'pointer', textTransform: 'lowercase' }}
        >
          go again
        </button>
        <button
          type="button"
          onClick={onChange}
          style={{ padding: '12px', background: W, color: COLORS.ink, border: BORDER.sticker, boxShadow: SHADOW.chip, borderRadius: 20, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, cursor: 'pointer', textTransform: 'lowercase' }}
        >
          change level or focus
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ padding: '10px', background: 'none', color: COLORS.ink45, border: 'none', fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, cursor: 'pointer', textTransform: 'lowercase' }}
        >
          back to play
        </button>
      </div>
    </motion.div>
  )
}
