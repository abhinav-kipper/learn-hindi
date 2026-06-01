'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useChat, type Message } from '@/lib/use-chat'
import { useLanguage } from '@/lib/language-context'
import { getUserProfile } from '@/lib/onboarding'
import { addMistake } from '@/lib/mistakes'
import { getMemory, applyRemember } from '@/lib/chaina-memory'
import type { ChatReply } from '@/lib/chat-schema'
import { playSound } from '@/lib/sounds'
import {
  Mascot,
  DottedBg,
  ChaiGalliChatMessage,
  TypingDots,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'

const W = '#fff' // @design-allow: white literal
const CHAINA_ID = '__chaina__'

export default function ChainaPage() {
  const router = useRouter()
  const { language, config } = useLanguage()
  const theme = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const body = useMemo(() => {
    const profile = typeof window !== 'undefined' ? getUserProfile() : null
    const userContext = profile
      ? { name: profile.name, gender: profile.gender }
      : undefined
    const memory = typeof window !== 'undefined' ? getMemory(config.storagePrefix) : undefined
    return { mode: 'companion', language, userContext, memory }
  }, [language, config.storagePrefix])

  const persistKey = useMemo(
    () => ({ lessonId: CHAINA_ID, prefix: config.storagePrefix }),
    [config.storagePrefix],
  )

  const handleAssistantReply = useCallback(
    (reply: ChatReply) => {
      if (reply.correction) {
        addMistake(
          {
            original: reply.correction.original,
            correction: reply.correction.correct,
            reason: reply.correction.reason,
          },
          CHAINA_ID,
          config.storagePrefix,
          'practice',
        )
      }
    },
    [config.storagePrefix],
  )

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    retryLast,
    resetChat,
  } = useChat({
    api: '/api/chat',
    body,
    onAssistantReply: handleAssistantReply,
    persistKey,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Write-back: once per session, distill the chat into the Memory Card. Fire
  // on leave (unmount / tab hidden), debounced so it runs at most once.
  const messagesRef = useRef<Message[]>(messages)
  messagesRef.current = messages
  const rememberedRef = useRef(false)

  const remember = useCallback(async () => {
    if (rememberedRef.current) return
    const turns = messagesRef.current.filter((m) => m.parsed || m.role === 'user')
    if (turns.length < 2) return // nothing meaningful to remember yet
    rememberedRef.current = true
    try {
      const profile = getUserProfile()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'remember',
          language,
          userContext: { name: profile.name, gender: profile.gender },
          memory: getMemory(config.storagePrefix),
          messages: turns.map(({ role, content }) => ({ role, content })),
        }),
        keepalive: true,
      })
      if (res.ok) {
        const update = await res.json()
        applyRemember(update, config.storagePrefix)
      }
    } catch {
      // Best-effort: keep rememberedRef set so we never double-fire (and never
      // double-bump chatCount). A failed write-back just skips this session's
      // distillation rather than risking a duplicate.
    }
  }, [language, config.storagePrefix])

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') remember()
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      remember()
    }
  }, [remember])

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: COLORS.lav, paddingBottom: 96 }}>
      <DottedBg />

      {/* HEADER */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 3,
          padding: '46px 16px 14px',
          background: theme.bandFrom,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              remember()
              router.push('/')
            }}
            aria-label="Back"
            style={{
              width: 38,
              height: 38,
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              cursor: 'pointer',
              color: COLORS.ink,
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <Mascot size={52} mood="happy" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 22, color: COLORS.ink, lineHeight: 1 }}>
              Chaina
            </div>
            <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink60, marginTop: 3 }}>
              your Hindi dost · she remembers
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              resetChat()
            }}
            aria-label="Start a fresh chat"
            title="Start fresh"
            style={{
              width: 38,
              height: 38,
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              cursor: 'pointer',
              color: COLORS.ink,
              flexShrink: 0,
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px 8px' }}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChaiGalliChatMessage
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={message.content}
              parsed={message.parsed}
              failed={message.failed}
              retryAfterSeconds={message.retryAfterSeconds}
              onRetry={message.failed ? retryLast : undefined}
            />
          ))}
        </AnimatePresence>
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingDots />}
        {error && error !== 'rate_limited' && (
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.ink60,
              textAlign: 'center',
              padding: '8px 4px',
            }}
          >
            Chaina got distracted, dobara bolo (tap a failed bubble to retry).
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          padding: '12px 14px calc(12px + env(safe-area-inset-bottom))',
          background: COLORS.lav,
          borderTop: BORDER.sticker,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="bolo kuch… (type in Hindi)"
            aria-label="Message Chaina"
            style={{
              flex: 1,
              minWidth: 0,
              background: W,
              border: BORDER.sticker,
              borderRadius: 99,
              boxShadow: SHADOW.chip,
              padding: '12px 16px',
              fontFamily: FONTS.body,
              fontSize: 15,
              color: COLORS.ink,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send"
            style={{
              width: 46,
              height: 46,
              borderRadius: 99,
              background: input.trim() && !isLoading ? theme.primary : COLORS.lav2,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              color: W,
              fontSize: 20,
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  )
}
