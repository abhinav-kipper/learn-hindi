'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import { getLookups, addLookup, Lookup } from '@/lib/dutch/lookups'
import {
  Sticker,
  Tag,
  Mascot,
  DottedBg,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'

const W = '#fff' // @design-allow: white literal

interface Definition {
  found: boolean
  word: string
  article: string
  partOfSpeech: string
  translation: string
  meaning: string
  example: string
  example_en: string
}

type Status = 'idle' | 'loading' | 'ok' | 'notfound' | 'offline' | 'error'

export default function DutchLookupPage() {
  const router = useRouter()
  const theme = useTheme()

  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<Definition | null>(null)
  const [recent, setRecent] = useState<Lookup[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [showExampleEn, setShowExampleEn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecent(getLookups('dutch'))
    inputRef.current?.focus()
  }, [])

  // Poll the shared speech engine so the speaker button reflects real state.
  useEffect(() => {
    if (!speaking) return
    const t = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 300)
    return () => clearInterval(t)
  }, [speaking])

  const sayWord = useCallback((w: string) => {
    if (!w) return
    stopSpeaking()
    speak(w, 'nl', () => setSpeaking(false))
    setSpeaking(true)
  }, [])

  const lookup = useCallback(
    async (raw: string) => {
      const word = raw.trim()
      if (!word) return
      playSound('tap')
      setInput(word)
      setStatus('loading')
      setResult(null)
      setShowExampleEn(false)
      stopSpeaking()
      setSpeaking(false)

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setStatus('offline')
        return
      }

      try {
        const res = await fetch('/api/define', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, language: 'dutch' }),
        })
        if (!res.ok) {
          setStatus(res.status === 503 || res.status === 429 ? 'offline' : 'error')
          return
        }
        const data = (await res.json()) as Definition
        if (!data || !data.found) {
          setResult(data ?? null)
          setStatus('notfound')
          return
        }
        setResult(data)
        setStatus('ok')
        setRecent(addLookup(
          { word: data.word, translation: data.translation, article: data.article, ts: new Date().toISOString() },
          'dutch',
        ))
        // Best-effort auto-speak (the button covers autoplay blocks).
        sayWord(data.word)
        playSound('pop')
      } catch {
        setStatus('error')
      }
    },
    [sayWord],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    lookup(input)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 110 }}>
      <DottedBg />

      {/* HEADER */}
      <div
        style={{
          position: 'relative',
          padding: '50px 20px 22px',
          background: `linear-gradient(160deg, ${theme.bandFrom}, ${theme.bandTo})`,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          borderBottom: BORDER.sticker,
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => { playSound('tap'); router.back() }}
              aria-label="Go back"
              style={{ width: 40, height: 40, borderRadius: 99, background: W, border: BORDER.sticker, boxShadow: SHADOW.chip, cursor: 'pointer', fontSize: 18, color: COLORS.ink }}
            >
              ‹
            </button>
            <div style={{ transform: 'scale(0.72)', transformOrigin: 'top right' }}>
              <Mascot size={72} mood="idle" />
            </div>
          </div>
          <div style={{ marginTop: 2 }}>
            <Tag>✦ word lookup</Tag>
            <h1 style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 28, color: COLORS.ink, letterSpacing: -0.6, marginTop: 8 }}>
              Type a word, hear it
            </h1>
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink60, marginTop: 2 }}>
              a Dutch word goes in, its sound and English meaning come out
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px 8px', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* SEARCH */}
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. gezellig"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              flex: 1, minWidth: 0, padding: '13px 16px', borderRadius: 16, background: W,
              border: BORDER.sticker, boxShadow: SHADOW.chip, fontFamily: FONTS.body, fontWeight: 700,
              fontSize: 16, color: COLORS.ink, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !input.trim()}
            style={{
              padding: '0 18px', borderRadius: 16, background: theme.primary, color: W, border: BORDER.sticker,
              boxShadow: SHADOW.sticker, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14,
              cursor: input.trim() ? 'pointer' : 'default', opacity: input.trim() ? 1 : 0.55, textTransform: 'lowercase',
            }}
          >
            look up
          </button>
        </form>

        {/* RESULT */}
        <div style={{ marginTop: 16 }}>
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: 28 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 30, height: 30, borderRadius: 99, border: `3px solid ${COLORS.ink}`, borderTopColor: 'transparent', margin: '0 auto' }} // @design-allow: CSS spinner ring
                />
                <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink60, marginTop: 10 }}>looking it up…</div>
              </motion.div>
            )}

            {status === 'ok' && result && (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Sticker color={W} radius={22} padding={18}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {result.article ? (
                        <span style={{ fontFamily: FONTS.tag, fontSize: 11, color: COLORS.ink60, background: COLORS.butter, border: BORDER.thin, borderRadius: 999, padding: '2px 9px', textTransform: 'uppercase' }}>
                          {result.article}
                        </span>
                      ) : null}
                      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 30, color: COLORS.ink, letterSpacing: -0.6, lineHeight: 1.1, marginTop: result.article ? 6 : 0 }}>
                        {result.word}
                      </div>
                      {result.partOfSpeech ? (
                        <div style={{ fontFamily: FONTS.body, fontStyle: 'italic', fontWeight: 600, fontSize: 12, color: COLORS.ink45, marginTop: 2 }}>
                          {result.partOfSpeech}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : sayWord(result.word))}
                      aria-label="Hear the word"
                      style={{
                        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                        background: speaking ? theme.primary : COLORS.mint2, color: speaking ? W : COLORS.ink,
                        border: BORDER.sticker, boxShadow: SHADOW.chip, cursor: 'pointer', fontSize: 22,
                      }}
                    >
                      {speaking ? '■' : '🔊'}
                    </button>
                  </div>

                  <div style={{ marginTop: 14, padding: 12, background: COLORS.mint2, border: BORDER.thin, borderRadius: 14 }}>
                    <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 18, color: COLORS.green }}>
                      {result.translation}
                    </div>
                    {result.meaning ? (
                      <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink, marginTop: 4 }}>
                        {result.meaning}
                      </div>
                    ) : null}
                  </div>

                  {result.example ? (
                    <div
                      onClick={() => setShowExampleEn((v) => !v)}
                      style={{ marginTop: 12, padding: 12, background: COLORS.cream, border: BORDER.thin, borderRadius: 14, cursor: 'pointer' }}
                    >
                      <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, color: COLORS.ink }}>
                        {result.example}
                      </div>
                      {showExampleEn ? (
                        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, color: COLORS.ink60, marginTop: 4 }}>
                          {result.example_en}
                        </div>
                      ) : (
                        <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 11, color: COLORS.ink45, marginTop: 4 }}>
                          tap for the English
                        </div>
                      )}
                    </div>
                  ) : null}
                </Sticker>
              </motion.div>
            )}

            {status === 'notfound' && (
              <motion.div key="nf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Sticker color={COLORS.butter} radius={20} padding={16}>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                    hmm, that does not look like a Dutch word
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink60, marginTop: 4 }}>
                    check the spelling and try again. you can still hear how &quot;{input}&quot; sounds.
                  </div>
                  <button
                    type="button"
                    onClick={() => sayWord(input)}
                    style={{ marginTop: 12, padding: '9px 14px', borderRadius: 14, background: theme.primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    🔊 hear it anyway
                  </button>
                </Sticker>
              </motion.div>
            )}

            {(status === 'offline' || status === 'error') && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Sticker color={COLORS.peach} radius={20} padding={16}>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 15, color: COLORS.ink }}>
                    {status === 'offline' ? 'word lookup needs the internet' : 'that did not work, try again'}
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: COLORS.ink60, marginTop: 4 }}>
                    {status === 'offline'
                      ? 'the meaning comes from online. you can still hear how the word sounds.'
                      : 'give it another go in a moment.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => sayWord(input)}
                    style={{ marginTop: 12, padding: '9px 14px', borderRadius: 14, background: theme.primary, color: W, border: BORDER.sticker, boxShadow: SHADOW.chip, fontFamily: FONTS.display, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    🔊 hear it
                  </button>
                </Sticker>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECENT */}
        {recent.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 12, color: COLORS.ink60, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              recent
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recent.map((l) => (
                <button
                  key={l.word}
                  type="button"
                  onClick={() => lookup(l.word)}
                  style={{ padding: '7px 12px', borderRadius: 999, background: W, border: BORDER.sticker, boxShadow: SHADOW.chip, cursor: 'pointer', fontFamily: FONTS.body, fontWeight: 700, fontSize: 13, color: COLORS.ink }}
                >
                  {l.article ? <span style={{ color: COLORS.ink45 }}>{l.article} </span> : null}
                  {l.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
