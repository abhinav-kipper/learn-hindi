'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, FONTS, BORDER, RADIUS, SHADOW } from '@/components/design'
import { speak, stopSpeaking } from '@/lib/speech'
import { playSound } from '@/lib/sounds'
import {
  defineTerm,
  getCachedDefinition,
  shouldLookUp,
  splitCell,
  type Definition,
} from '@/lib/dutch/define'

const W = '#fff' // @design-allow: white literal

type Opened = { term: string; known?: string; note?: string }

type Ctx = { open: (term: string, known?: string, note?: string) => void }

const DutchTermCtx = createContext<Ctx | null>(null)

/**
 * Makes every Dutch string on a cheatsheet tappable: one tap speaks it and opens
 * a sheet with what it means. Mount once per page, around the sheet content.
 */
export function DutchTermProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Opened | null>(null)
  const [def, setDef] = useState<Definition | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'none' | 'offline'>('idle')

  const open = useCallback((term: string, known?: string, note?: string) => {
    const clean = term.trim()
    if (!clean) return
    playSound('tap')
    setActive({ term: clean, known, note })
    speak(clean, 'nl')
  }, [])

  const close = useCallback(() => {
    stopSpeaking()
    setActive(null)
    setDef(null)
    setState('idle')
  }, [])

  // Look the term up once the sheet is open. A cached hit lands synchronously
  // on the first render, so repeat taps never flash a spinner.
  useEffect(() => {
    if (!active) return
    let cancelled = false
    const cached = getCachedDefinition(active.term)
    if (cached) {
      setDef(cached.found ? cached : null)
      setState(cached.found ? 'ok' : 'none')
      return
    }
    // A whole sentence is not a dictionary entry: show the gloss we already have
    // and let the speaker button do the rest, rather than a pointless lookup.
    if (!shouldLookUp(active.term)) {
      setDef(null)
      setState('idle')
      return
    }
    setDef(null)
    setState('loading')
    defineTerm(active.term).then((r) => {
      if (cancelled) return
      if (r.status === 'ok') {
        setDef(r.definition)
        setState('ok')
      } else {
        setDef(null)
        setState(r.status === 'notfound' ? 'none' : 'offline')
      }
    })
    return () => {
      cancelled = true
    }
  }, [active])

  // Escape closes, matching the other overlays in the app.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close])

  const meaning = active?.known ?? def?.translation ?? ''

  return (
    <DutchTermCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              style={{
                position: 'fixed',
                inset: 0,
                background: COLORS.ink,
                opacity: 0.35,
                zIndex: 85,
              }}
            />
            <motion.div
              role="dialog"
              aria-label={`What ${active.term} means`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90) close()
              }}
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 86,
                background: COLORS.butter,
                borderTop: BORDER.sticker,
                borderTopLeftRadius: RADIUS.sheet,
                borderTopRightRadius: RADIUS.sheet,
                boxShadow: SHADOW.sheet,
                padding: '10px 18px 30px',
                maxHeight: '78dvh',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 5,
                  borderRadius: 99,
                  background: COLORS.ink,
                  opacity: 0.25,
                  margin: '0 auto 14px',
                }}
              />

              <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {def?.article && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontFamily: FONTS.tag,
                          fontSize: 10,
                          background: COLORS.ink,
                          color: COLORS.cream,
                          borderRadius: 99,
                          padding: '3px 9px',
                          marginBottom: 6,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {def.article}
                      </span>
                    )}
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 22,
                        color: COLORS.ink,
                        lineHeight: 1.25,
                        wordBreak: 'break-word',
                      }}
                    >
                      {active.term}
                    </div>
                    {def?.partOfSpeech && (
                      <div
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 12,
                          color: COLORS.ink45,
                          fontStyle: 'italic',
                          marginTop: 2,
                        }}
                      >
                        {def.partOfSpeech}
                      </div>
                    )}
                  </div>
                  <button
                    aria-label={`Hear it: ${active.term}`}
                    onClick={() => {
                      playSound('tap')
                      speak(active.term, 'nl')
                    }}
                    style={{
                      flexShrink: 0,
                      width: 48,
                      height: 48,
                      borderRadius: 99,
                      background: W,
                      border: BORDER.sticker,
                      boxShadow: SHADOW.chip,
                      cursor: 'pointer',
                      fontSize: 20,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    🔊
                  </button>
                </div>

                {meaning && (
                  <div
                    style={{
                      marginTop: 14,
                      background: W,
                      border: BORDER.sticker,
                      borderRadius: RADIUS.md,
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 16,
                        fontWeight: 700,
                        color: COLORS.ink,
                        lineHeight: 1.4,
                      }}
                    >
                      {meaning}
                    </div>
                    {(active.note || def?.meaning) && (
                      <div
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 13,
                          color: COLORS.ink60,
                          marginTop: 6,
                          lineHeight: 1.45,
                        }}
                      >
                        {active.note ?? def?.meaning}
                      </div>
                    )}
                  </div>
                )}

                {state === 'loading' && !meaning && (
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONTS.body,
                      fontSize: 13.5,
                      color: COLORS.ink60,
                    }}
                  >
                    Looking it up...
                  </div>
                )}

                {state === 'offline' && !meaning && (
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONTS.body,
                      fontSize: 13.5,
                      color: COLORS.ink60,
                      lineHeight: 1.45,
                    }}
                  >
                    No meaning available right now, but you can still hear it.
                  </div>
                )}

                {state === 'none' && !meaning && (
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONTS.body,
                      fontSize: 13.5,
                      color: COLORS.ink60,
                    }}
                  >
                    No dictionary entry for this one.
                  </div>
                )}

                {def?.example && (
                  <div
                    style={{
                      marginTop: 10,
                      background: COLORS.mint2,
                      border: BORDER.sticker,
                      borderRadius: RADIUS.md,
                      padding: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <button
                        aria-label={`Hear the example: ${def.example}`}
                        onClick={() => {
                          playSound('tap')
                          speak(def.example, 'nl')
                        }}
                        style={{
                          flexShrink: 0,
                          width: 28,
                          height: 28,
                          borderRadius: 99,
                          background: W,
                          border: BORDER.thin,
                          cursor: 'pointer',
                          fontSize: 12,
                          padding: 0,
                        }}
                      >
                        🔊
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: FONTS.body,
                            fontSize: 14,
                            fontWeight: 700,
                            color: COLORS.ink,
                          }}
                        >
                          {def.example}
                        </div>
                        <div
                          style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.ink60 }}
                        >
                          {def.example_en}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {def?.otherSenses && def.otherSenses.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontWeight: 800,
                        fontSize: 12,
                        color: COLORS.ink,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        marginBottom: 7,
                      }}
                    >
                      Also means
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {def.otherSenses.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            background: W,
                            border: BORDER.thin,
                            borderRadius: RADIUS.sm,
                            padding: 10,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: FONTS.body,
                              fontSize: 14,
                              fontWeight: 700,
                              color: COLORS.ink,
                            }}
                          >
                            {s.translation}
                          </div>
                          <div
                            style={{
                              fontFamily: FONTS.body,
                              fontSize: 12.5,
                              color: COLORS.ink60,
                              marginTop: 2,
                              lineHeight: 1.4,
                            }}
                          >
                            {s.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={close}
                  style={{
                    width: '100%',
                    background: COLORS.ink,
                    border: BORDER.sticker,
                    borderRadius: RADIUS.sm,
                    padding: '12px',
                    marginTop: 16,
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 14,
                    color: COLORS.cream,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DutchTermCtx.Provider>
  )
}

/** A tappable Dutch string. Falls back to plain text outside a provider. */
export function DutchTerm({
  text,
  known,
  note,
  style,
  underline = true,
}: {
  text: string
  known?: string
  note?: string
  style?: React.CSSProperties
  underline?: boolean
}) {
  const ctx = useContext(DutchTermCtx)
  if (!ctx || !/[\p{L}]/u.test(text)) return <span style={style}>{text}</span>
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        ctx.open(text, known, note)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          ctx.open(text, known, note)
        }
      }}
      style={{
        cursor: 'pointer',
        textDecoration: underline ? 'underline' : 'none',
        textDecorationStyle: 'dotted',
        textDecorationColor: `${COLORS.ink45}`,
        textUnderlineOffset: 3,
        ...style,
      }}
    >
      {text}
    </span>
  )
}

/**
 * A whole cell of Dutch, split into its individual terms so a list or a pair of
 * alternatives becomes several tappable pieces rather than one blob.
 */
export function DutchCell({
  text,
  known,
  style,
}: {
  text: string
  known?: string
  style?: React.CSSProperties
}) {
  const pieces = splitCell(text)
  // A single piece keeps the known meaning; a split cell cannot map one English
  // gloss onto several terms, so each piece looks itself up instead.
  const single = pieces.filter((p) => p.term).length === 1
  return (
    <span style={style}>
      {pieces.map((p, i) =>
        p.term ? (
          <DutchTerm key={i} text={p.text} known={single ? known : undefined} />
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  )
}
