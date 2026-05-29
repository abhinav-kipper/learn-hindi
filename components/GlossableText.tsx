'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { COLORS, FONTS, BORDER, SHADOW } from '@/components/design'
import { useLanguage } from '@/lib/language-context'
import { tokenize, getGloss, type GlossToken } from '@/lib/gloss'

type Active = { token: GlossToken; x: number; y: number; below: boolean } | null

/**
 * Renders a phrase inline; tapping any word pops a small Chai Galli sticker with
 * its context-aware translation. Tap is used (not long-press) so the iOS native
 * selection/callout never triggers. Words are only interactive when a
 * pre-generated gloss exists for the phrase — otherwise it renders plain text.
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

  // Kill native text selection / the iOS long-press callout across the phrase,
  // as a backstop for incidental holds (the trigger itself is a tap).
  const noSelect: React.CSSProperties = {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  }

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
    <span className="gloss-phrase" style={{ ...style, ...noSelect }} draggable={false}>
      {pieces.map((p, i) => {
        if (!p.word) return <span key={i}>{p.text}</span>
        const token = gloss[p.wordIndex]
        if (!token) return <span key={i}>{p.text}</span>
        return (
          <span
            key={i}
            onClick={(e) => {
              // Tap a word → show its gloss. Stop the tap from also triggering a
              // parent handler (reveal / TTS / panel advance).
              e.preventDefault()
              e.stopPropagation()
              try { navigator.vibrate?.(6) } catch {}
              openFor(token, e.currentTarget)
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ cursor: 'pointer' }}
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
