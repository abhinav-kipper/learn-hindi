'use client'

import { useState, type ReactNode, type CSSProperties } from 'react'
import { COLORS, FONTS, BORDER, SHADOW } from './tokens'
import { playSound } from '@/lib/sounds'

const W = '#fff' // @design-allow: white literal

interface DoneFoldProps {
  /** how many completed items are tucked inside */
  count: number
  /** what the items are, e.g. 'done', 'read', 'studied' (default 'done') */
  noun?: string
  /** persist open/closed across reloads under this localStorage key */
  storageKey?: string
  /** start expanded (default false — collapsed so pending is what you see) */
  defaultOpen?: boolean
  /** gap between the folded children (default 14, matches the lesson list) */
  gap?: number
  children: ReactNode
  style?: CSSProperties
}

/**
 * A collapsed "✓ N done" fold for completed items, so a list shows what's
 * pending first and tucks the finished items behind a tap. Mirrors the home
 * Stories fold styling. Renders nothing when count is 0.
 */
export function DoneFold({
  count,
  noun = 'done',
  storageKey,
  defaultOpen = false,
  gap = 14,
  children,
  style,
}: DoneFoldProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultOpen
    const v = localStorage.getItem(storageKey)
    return v === null ? defaultOpen : v === '1'
  })

  if (count <= 0) return null

  const toggle = () => {
    setOpen((v) => {
      const next = !v
      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, next ? '1' : '0')
        } catch {
          /* ignore */
        }
      }
      return next
    })
    playSound('tap')
  }

  return (
    <div style={style}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: W,
          color: COLORS.ink,
          border: BORDER.sticker,
          boxShadow: SHADOW.chip,
          borderRadius: 99,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 12,
          cursor: 'pointer',
          textTransform: 'lowercase',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>✓ {count} {noun}</span>
        <span style={{ color: COLORS.ink60 }}>{open ? 'hide ▴' : 'show ▾'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap, marginTop: 10 }}>{children}</div>
      )}
    </div>
  )
}
