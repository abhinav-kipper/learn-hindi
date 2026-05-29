'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
import { useLanguage } from '@/lib/language-context'
import { tokenize, getGloss, type GlossToken } from '@/lib/gloss'

const LONG_PRESS_MS = 380

type Active = { token: GlossToken; x: number; y: number; below: boolean } | null

/**
 * Renders a phrase inline; long-pressing any word pops a small Chai Galli
 * sticker with its context-aware translation (+ optional usage note). Short
 * taps pass through to the parent (so existing tap-to-reveal / TTS still work).
 * Words are only interactive when a pre-generated gloss exists for the phrase —
 * with an empty manifest this renders as plain text.
 */
export default function GlossableText({
  phrase,
  language,
  style,
}: {
  phrase: string
  language?: string
  style?: React.CSSProperties
}) {
  const ctx = useLanguage()
  const lang = language ?? ctx.language
  const gloss = getGloss(phrase, lang)
  const [active, setActive] = useState<Active>(null)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longFired = useRef(false)

  useEffect(() => {
    if (!active) return
    const close = () => setActive(null)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    window.addEventListener('keydown', onKey)
    const t = setTimeout(close, 4500)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [active])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  if (!gloss) return <span style={style}>{phrase}</span>

  const pieces = tokenize(phrase)

  const openFor = (token: GlossToken, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const x = Math.min(Math.max(r.left + r.width / 2, 96), window.innerWidth - 96)
    // Sit just above the word; flip below if too close to the top edge.
    const above = r.top > 86
    setActive({ token, x, y: above ? r.top - 8 : r.bottom + 8, below: !above })
  }

  return (
    <span style={style}>
      {pieces.map((p, i) => {
        if (!p.word) return <span key={i}>{p.text}</span>
        const token = gloss[p.wordIndex]
        if (!token) return <span key={i}>{p.text}</span>
        const start = (e: React.PointerEvent<HTMLSpanElement>) => {
          longFired.current = false
          const el = e.currentTarget
          timer.current = setTimeout(() => {
            longFired.current = true
            try { navigator.vibrate?.(8) } catch {}
            openFor(token, el)
          }, LONG_PRESS_MS)
        }
        const cancel = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
        return (
          <span
            key={i}
            onPointerDown={start}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => {
              // Swallow the click only if it was a long-press (so a normal tap
              // still bubbles to the parent's reveal / TTS handler).
              if (longFired.current) { e.preventDefault(); e.stopPropagation() }
            }}
            style={{ cursor: 'pointer', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
          >
            {p.text}
          </span>
        )
      })}
      {active && <GlossPopover active={active} onClose={() => setActive(null)} />}
    </span>
  )
}

function GlossPopover({ active, onClose }: { active: NonNullable<Active>; onClose: () => void }) {
  if (typeof document === 'undefined') return null
  const { token, x, y, below } = active
  // Portal to <body> so an ancestor's CSS transform (Framer animations) doesn't
  // become the containing block for our fixed positioning — keeps it on the word.
  return createPortal(
    <>
      {/* invisible catcher: any tap elsewhere closes it */}
      <div onPointerDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80 }} aria-hidden />
      <div
        role="tooltip"
        style={{
          position: 'fixed',
          left: x,
          top: y,
          transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          zIndex: 81,
          maxWidth: 220,
          background: '#fff', // @design-allow: white literal
          border: BORDER.sticker,
          boxShadow: SHADOW.sticker,
          borderRadius: 13,
          padding: '7px 12px',
          textAlign: 'center',
          animation: 'pop-in 160ms cubic-bezier(.34,1.56,.64,1)',
          transformOrigin: below ? 'top center' : 'bottom center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 14.5, color: COLORS.ink, lineHeight: 1.3 }}>
          {token.t}
        </span>
      </div>
    </>,
    document.body,
  )
}
