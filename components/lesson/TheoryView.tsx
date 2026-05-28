'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sticker,
  Mascot,
  Tag,
  Confetti,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'
import { playSound } from '@/lib/sounds'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { useLanguage } from '@/lib/language-context'
import type {
  Theory,
  TheorySection,
  TheoryTable,
  TheoryExample,
  TheoryCallout,
  QuickCheck,
} from '@/types/lesson'

const W = '#fff' // @design-allow: white literal

type Props = {
  theory: Theory
  title: string
  onStartPhrases: () => void
  onGoToPractice?: () => void
}

type CuttingMood = 'idle' | 'happy' | 'wave' | 'excited' | 'wink'

const SECTION_MOODS: CuttingMood[] = ['happy', 'idle', 'happy', 'wink', 'happy']

export function TheoryView({ theory, title, onStartPhrases, onGoToPractice }: Props) {
  const { config } = useLanguage()
  const theme = useTheme()
  const ttsLocale = config.ttsLocale
  const totalPages = theory.sections.length + 2 // intro + sections + wrap-up
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [passed, setPassed] = useState<Record<number, boolean>>({})

  // Scroll to the top of the next page on transition — quick-checks sit at the
  // bottom of section pages, so the user would otherwise land mid-page.
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // Big celebration burst when the user reaches the wrap-up page (they passed
  // every quick-check to get here).
  const [wrapBurst, setWrapBurst] = useState(false)
  const isWrapPage = page === totalPages - 1
  useEffect(() => {
    if (isWrapPage) {
      setWrapBurst(true)
      playSound('levelup')
      const t = setTimeout(() => setWrapBurst(false), 3500)
      return () => clearTimeout(t)
    }
  }, [isWrapPage])

  const sectionIdx = page - 1 // section index when page is a section page
  const isIntro = page === 0
  const isWrap = page === totalPages - 1
  const currentSection: TheorySection | null =
    !isIntro && !isWrap ? theory.sections[sectionIdx] : null

  const needsQuickCheck = !!currentSection?.quick_check
  const cleared = needsQuickCheck ? !!passed[page] : true
  const canNext = page < totalPages - 1 && cleared
  const canPrev = page > 0

  const goNext = () => {
    if (!canNext) return
    setDirection(1)
    setPage(page + 1)
    playSound('swipe')
  }
  const goPrev = () => {
    if (!canPrev) return
    setDirection(-1)
    setPage(page - 1)
    playSound('swipe')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.lav,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.lav2} 1px, transparent 0)`,
        backgroundSize: '14px 14px',
        paddingBottom: 120,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top bar: progress dots */}
      <div
        style={{
          padding: '14px 16px 8px',
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const active = i === page
            const past = i < page
            return (
              <motion.div
                key={i}
                animate={{ width: active ? 28 : 14 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  height: 8,
                  borderRadius: 99,
                  background: active ? theme.primary : past ? COLORS.green : W,
                  border: BORDER.thin,
                }}
              />
            )
          })}
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 11,
            color: COLORS.ink60,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {page + 1} / {totalPages}
        </div>
      </div>

      {/* Wrap-up celebration overlay */}
      {wrapBurst && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <Confetti active={true} />
        </div>
      )}

      {/* Page content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {isIntro && <IntroPage title={title} intro={theory.intro} />}
            {currentSection && (
              <SectionPage
                section={currentSection}
                mood={SECTION_MOODS[sectionIdx % SECTION_MOODS.length]}
                quickCheckPassed={!!passed[page]}
                onPassQuickCheck={() => setPassed((p) => ({ ...p, [page]: true }))}
                ttsLocale={ttsLocale}
              />
            )}
            {isWrap && (
              <WrapUpPage
                wrapUp={theory.wrap_up}
                onStartPhrases={() => {
                  playSound('levelup')
                  onStartPhrases()
                }}
                onGoToPractice={
                  onGoToPractice
                    ? () => {
                        playSound('levelup')
                        onGoToPractice()
                      }
                    : undefined
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '12px 16px 24px',
          background: `linear-gradient(180deg, transparent 0%, ${COLORS.lav} 30%)`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            justifyContent: 'space-between',
          }}
        >
          <NavButton
            label="◀ prev"
            disabled={!canPrev}
            onClick={goPrev}
            ariaLabel="Previous page"
          />
          {!isWrap && (
            <NavButton
              label="next ▶"
              disabled={!canNext}
              onClick={goNext}
              ariaLabel="Next page"
              primary
              hint={needsQuickCheck && !cleared ? 'answer the check first' : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function NavButton({
  label,
  disabled,
  onClick,
  ariaLabel,
  primary,
  hint,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  ariaLabel: string
  primary?: boolean
  hint?: string
}) {
  const theme = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {hint && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 10,
            color: COLORS.ink45,
            fontStyle: 'italic',
          }}
        >
          {hint}
        </div>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        style={{
          background: disabled ? COLORS.peach2 : primary ? theme.primary : W,
          color: primary && !disabled ? W : COLORS.ink,
          border: BORDER.sticker,
          boxShadow: disabled ? 'none' : SHADOW.chip,
          borderRadius: 999,
          padding: '10px 22px',
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 14,
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          textTransform: 'lowercase',
          minWidth: 92,
        }}
      >
        {label}
      </button>
    </div>
  )
}

function IntroPage({ title, intro }: { title: string; intro: string }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Tag bg={COLORS.ink} color={COLORS.cream}>📖 chapter</Tag>
      </div>
      <h1
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 32,
          color: COLORS.ink,
          lineHeight: 1.1,
          margin: '0 0 18px',
        }}
      >
        {title}
      </h1>
      <CuttingSpeech
        mood="wave"
        text="Welcome! I'll walk you through this chapter. Swipe or tap next to keep going. I'll quiz you at each step so it sticks. Let's go!"
      />
      <div style={{ marginTop: 18 }}>
        <Paragraph text={intro} emphasis />
      </div>
    </div>
  )
}

function SectionPage({
  section,
  mood,
  quickCheckPassed,
  onPassQuickCheck,
  ttsLocale,
}: {
  section: TheorySection
  mood: CuttingMood
  quickCheckPassed: boolean
  onPassQuickCheck: () => void
  ttsLocale: string
}) {
  const intro =
    section.cutting_intro ?? `Now let's look at: ${section.heading.toLowerCase()}.`
  return (
    <div>
      <CuttingSpeech mood={mood} text={intro} />
      <h2
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 22,
          color: COLORS.ink,
          lineHeight: 1.25,
          margin: '18px 0 10px',
        }}
      >
        {section.heading}
      </h2>
      <Paragraph text={section.body} />
      {section.table && <TableBlock table={section.table} />}
      {section.examples && section.examples.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.examples.map((ex, i) => (
            <ExampleBlock key={i} example={ex} ttsLocale={ttsLocale} />
          ))}
        </div>
      )}
      {section.callout && (
        <div style={{ marginTop: 14 }}>
          <CalloutBlock callout={section.callout} />
        </div>
      )}
      {section.quick_check && (
        <div style={{ marginTop: 18 }}>
          <QuickCheckBlock
            quickCheck={section.quick_check}
            passed={quickCheckPassed}
            onPass={onPassQuickCheck}
          />
        </div>
      )}
    </div>
  )
}

function WrapUpPage({
  wrapUp,
  onStartPhrases,
  onGoToPractice,
}: {
  wrapUp?: string
  onStartPhrases: () => void
  onGoToPractice?: () => void
}) {
  const theme = useTheme()
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        style={{
          textAlign: 'center',
          padding: '8px 0 18px',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 32,
            color: theme.primary,
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          🎉 shabash!
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            color: COLORS.ink60,
          }}
        >
          chapter conquered. every quick-check passed.
        </div>
      </motion.div>
      <CuttingSpeech
        mood="excited"
        text="You made it through the chapter! Pick how you want to practice — drill phrases for vocab, or chat with me for live practice."
      />
      {wrapUp && (
        <div style={{ marginTop: 18 }}>
          <Sticker color={COLORS.cream} radius={18} padding={16}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize: 11,
                color: theme.primary,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              wrap up
            </div>
            <Paragraph text={wrapUp} />
          </Sticker>
        </div>
      )}
      <motion.button
        onClick={onStartPhrases}
        whileTap={{ scale: 0.97 }}
        aria-label="Start phrases"
        style={{
          width: '100%',
          marginTop: 18,
          padding: '18px',
          borderRadius: 22,
          background: theme.primary,
          color: W,
          border: BORDER.sticker,
          boxShadow: SHADOW.sticker,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 17,
          cursor: 'pointer',
          letterSpacing: 0.2,
          textTransform: 'lowercase',
        }}
      >
        try the phrases →
      </motion.button>
      {onGoToPractice && (
        <motion.button
          onClick={onGoToPractice}
          whileTap={{ scale: 0.97 }}
          aria-label="Go to AI practice"
          style={{
            width: '100%',
            marginTop: 10,
            padding: '16px',
            borderRadius: 22,
            background: COLORS.mint2,
            color: COLORS.ink,
            border: BORDER.sticker,
            boxShadow: SHADOW.chip,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            letterSpacing: 0.2,
            textTransform: 'lowercase',
          }}
        >
          or — chat with me to practice 💬
        </motion.button>
      )}
    </div>
  )
}

function CuttingSpeech({ mood, text }: { mood: CuttingMood; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{ flexShrink: 0 }}
      >
        <Mascot size={88} mood={mood} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
        style={{ flex: 1 }}
      >
        <Sticker color={W} radius={16} padding={12}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.ink,
              lineHeight: 1.5,
            }}
          >
            {text}
          </div>
        </Sticker>
      </motion.div>
    </div>
  )
}

function QuickCheckBlock({
  quickCheck,
  passed,
  onPass,
}: {
  quickCheck: QuickCheck
  passed: boolean
  onPass: () => void
}) {
  const theme = useTheme()
  const [wrongPicks, setWrongPicks] = useState<Set<number>>(new Set())
  const [shaking, setShaking] = useState<number | null>(null)

  const handlePick = (i: number) => {
    if (passed) return
    if (wrongPicks.has(i)) return
    if (i === quickCheck.correct_index) {
      playSound('correct')
      onPass()
    } else {
      playSound('wrong')
      setShaking(i)
      setWrongPicks((s) => new Set([...s, i]))
      setTimeout(() => setShaking(null), 400)
    }
  }

  return (
    <Sticker color={COLORS.butter} radius={18} padding={16}>
      {passed && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 18 }}>
          <Confetti active={true} />
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.tag,
          fontSize: 10,
          color: theme.primary,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        ❓ quick check
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 17,
          color: COLORS.ink,
          lineHeight: 1.35,
          marginBottom: 12,
        }}
      >
        {quickCheck.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quickCheck.options.map((opt, i) => {
          const isCorrect = i === quickCheck.correct_index
          const isWrong = wrongPicks.has(i)
          const isWinner = passed && isCorrect
          const baseBg = isWinner ? COLORS.mint : isWrong ? COLORS.peach2 : W
          return (
            <motion.button
              key={i}
              onClick={() => handlePick(i)}
              disabled={passed || isWrong}
              animate={
                shaking === i
                  ? { x: [-6, 6, -4, 4, 0] }
                  : isWinner
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: shaking === i ? 0.4 : 0.5 }}
              style={{
                background: baseBg,
                border: BORDER.sticker,
                boxShadow: passed && !isCorrect ? 'none' : SHADOW.chip,
                borderRadius: 14,
                padding: '12px 14px',
                fontFamily: FONTS.body,
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.ink,
                cursor: passed || isWrong ? 'default' : 'pointer',
                opacity: isWrong && !passed ? 0.55 : 1,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              aria-label={`option ${i + 1}: ${opt}`}
            >
              {isWinner && <span style={{ fontSize: 18 }}>✓</span>}
              {isWrong && <span style={{ fontSize: 18 }}>✗</span>}
              <span style={{ flex: 1 }}>{opt}</span>
            </motion.button>
          )
        })}
      </div>
      {passed && quickCheck.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: COLORS.mint2,
            border: BORDER.thin,
            borderRadius: 12,
            fontFamily: FONTS.body,
            fontSize: 13,
            color: COLORS.ink,
            lineHeight: 1.5,
          }}
        >
          {quickCheck.explanation}
        </motion.div>
      )}
    </Sticker>
  )
}

// Inline markdown subset for theory body text:
//   `token`   → butter-bg Hindi-token chip
//   **bold**  → bold key term
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(
        <span
          key={`${keyPrefix}-c${i}`}
          style={{
            background: COLORS.butter,
            border: BORDER.thin,
            borderRadius: 6,
            padding: '0 5px',
            fontSize: '0.92em',
            fontWeight: 700,
            color: COLORS.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {m[1]}
        </span>,
      )
    } else if (m[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 800, color: COLORS.ink }}>
          {m[2]}
        </strong>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function Paragraph({ text, emphasis = false }: { text: string; emphasis?: boolean }) {
  const lines = text.split('\n')
  const blocks: Array<{ type: 'p' | 'ul'; lines: string[] }> = []
  let para: string[] = []
  let bullets: string[] = []
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', lines: [para.join(' ')] })
      para = []
    }
  }
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'ul', lines: bullets })
      bullets = []
    }
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.trim().length === 0) {
      flushPara()
      flushBullets()
    } else if (/^\s*-\s+/.test(line)) {
      flushPara()
      bullets.push(line.replace(/^\s*-\s+/, ''))
    } else {
      flushBullets()
      para.push(line.trim())
    }
  }
  flushPara()
  flushBullets()

  const pStyle: React.CSSProperties = {
    fontFamily: FONTS.body,
    fontSize: emphasis ? 16 : 15,
    lineHeight: 1.55,
    color: emphasis ? COLORS.ink : COLORS.ink60,
    margin: '0 0 12px',
  }

  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'ul' ? (
          <ul
            key={i}
            style={{
              ...pStyle,
              paddingLeft: 20,
              margin: '0 0 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {b.lines.map((li, j) => (
              <li key={j} style={{ lineHeight: 1.5 }}>
                {renderInline(li, `${i}-${j}`)}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} style={pStyle}>
            {renderInline(b.lines[0], String(i))}
          </p>
        ),
      )}
    </>
  )
}

function TableBlock({ table }: { table: TheoryTable }) {
  return (
    <div style={{ marginTop: 12 }}>
      {table.caption && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 12,
            fontStyle: 'italic',
            color: COLORS.ink45,
            marginBottom: 6,
          }}
        >
          {table.caption}
        </div>
      )}
      <Sticker color={W} radius={14} padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.cream, borderBottom: BORDER.thin }}>
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 11,
                    color: COLORS.ink,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    padding: '8px 10px',
                    textAlign: 'left',
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? W : COLORS.peach2,
                  borderTop: ri === 0 ? 'none' : BORDER.hairline,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 13,
                      color: COLORS.ink60,
                      padding: '8px 10px',
                      verticalAlign: 'top',
                      lineHeight: 1.4,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Sticker>
    </div>
  )
}

function ExampleBlock({ example, ttsLocale }: { example: TheoryExample; ttsLocale: string }) {
  const theme = useTheme()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!speaking) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 300)
    return () => clearInterval(interval)
  }, [speaking])

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    playSound('pop')
    setSpeaking(true)
    speak(example.hindi, ttsLocale, () => setSpeaking(false))
  }

  return (
    <Sticker color={COLORS.butter} radius={14} padding={12}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 17,
            color: COLORS.ink,
            lineHeight: 1.3,
          }}
        >
          {example.hindi}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          aria-label={speaking ? 'Stop' : 'Hear it'}
          style={{
            width: 30,
            height: 30,
            borderRadius: 99,
            background: speaking ? theme.primary : W,
            color: speaking ? W : COLORS.ink,
            border: BORDER.thin,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            {speaking ? (
              <rect x="6" y="6" width="12" height="12" rx="2" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 14,
          color: COLORS.ink60,
          lineHeight: 1.4,
        }}
      >
        {example.english}
      </div>
      {example.breakdown && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontStyle: 'italic',
            fontSize: 12,
            color: COLORS.ink45,
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {example.breakdown}
        </div>
      )}
    </Sticker>
  )
}

function CalloutBlock({ callout }: { callout: TheoryCallout }) {
  const config = {
    tip: { bg: COLORS.mint, emoji: '💡', label: 'tip' },
    note: { bg: COLORS.lav2, emoji: '📝', label: 'note' },
    warning: { bg: COLORS.peach, emoji: '⚠️', label: 'watch out' },
  }[callout.tone]
  return (
    <Sticker color={config.bg} radius={14} padding={12}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{config.emoji}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONTS.tag,
              fontSize: 10,
              color: COLORS.ink,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              lineHeight: 1.5,
              color: COLORS.ink,
            }}
          >
            {callout.body}
          </div>
        </div>
      </div>
    </Sticker>
  )
}
