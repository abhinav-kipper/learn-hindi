'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  buildSession,
  recordAttempt,
  checkRecall,
  checkArticle,
  buildCloze,
  normalize,
  MASTERY_HITS,
  type ReviewCard,
} from '@/lib/dutch/woorden'
import { playSound, playCombo } from '@/lib/sounds'
import { speak } from '@/lib/speech'

const W = '#fff' // @design-allow: white literal
const GREEN = '#1f8a3a' // @design-allow: semantic pass color
const RED = '#b94a4a' // @design-allow: semantic fail color

export default function WoordenReviewPage() {
  const router = useRouter()
  const theme = useTheme()

  const [cards, setCards] = useState<ReviewCard[] | null>(null)
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState(false)
  const [wasRight, setWasRight] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)

  // Build the sitting once on mount, so answering does not reshuffle it.
  useEffect(() => setCards(buildSession()), [])

  const card = cards?.[i]
  const last = cards ? i >= cards.length - 1 : false
  const cloze = useMemo(
    () => (card && card.kind === 'cloze' ? buildCloze(card.entry) : null),
    [card],
  )

  const commit = (right: boolean) => {
    if (!card) return
    setWasRight(right)
    setChecked(true)
    recordAttempt(card.entry.id, right)
    if (right) {
      setScore((s) => s + 1)
      const next = combo + 1
      setCombo(next)
      if (next >= 2) playCombo(next)
      else playSound('correct')
    } else {
      setCombo(0)
      playSound('wrong')
    }
  }

  const submitTyped = () => {
    if (!card || checked) return
    // A cloze is checked against the chunk it blanked out, which is the same
    // string the recall drill wants, so one comparison serves both.
    commit(checkRecall(card.entry, typed))
  }

  const answerArticle = (a: 'de' | 'het') => {
    if (!card || checked) return
    commit(checkArticle(card.entry, a))
  }

  const next = () => {
    playSound('tap')
    setTyped('')
    setChecked(false)
    setI((n) => n + 1)
    window.scrollTo({ top: 0 })
  }

  // ------------------------------------------------------------- loading
  if (cards === null) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FONTS.body, color: COLORS.ink }}>
          Loading your review…
        </div>
      </div>
    )
  }

  // ------------------------------------------------------- nothing due yet
  if (cards.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 30 }}>
          <Mascot size={96} mood="idle" />
          <h1 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: COLORS.ink, margin: '12px 0 6px' }}>
            Nothing due right now
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, margin: '0 0 18px', lineHeight: 1.55 }}>
            That is the schedule working, not a bug. Chunks come back just as they start to fade, so
            reviewing early would waste the effort. Meet some new ones instead.
          </p>
          <Sticker color={theme.primary} radius={16} padding={14} onClick={() => router.push('/dutch/woorden')}>
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W }}>
              back to Word Lab
            </span>
          </Sticker>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------- done
  if (i >= cards.length) {
    const pct = Math.round((score / cards.length) * 100)
    return (
      <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '24px 16px 120px', position: 'relative', overflow: 'hidden' }}>
        {pct >= 70 && <Confetti active />}
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
          <Mascot size={100} mood={pct >= 70 ? 'happy' : 'idle'} />
          <h1 style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 800, color: COLORS.ink, margin: '12px 0 4px' }}>
            {score} / {cards.length}
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, opacity: 0.75, margin: '0 0 18px', lineHeight: 1.55 }}>
            The ones you got right move further out. The ones you missed come back tomorrow. A chunk
            counts as known after {MASTERY_HITS} successful recalls.
          </p>
          <Sticker color={theme.primary} radius={16} padding={14} onClick={() => router.push('/dutch/woorden')}>
            <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 16, color: W }}>
              done for now
            </span>
          </Sticker>
        </div>
      </div>
    )
  }

  const entry = card!.entry
  const kind = card!.kind

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lav, padding: '20px 16px 130px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* -------------------------------------------------------- header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => router.push('/dutch/woorden')}
            style={{
              background: 'transparent', border: 'none', color: COLORS.ink,
              fontSize: 14, fontFamily: FONTS.body, fontWeight: 700, cursor: 'pointer', padding: 0,
            }}
          >
            ← Leave review
          </button>
          <Tag>{i + 1} / {cards.length}</Tag>
          {combo >= 2 && (
            <span style={{
              marginLeft: 'auto', background: COLORS.butter, border: BORDER.sticker,
              borderRadius: 999, padding: '2px 10px', fontFamily: FONTS.display,
              fontWeight: 800, fontSize: 12, color: COLORS.ink,
            }}>
              🔥 {combo} in a row
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
          {cards.map((_, n) => (
            <div
              key={n}
              style={{
                flex: 1, height: 5, borderRadius: 999, border: BORDER.thin,
                background: n < i ? GREEN : n === i ? theme.primary : COLORS.lav,
              }}
            />
          ))}
        </div>

        {/* ------------------------------------------------- de/het drill */}
        {kind === 'article' && (
          <>
            <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
              }}>
                de or het?
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 28, color: COLORS.ink }}>
                {entry.chunk.replace(/^(de|het)\s+/i, '')}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, opacity: 0.62, marginTop: 4 }}>
                {entry.gloss}
              </div>
            </Sticker>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {(['de', 'het'] as const).map((a) => {
                const isAnswer = entry.article === a
                const bg = !checked ? W : isAnswer ? COLORS.mint2 : COLORS.redBg
                return (
                  <button
                    key={a}
                    onClick={() => answerArticle(a)}
                    disabled={checked}
                    style={{
                      borderRadius: 16, padding: '18px 10px', cursor: checked ? 'default' : 'pointer',
                      border: BORDER.sticker, background: bg, boxShadow: SHADOW.sticker,
                      fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink,
                    }}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ------------------------------------------------------- cloze */}
        {kind === 'cloze' && cloze && (
          <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
            }}>
              Fill the gap
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
              {cloze.sentence}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.6, marginTop: 6 }}>
              {entry.gloss}
            </div>
          </Sticker>
        )}

        {/* ------------------------------------------------------ recall */}
        {(kind === 'recall' || (kind === 'cloze' && !cloze)) && (
          <Sticker color={W} radius={20} padding={16} style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 11.5, color: COLORS.ink,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
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
        )}

        {kind !== 'article' && (
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (checked ? next() : submitTyped())
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
        )}

        {/* ---------------------------------------------------- feedback */}
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
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 20, color: COLORS.ink }}>
              {entry.chunk}
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink, opacity: 0.72, marginTop: 5, lineHeight: 1.5 }}>
              {entry.pattern}
            </div>
            {!wasRight && entry.hook && (
              <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink, opacity: 0.68, marginTop: 6, lineHeight: 1.5 }}>
                💡 {entry.hook}
              </div>
            )}
          </Sticker>
        )}

        {(checked || kind !== 'article') && (
          <button
            onClick={checked ? next : submitTyped}
            disabled={!checked && (kind === 'article' || normalize(typed) === '')}
            style={{
              width: '100%', borderRadius: 16, padding: '14px 16px',
              cursor: !checked && normalize(typed) === '' ? 'default' : 'pointer',
              opacity: !checked && normalize(typed) === '' ? 0.5 : 1,
              border: BORDER.sticker, background: checked ? theme.primary : COLORS.butter,
              boxShadow: SHADOW.sticker, fontFamily: FONTS.display, fontWeight: 800,
              fontSize: 16, color: checked ? W : COLORS.ink,
            }}
          >
            {checked ? (last ? 'see your score →' : 'next →') : 'check'}
          </button>
        )}
      </div>
    </div>
  )
}
