'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { speak, stopSpeaking, isSpeaking } from '@/lib/speech'
import { useLanguage } from '@/lib/language-context'
import { playSound } from '@/lib/sounds'
import type { ChatReply } from '@/lib/chat-schema'
import { Mascot } from './Mascot'
import { COLORS, FONTS, BORDER, SHADOW } from './tokens'
import { useTheme } from './theme'
const W = '#fff' // @design-allow: white literal
const RATE_LIMIT_BG = '#dbf2fb' // @design-allow: rate-limited message tint, not a system token

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  parsed?: ChatReply
  failed?: boolean
  retryAfterSeconds?: number
  onRetry?: () => void
}

function RateLimitMessage({
  retryAfterSeconds,
  onRetry,
}: {
  retryAfterSeconds: number
  onRetry?: () => void
}) {
  const [remaining, setRemaining] = useState(retryAfterSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(timer)
  }, [remaining])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>⏳ Tutor&apos;s catching its breath.</span>
      {remaining > 0 ? (
        <span style={{ fontWeight: 800 }}>retry in {remaining}s</span>
      ) : (
        onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              fontWeight: 800,
              background: 'transparent',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              color: COLORS.ink,
              fontFamily: FONTS.body,
              fontSize: 12,
            }}
          >
            try again
          </button>
        )
      )}
    </div>
  )
}

function SpeakerButton({ text }: { text: string }) {
  const { config } = useLanguage()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!speaking) return
    const interval = setInterval(() => {
      if (!isSpeaking()) setSpeaking(false)
    }, 300)
    return () => clearInterval(interval)
  }, [speaking])

  const handleSpeak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (speaking) {
        stopSpeaking()
        setSpeaking(false)
        return
      }
      const cleaned = text.trim()
      if (!cleaned) return
      playSound('pop')
      speak(cleaned, config.ttsLocale)
      setSpeaking(true)
    },
    [text, speaking, config.ttsLocale],
  )

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={speaking ? 'Stop' : 'Listen'}
      style={{
        marginLeft: 6,
        flexShrink: 0,
        alignSelf: 'flex-end',
        padding: 4,
        borderRadius: 99,
        background: speaking ? COLORS.peach : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: COLORS.ink,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        {speaking ? (
          <>
            <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
            <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
          </>
        ) : (
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
        )}
      </svg>
    </button>
  )
}

function CorrectionSticker({ correction }: { correction: NonNullable<ChatReply['correction']> }) {
  const theme = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        alignSelf: 'flex-end',
        maxWidth: '88%',
        background: COLORS.butter,
        border: BORDER.stickerDashed,
        borderRadius: 16,
        padding: 12,
        boxShadow: SHADOW.chip,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontFamily: FONTS.tag,
          fontSize: 10,
          background: theme.primary,
          color: W,
          padding: '2px 8px',
          borderRadius: 99,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          border: BORDER.thin,
        }}
      >
        ✦ correction
      </span>
      <div
        style={{
          marginTop: 8,
          fontFamily: FONTS.body,
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.ink,
          lineHeight: 1.4,
        }}
      >
        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{correction.original}</span>
        {' → '}
        <span style={{ color: COLORS.green }}>{correction.correct}</span>
      </div>
      {correction.reason && (
        <div
          style={{
            marginTop: 6,
            fontFamily: FONTS.body,
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.ink60,
            lineHeight: 1.35,
          }}
        >
          {correction.reason}
        </div>
      )}
    </motion.div>
  )
}

export function ChaiGalliChatMessage({
  role,
  content,
  parsed,
  failed,
  retryAfterSeconds,
  onRetry,
}: ChatMessageProps) {
  const isUser = role === 'user'

  // Failure / rate-limit messages — small inline banner.
  if (!isUser && failed) {
    const isRateLimited = retryAfterSeconds !== undefined
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'flex-start' }}
      >
        <div
          style={{
            background: isRateLimited ? RATE_LIMIT_BG : COLORS.butter,
            border: `1.8px solid ${COLORS.ink}`,
            borderRadius: 16,
            padding: '8px 12px',
            fontFamily: FONTS.body,
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.ink,
            boxShadow: SHADOW.chip,
          }}
        >
          {isRateLimited ? (
            <RateLimitMessage retryAfterSeconds={retryAfterSeconds} onRetry={onRetry} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️ Couldn&apos;t get a clean reply.</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    fontWeight: 800,
                    background: 'transparent',
                    border: 'none',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: COLORS.ink,
                    fontFamily: FONTS.body,
                    fontSize: 12,
                  }}
                >
                  try again
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          maxWidth: '88%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {!isUser && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 99,
              background: COLORS.teal,
              border: BORDER.thin,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: SHADOW.chip,
            }}
          >
            <div style={{ transform: 'scale(0.32) translateY(-2px)', transformOrigin: 'center' }}>
              <Mascot size={86} />
            </div>
          </div>
        )}
        <div
          style={{
            background: isUser ? COLORS.peach : W,
            border: BORDER.sticker,
            borderRadius: 18,
            borderBottomRightRadius: isUser ? 6 : 18,
            borderBottomLeftRadius: !isUser ? 6 : 18,
            padding: '10px 13px',
            boxShadow: SHADOW.chip,
            fontFamily: FONTS.body,
            fontSize: 13.5,
            fontWeight: 700,
            color: COLORS.ink,
            lineHeight: 1.45,
          }}
        >
          {parsed ? (
            <>
              <div>{parsed.reply}</div>
              {parsed.english && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: COLORS.ink60,
                    fontStyle: 'italic',
                    fontWeight: 600,
                  }}
                >
                  {parsed.english}
                </div>
              )}
            </>
          ) : (
            content
          )}
        </div>
        {!isUser && parsed && <SpeakerButton text={parsed.reply} />}
      </div>

      {!isUser && parsed?.correction && <CorrectionSticker correction={parsed.correction} />}
    </motion.div>
  )
}

export function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 99,
          background: COLORS.teal,
          border: BORDER.thin,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: SHADOW.chip,
        }}
      >
        <div style={{ transform: 'scale(0.32) translateY(-2px)', transformOrigin: 'center' }}>
          <Mascot size={86} />
        </div>
      </div>
      <div
        style={{
          background: W,
          border: BORDER.sticker,
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          padding: '12px 14px',
          boxShadow: SHADOW.chip,
          display: 'flex',
          gap: 5,
        }}
      >
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: COLORS.ink60,
              animation: `float-y 1.2s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
