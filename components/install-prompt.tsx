'use client'

import { useState, useEffect } from 'react'
import { Tag, COLORS, FONTS, BORDER, SHADOW } from '@/components/design'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (isIos && !isStandalone && !dismissed) setShowPrompt(true)
  }, [])

  if (!showPrompt) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: 14,
        right: 14,
        maxWidth: 460,
        margin: '0 auto',
        zIndex: 50,
        background: COLORS.peach2,
        border: BORDER.sticker,
        borderRadius: 18,
        boxShadow: SHADOW.sticker,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Tag>install</Tag>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.ink,
              marginTop: 4,
              letterSpacing: -0.2,
            }}
          >
            add to home screen
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 11,
              color: COLORS.ink60,
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            tap the share button then &quot;Add to Home Screen&quot; for the full app experience.
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowPrompt(false)
            localStorage.setItem('install-prompt-dismissed', 'true')
          }}
          aria-label="Dismiss"
          style={{
            width: 26,
            height: 26,
            borderRadius: 99,
            background: '#fff',
            border: BORDER.thin,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.ink,
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
