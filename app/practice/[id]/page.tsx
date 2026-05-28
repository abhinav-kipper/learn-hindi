'use client'

import { useState, useEffect, useRef, useCallback, useMemo, FormEvent, ChangeEvent } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { VoiceButton, type VoiceButtonHandle } from '@/components/voice-button'
import { speak, stopSpeaking } from '@/lib/speech'
import { incrementPracticeCount, markLessonComplete, updateStreak, getStreak, getSeenStreakMilestones, markStreakMilestoneSeen } from '@/lib/progress'
import { getUniversalLessonById } from '@/lib/all-content'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'
import { useLanguage } from '@/lib/language-context'
import { getUserProfile } from '@/lib/onboarding'
import { getReasonInfo } from '@/lib/personalization'
import { addMistake } from '@/lib/mistakes'
import type { ChatReply } from '@/lib/chat-schema'
import { loadChatHistory, saveChatHistory, clearChatHistory, type ChatTurn } from '@/lib/chat-persistence'
import { setLastActiveLesson, clearLastActiveLesson } from '@/lib/last-active-lesson'
import {
  Sticker,
  Tag,
  Mascot,
  DottedBg,
  MotifIcon,
  Confetti as ChaiConfetti,
  ChaiGalliChatMessage,
  TypingDots,
  COLORS,
  FONTS,
  BORDER,
  SHADOW,
  useTheme,
} from '@/components/design'
import { useChaina, canFire, markFired } from '@/components/design'
const W = '#fff' // @design-allow: white literal

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parsed?: ChatReply
  failed?: boolean
  retryAfterSeconds?: number
}

interface PracticePageProps {
  params: Promise<{ id: string }>
}

function useChat({
  api,
  body,
  onAssistantReply,
  persistKey,
}: {
  api: string
  body: Record<string, unknown>
  onAssistantReply?: (reply: ChatReply) => void
  persistKey?: { lessonId: string; prefix: string }
}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!persistKey || typeof window === 'undefined') return []
    return loadChatHistory(persistKey.lessonId, persistKey.prefix)
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSentInitial = useRef(false)

  const sendMessages = useCallback(
    async (messagesToSend: Message[]) => {
      setIsLoading(true)
      setError(null)

      const assistantId = (Date.now() + 1).toString()
      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesToSend.map(({ role, content }) => ({ role, content })),
            ...body,
          }),
        })

        if (response.status === 429) {
          const body = await response.json().catch(() => ({}))
          const retryAfterSeconds: number | undefined =
            typeof body?.retryAfterSeconds === 'number' ? body.retryAfterSeconds : undefined
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: 'assistant', content: '', failed: true, retryAfterSeconds },
          ])
          setError('rate_limited')
          return
        }

        if (!response.ok) throw new Error(`Server error: ${response.status}`)

        const reply = (await response.json()) as ChatReply | { error: string }
        if ('error' in reply) throw new Error(reply.error)

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: reply.reply, parsed: reply },
        ])
        playSound('pop')
        onAssistantReply?.(reply)
      } catch (err) {
        console.error('Chat error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
        setError(errorMessage)
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', failed: true },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [api, body, onAssistantReply],
  )

  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true
      if (messages.length === 0) sendMessages([])
    }
  }, [sendMessages, messages.length])

  useEffect(() => {
    if (!persistKey) return
    saveChatHistory(persistKey.lessonId, messages as ChatTurn[], persistKey.prefix)
  }, [messages, persistKey])

  const resetChat = useCallback(() => {
    if (persistKey) clearChatHistory(persistKey.lessonId, persistKey.prefix)
    setMessages([])
    hasSentInitial.current = false
  }, [persistKey])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      playSound('tap')
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      await sendMessages(newMessages)
    },
    [input, isLoading, messages, sendMessages],
  )

  const retryLast = useCallback(async () => {
    const lastUserIdx = messages.map((m) => m.role).lastIndexOf('user')
    if (lastUserIdx < 0) {
      setMessages([])
      await sendMessages([])
      return
    }
    const trimmed = messages.slice(0, lastUserIdx + 1)
    setMessages(trimmed)
    await sendMessages(trimmed)
  }, [messages, sendMessages])

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    retryLast,
    resetChat,
  }
}

export default function PracticePage({ params }: PracticePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { language, config } = useLanguage()
  const { play } = useChaina()
  const theme = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voiceRef = useRef<VoiceButtonHandle>(null)
  const spokenIdsRef = useRef<Set<string>>(new Set())
  const [showFinish, setShowFinish] = useState(false)
  const [handsFree, setHandsFree] = useState(false)
  const handsFreeKey = `${config.storagePrefix}-hands-free`
  const sttLocale = config.ttsLocale === 'nl' ? 'nl-NL' : 'hi-IN'

  useEffect(() => {
    if (typeof window === 'undefined') return
    setHandsFree(localStorage.getItem(handsFreeKey) === '1')
  }, [handsFreeKey])

  const toggleHandsFree = useCallback(() => {
    setHandsFree((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(handsFreeKey, next ? '1' : '0')
      }
      if (!next) stopSpeaking()
      return next
    })
    playSound('tap')
  }, [handsFreeKey])

  const body = useMemo(() => {
    const profile = typeof window !== 'undefined' ? getUserProfile() : null
    const reasonInfo = profile ? getReasonInfo(profile.reason) : null
    // Always include gender so the tutor can address the user correctly,
    // even when reason isn't set.
    const userContext = profile
      ? {
          name: profile.name,
          gender: profile.gender,
          ...(reasonInfo ? { reasonContext: reasonInfo.context } : {}),
        }
      : undefined
    return { lessonId: id, language, userContext }
  }, [id, language])
  const lesson = getUniversalLessonById(id)

  const handleAssistantReply = useCallback(
    (reply: ChatReply) => {
      if (reply.correction) {
        addMistake(
          {
            original: reply.correction.original,
            correction: reply.correction.correct,
            reason: reply.correction.reason,
          },
          id,
          config.storagePrefix,
        )
        if (canFire('firstMistake', 'once-per-day')) {
          play('firstMistake')
          markFired('firstMistake', 'once-per-day')
        }
      }
    },
    [id, config.storagePrefix, play],
  )

  const persistKey = useMemo(
    () => ({ lessonId: id, prefix: config.storagePrefix }),
    [id, config.storagePrefix],
  )

  const {
    messages,
    input,
    setInput,
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
    if (messages.length > 0) {
      setLastActiveLesson(id, config.storagePrefix)
    }
  }, [messages.length, id, config.storagePrefix])

  const handleTranscript = useCallback(
    (text: string) => {
      setInput(text)
    },
    [setInput],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!handsFree) return
    if (isLoading) return
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant' || last.failed || !last.parsed) return
    if (spokenIdsRef.current.has(last.id)) return
    spokenIdsRef.current.add(last.id)
    speak(last.parsed.reply, config.ttsLocale, () => {
      voiceRef.current?.start()
    })
  }, [messages, isLoading, handsFree, config.ttsLocale])

  useEffect(() => () => stopSpeaking(), [])

  const userMessageCount = messages.filter((m) => m.role === 'user').length

  const handleFinish = () => {
    if (userMessageCount === 0) return
    markLessonComplete(id, config.storagePrefix)
    const counted = updateStreak(config.storagePrefix)
    const newStreak = getStreak(config.storagePrefix)
    const milestones = [7, 14, 30, 50, 100]
    if (
      milestones.includes(newStreak) &&
      !getSeenStreakMilestones(config.storagePrefix).includes(newStreak)
    ) {
      play('streakMilestone')
      markStreakMilestoneSeen(newStreak, config.storagePrefix)
    } else if (counted) {
      play('streakKept')
    }
    incrementPracticeCount(config.storagePrefix)
    clearChatHistory(id, config.storagePrefix)
    clearLastActiveLesson(config.storagePrefix)
    playSound('levelup')
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [COLORS.peach, COLORS.mint, COLORS.lav2, COLORS.butter, COLORS.rose],
      ticks: 90,
      gravity: 1.1,
      scalar: 1,
    })
    setShowFinish(true)
  }

  const handleReset = () => {
    if (!confirm('Start the conversation over? This will clear the current chat.')) return
    resetChat()
    playSound('tap')
  }

  return (
    <motion.div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: COLORS.lav,
        display: 'flex',
        flexDirection: 'column',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) {
          router.push(`/lessons/${id}`)
        }
      }}
    >
      <DottedBg />

      {/* HEADER BAND */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'relative',
          padding: '50px 20px 18px',
          background: COLORS.butter,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          borderBottom: BORDER.sticker,
          boxShadow: SHADOW.headerBand,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            onClick={() => {
              playSound('tap')
              router.push(`/lessons/${id}`)
            }}
            aria-label="Back to lesson"
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: W,
              border: BORDER.sticker,
              boxShadow: SHADOW.chip,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: COLORS.ink,
              padding: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ marginRight: -6, marginTop: -6 }}>
            <Mascot size={66} mood="happy" />
          </div>
        </div>

        <div style={{ marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
          <Tag>practice · roleplay</Tag>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 26,
              color: COLORS.ink,
              lineHeight: 1.05,
              marginTop: 6,
              letterSpacing: -0.5,
            }}
          >
            {lesson?.title ?? 'Practice'}
          </div>
        </div>

        {/* HANDS-FREE / RESET / FINISH actions */}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <ToolbarPill
            label={handsFree ? '🎙️ hands-free on' : '🎙️ hands-free'}
            active={handsFree}
            onClick={toggleHandsFree}
          />
          <ToolbarPill
            label="↻ reset"
            onClick={handleReset}
            disabled={messages.length === 0 || isLoading}
          />
          <button
            type="button"
            onClick={handleFinish}
            disabled={userMessageCount === 0 || isLoading}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 99,
              background: userMessageCount === 0 || isLoading ? W : COLORS.green,
              color: userMessageCount === 0 || isLoading ? COLORS.ink60 : W,
              border: BORDER.sticker,
              boxShadow:
                userMessageCount === 0 || isLoading ? 'none' : SHADOW.chip,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 12,
              cursor: userMessageCount === 0 || isLoading ? 'not-allowed' : 'pointer',
              textTransform: 'lowercase',
              opacity: userMessageCount === 0 || isLoading ? 0.5 : 1,
            }}
          >
            finish ✓
          </button>
        </div>
      </motion.div>

      {/* SCENARIO STICKER */}
      {lesson && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 240, damping: 22 }}
          style={{
            padding: '14px 14px 0',
            position: 'relative',
            zIndex: 2,
            maxWidth: 480,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Sticker color={COLORS.mint2} radius={20} padding={14}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: W,
                  border: BORDER.thin,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MotifIcon kind="chai" size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Tag>your scene</Tag>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 13,
                    color: COLORS.ink,
                    lineHeight: 1.4,
                  }}
                >
                  {lesson.situation || lesson.practice_prompt}
                </div>
              </div>
            </div>
          </Sticker>
        </motion.div>
      )}

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 14px 140px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          zIndex: 2,
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
        className="no-scrollbar"
      >
        {messages.length === 0 && (
          <FeatureTooltip id="practice" message={config.practiceTooltip} position="center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center', marginTop: 40 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  background: W,
                  border: BORDER.sticker,
                  borderRadius: 99,
                  boxShadow: SHADOW.chip,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                💬
              </div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 16,
                  color: COLORS.ink,
                }}
              >
                {language === 'dutch' ? 'Starting your session...' : 'Setting the scene...'}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 12,
                  color: COLORS.ink60,
                }}
              >
                {language === 'dutch'
                  ? 'Your Dutch tutor is about to introduce the topic.'
                  : 'Your conversation partner is about to start talking.'}
              </div>
            </motion.div>
          </FeatureTooltip>
        )}
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
              alignSelf: 'center',
              fontFamily: FONTS.body,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.red,
              background: COLORS.redBg,
              border: `1.8px solid ${COLORS.red}`,
              borderRadius: 99,
              padding: '6px 12px',
            }}
          >
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 70,
          left: 0,
          right: 0,
          padding: '0 14px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 20,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <VoiceButton
            ref={voiceRef}
            onTranscript={handleTranscript}
            disabled={isLoading}
            locale={sttLocale}
            listenLabel={`Speak in ${config.name}`}
          />
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={config.practiceInputPlaceholder}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 99,
              border: BORDER.sticker,
              background: W,
              color: COLORS.ink,
              fontFamily: FONTS.body,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: SHADOW.chip,
              outline: 'none',
              minWidth: 0,
              opacity: isLoading ? 0.6 : 1,
            }}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            whileTap={!isLoading && input.trim() ? { scale: 0.9 } : undefined}
            style={{
              width: 46,
              height: 46,
              borderRadius: 99,
              background:
                !input.trim() || isLoading ? W : COLORS.green,
              color: !input.trim() || isLoading ? COLORS.ink60 : W,
              border: BORDER.sticker,
              boxShadow: !input.trim() || isLoading ? 'none' : SHADOW.chip,
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !input.trim() || isLoading ? 0.5 : 1,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.button>
        </form>
      </motion.div>

      {/* COMPLETION OVERLAY */}
      <AnimatePresence>
        {showFinish && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                background: 'rgba(54, 40, 30, 0.4)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setShowFinish(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  pointerEvents: 'auto',
                  background: W,
                  border: BORDER.sticker,
                  boxShadow: SHADOW.sticker,
                  borderRadius: 24,
                  padding: 28,
                  maxWidth: 360,
                  width: '100%',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <ChaiConfetti active count={28} />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <div style={{ animation: 'happy-hop 1.4s ease-in-out infinite' }}>
                    <Mascot size={100} mood="happy" />
                  </div>
                </div>
                <Tag>session complete</Tag>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 800,
                    fontSize: 24,
                    color: COLORS.ink,
                    marginTop: 8,
                    letterSpacing: -0.4,
                  }}
                >
                  {language === 'dutch' ? 'Goed gedaan!' : 'Nice practice, dost!'}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: 13,
                    color: COLORS.ink60,
                    marginTop: 6,
                  }}
                >
                  {userMessageCount} message{userMessageCount === 1 ? '' : 's'} exchanged
                </div>
                {lesson && (
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 11,
                      color: COLORS.ink45,
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {lesson.title}
                  </div>
                )}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => {
                      playSound('tap')
                      router.push(`/lessons/${id}`)
                    }}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 22,
                      background: theme.primary,
                      color: W,
                      border: BORDER.sticker,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: SHADOW.sticker,
                      textTransform: 'lowercase',
                    }}
                  >
                    back to lesson
                  </button>
                  <button
                    onClick={() => {
                      playSound('tap')
                      router.push('/')
                    }}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 22,
                      background: W,
                      color: COLORS.ink,
                      border: BORDER.sticker,
                      fontFamily: FONTS.display,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: SHADOW.chip,
                      textTransform: 'lowercase',
                    }}
                  >
                    home
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ToolbarPill({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px',
        borderRadius: 99,
        background: active ? COLORS.ink : W,
        color: active ? COLORS.cream : COLORS.ink,
        border: BORDER.sticker,
        boxShadow: disabled ? 'none' : SHADOW.chip,
        fontFamily: FONTS.display,
        fontWeight: 800,
        fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        textTransform: 'lowercase',
      }}
    >
      {label}
    </button>
  )
}
