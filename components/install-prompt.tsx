'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('install-prompt-dismissed')

    if (isIos && !isStandalone && !dismissed) {
      setShowPrompt(true)
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-[var(--bg-surface)] border border-orange-200 rounded-xl p-4 shadow-lg z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-[var(--text-primary)] text-sm">Install this app</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Tap the share button then &quot;Add to Home Screen&quot; for the full app experience.
          </p>
        </div>
        <button
          onClick={() => {
            setShowPrompt(false)
            localStorage.setItem('install-prompt-dismissed', 'true')
          }}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
