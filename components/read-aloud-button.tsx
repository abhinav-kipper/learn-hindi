'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { speakHindi, stopSpeaking, isSpeaking } from '@/lib/speech'

interface ReadAloudButtonProps {
  text: string
  className?: string
}

export function ReadAloudButton({ text, className = '' }: ReadAloudButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    // Poll speaking state to keep UI in sync
    if (!speaking) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 200)
    return () => clearInterval(interval)
  }, [speaking])

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    speakHindi(text)
    setSpeaking(true)
  }, [text, speaking])

  if (typeof window === 'undefined') return null

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={speaking ? 'Stop' : 'Listen'}
      className={`p-2 rounded-full transition-colors duration-150 ${
        speaking
          ? 'text-[var(--accent)] bg-[var(--accent-soft)] scale-110'
          : 'text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]'
      } ${className}`}
    >
      {speaking ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
          <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
          <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      )}
    </button>
  )
}
