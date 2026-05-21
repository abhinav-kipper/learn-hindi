'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

// Strip content in parentheses (typically English translations) so only
// the Hindi/romanized text is spoken.
function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim()
}

function SpeakerButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const cleaned = stripParenthetical(text)
    const utterance = new SpeechSynthesisUtterance(cleaned)

    // Prefer a Hindi voice; fall back to whatever the browser picks
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice =
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.startsWith('hi'))
    if (hindiVoice) utterance.voice = hindiVoice
    utterance.lang = 'hi-IN'
    utterance.rate = 0.9

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text, speaking])

  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={speaking ? 'Stop' : 'Listen'}
      className={`ml-2 flex-shrink-0 self-end mb-0.5 p-1 rounded-full transition-colors duration-150
        ${speaking
          ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
          : 'text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]'
        }`}
    >
      {speaking ? (
        // Stop / speaker-wave icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
          <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      ) : (
        // Speaker icon (quiet)
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
          <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      )}
    </button>
  )
}

/**
 * Parse AI message into Hindi and English parts.
 * Expected format:
 * "hindi text here\n\n(english translation here)"
 * Or fallback: "hindi text (english translation)"
 */
function parseMessage(content: string): { hindi: string; english: string } | null {
  // Try format: hindi\n\n(english)
  const blockMatch = content.match(/^([\s\S]+?)\n\n\(([^)]+)\)\s*$/)
  if (blockMatch) {
    return { hindi: blockMatch[1].trim(), english: blockMatch[2].trim() }
  }

  // Try format: hindi (english) — inline parentheses at end
  const inlineMatch = content.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (inlineMatch) {
    return { hindi: inlineMatch[1].trim(), english: inlineMatch[2].trim() }
  }

  return null
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'
  const parsed = !isUser ? parseMessage(content) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-br-md shadow-sm'
              : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-md shadow-sm'
          }`}
        >
          {parsed ? (
            <div>
              <p className="font-medium">{parsed.hindi}</p>
              <p className="mt-1.5 text-xs opacity-60 italic">{parsed.english}</p>
            </div>
          ) : (
            content
          )}
        </div>
        {!isUser && <SpeakerButton text={content} />}
      </div>
    </motion.div>
  )
}
