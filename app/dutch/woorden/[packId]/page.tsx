'use client'

import { use, useState, useEffect } from 'react'
import { useRouter, notFound } from 'next/navigation'
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
} from '@/components/design'
import {
  getPack,
  markMet,
  isMet,
  recordAttempt,
  checkRecall,
  normalize,
  type WordPack,
  type WordEntry,
} from '@/lib/dutch/woorden'
import { playSound } from '@/lib/sounds'
import { speak } from '@/lib/speech'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

export default function WoordenPackPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = use(params)
  const pack = getPack(packId)
  if (!pack) notFound()
  return <PackView pack={pack} />
}

type Phase = 'meet' | 'retrieve' | 'done'

function PackView({ pack }: { pack: WordPack }) {
  const router = useRouter()
  const theme = useTheme()

  const [phase, setPhase] = useState<Phase>('meet')
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState(false)
  const [wasRight, setWasRight] = useState(false)
  const [score, setScore] = useState(0)
  const [seen, setSeen] = useState(false)

  useEffect(() => setSeen(true), [])

  const entry = pack.entries[i]
  const last = i >= pack.entries.length - 1

  // ----------------------------------------------------------- meet phase
  const nextMeet = () => {
    playSound('tap')
    markMet([entry.id])
    if (last) {
      setPhase('retrieve')
      setI(0)
    } else {
      setI((n) => n + 1)
    }
    window.scrollTo({ top: 0 })
  }

  // ------------------------------------------------------- retrieve phase
  const submit = () => {
    if (checked) return
    const right = checkRecall(entry, typed)
    setWasRight(right)
    setChecked(true)
    recordAttempt(entry.id, right)
    if (right) setScore((s) => s + 1)
    playSound(right ? 'correct' : 'wrong')
  }

  const nextRetrieve = () => {
    playSound('tap')
    setTyped('')
    setChecked(false)
    if (last) setPhase('done')
    else setI((n) => n + 1)
    window.scrollTo({ top: 0 })
  }

  const pct = Math.round((score / pack.entries.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '20px 16px 130px', position: 'relative', overflow: 'hidden' }}>
      {phase === 'done' && pct >= 70 && <Confetti active />}
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* -------------------------------------------------------- header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => router.push('/dutch/woorden')}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', padding: 0,
            }}
          >
            ← Word Lab
          </button>
          <Tag>{pack.stage}</Tag>
        </div>

        {phase !== 'done' && (
          <>
            <h1 style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' }}>
              {pack.emoji} {pack.title}
            </h1>
            <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.65, marginBottom: 10 }}>
              {phase === 'meet' ? 'Meet the chunks' : 'Now from memory'} · {i + 1} of {pack.entries.length}
            </div>
            {/* segmented progress */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
              {pack.entries.map((_, n) => (
                <div
                  key={n}
                  style={{
                    flex: 1, height: 5, borderRadius: 999, border: BORDER.thin,
                    background: n <= i ? (phase === 'retrieve' ? GREEN : theme.primary) : COLORS.lav,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ---------------------------------------------------- meet a chunk */}
        {phase === 'meet' && seen && (
          <>
            <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 26, color: COLORS.ink, lineHeight: 1.2 }}>
                    {entry.chunk}
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.6, marginTop: 3 }}>
                    {entry.pron}
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 15.5, color: COLORS.ink, marginTop: 8 }}>
                    {entry.gloss}
                  </div>
                </div>
                <button
                  onClick={() => { playSound('tap'); speak(entry.chunk, 'nl') }}
                  aria-label={`Hear ${entry.chunk}`}
                  style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
                    border: BORDER.sticker, background: COLORS.butter, fontSize: 17,
                  }}
                >
                  🔊
                </button>
              </div>
              {entry.article && (
                <div style={{ marginTop: 10, display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{
                    background: entry.article === 'de' ? COLORS.mint2 : COLORS.peach2,
                    border: BORDER.sticker, borderRadius: 999, padding: '2px 11px',
                    fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, color: COLORS.ink,
                  }}>
                    {entry.article}-word
                  </span>
                  <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.ink, opacity: 0.6 }}>
                    learn the article with the noun, always
                  </span>
                </div>
              )}
            </Sticker>

            {/* The pattern, named explicitly. This is the bit the research says matters. */}
            <Sticker color={COLORS.mint2} radius={16} padding={13} style={{ marginBottom: 10 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5,
              }}>
                The pattern
              </div>
              <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
                {entry.pattern}
              </p>
            </Sticker>

            <Sticker color={W} radius={16} padding={13} style={{ marginBottom: 10 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7,
              }}>
                In use
              </div>
              {entry.examples.map((ex) => (
                <div key={ex.nl} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'baseline' }}>
                    <button
                      onClick={() => { playSound('tap'); speak(ex.nl, 'nl') }}
                      aria-label={`Hear ${ex.nl}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}
                    >
                      🔊
                    </button>
                    <span style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{ex.nl}</span>
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.62, marginLeft: 19 }}>
                    {ex.en}
                  </div>
                </div>
              ))}
            </Sticker>

            {entry.hook && (
              <Sticker color={COLORS.butter} radius={14} padding={12} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
                  💡 {entry.hook}
                </div>
              </Sticker>
            )}

            {entry.origin && (
              <Sticker color={COLORS.cream} radius={14} padding={12} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
                  📜 {entry.origin}
                </div>
              </Sticker>
            )}

            {entry.family && entry.family.length > 0 && (
              <Sticker color={W} radius={14} padding={12} style={{ marginBottom: 10 }}>
                <div style={{
                  fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                }}>
                  Comes with
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {entry.family.map((f) => (
                    <button
                      key={f}
                      onClick={() => { playSound('tap'); speak(f, 'nl') }}
                      style={{
                        border: BORDER.thin, borderRadius: 999, background: COLORS.lav,
                        padding: '3px 10px', fontFamily: FONTS.body, fontSize: 12.5,
                        fontWeight: 700, color: COLORS.ink, cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </Sticker>
            )}

            {entry.pitfall && (
              <Sticker color={COLORS.redBg} radius={14} padding={12} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>
                  ⚠️ {entry.pitfall}
                </div>
              </Sticker>
            )}

            <button
              onClick={nextMeet}
              style={{
                width: '100%', borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                border: BORDER.sticker, background: theme.primary, boxShadow: SHADOW.sticker,
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W,
              }}
            >
              {last ? 'now test me →' : 'got it →'}
            </button>
          </>
        )}

        {/* ------------------------------------------------- retrieve a chunk */}
        {phase === 'retrieve' && seen && (
          <>
            <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 12 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7,
              }}>
                Type it in Dutch
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 19, fontWeight: 700, color: COLORS.ink, lineHeight: 1.3 }}>
                {entry.gloss}
              </div>
              {entry.pos === 'noun' && (
                <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.62, marginTop: 6 }}>
                  Include the article.
                </div>
              )}
            </Sticker>

            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (checked ? nextRetrieve() : submit())
              }}
              disabled={checked}
              autoFocus
              placeholder="..."
              aria-label="Your answer in Dutch"
              style={{
                width: '100%', borderRadius: 14, padding: '13px 14px', marginBottom: 12,
                border: BORDER.sticker, background: checked ? (wasRight ? COLORS.mint2 : COLORS.redBg) : W,
                fontFamily: FONTS.body, fontSize: 17, fontWeight: 700, color: COLORS.ink,
                boxShadow: SHADOW.sticker, outline: 'none',
              }}
            />

            {checked && (
              <Sticker color={wasRight ? COLORS.mint2 : COLORS.peach2} radius={16} padding={13} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: wasRight ? GREEN : RED }}>
                    {wasRight ? '✓ Correct' : '✗ Not quite'}
                  </span>
                  <button
                    onClick={() => { playSound('tap'); speak(entry.chunk, 'nl') }}
                    aria-label={`Hear ${entry.chunk}`}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
                  >
                    🔊
                  </button>
                </div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 19, color: COLORS.ink }}>
                  {entry.chunk}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.72, marginTop: 5, lineHeight: 1.5 }}>
                  {entry.pattern}
                </div>
              </Sticker>
            )}

            <button
              onClick={checked ? nextRetrieve : submit}
              disabled={!checked && normalize(typed) === ''}
              style={{
                width: '100%', borderRadius: 16, padding: '14px 16px',
                cursor: !checked && normalize(typed) === '' ? 'default' : 'pointer',
                opacity: !checked && normalize(typed) === '' ? 0.5 : 1,
                border: BORDER.sticker, background: checked ? theme.primary : COLORS.butter,
                boxShadow: SHADOW.sticker, fontFamily: FONTS.display, fontWeight: 800,
                fontSize: 16, color: checked ? W : COLORS.ink,
              }}
            >
              {checked ? (last ? 'see how you did →' : 'next →') : 'check'}
            </button>
          </>
        )}

        {/* ------------------------------------------------------------ done */}
        {phase === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <Mascot size={96} mood={pct >= 70 ? 'happy' : 'idle'} />
            <h2 style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: COLORS.ink, margin: '12px 0 4px' }}>
              {score} / {pack.entries.length}
            </h2>
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, margin: '0 0 18px', lineHeight: 1.55 }}>
              These are all in your review queue now. They will come back tomorrow, then at wider and
              wider gaps, until you have recalled each one eight times.
            </p>
            <Sticker
              color={theme.primary}
              radius={16}
              padding={14}
              onClick={() => { playSound('pop'); router.push('/dutch/woorden') }}
              style={{ marginBottom: 10 }}
            >
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W }}>
                back to Word Lab
              </span>
            </Sticker>
            <Sticker
              color={W}
              radius={16}
              padding={14}
              onClick={() => { playSound('pop'); router.push('/dutch/woorden/review') }}
            >
              <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                or review what is due
              </span>
            </Sticker>
          </div>
        )}
      </div>
    </div>
  )
}
