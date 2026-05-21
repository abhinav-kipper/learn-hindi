'use client'

import { useState, useEffect, useRef, useCallback, useMemo, FormEvent, ChangeEvent } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChatMessage } from '@/components/chat-message'
import { VoiceButton } from '@/components/voice-button'
import { incrementPracticeCount } from '@/lib/progress'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface PracticePageProps {
  params: Promise<{ id: string }>
}

function useChat({ api, body }: { api: string; body: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSentInitial = useRef(false)

  // Auto-send initial message to make AI start the conversation
  const sendMessages = useCallback(
    async (messagesToSend: Message[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesToSend.map(({ role, content }) => ({ role, content })),
            ...body,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Server error: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const assistantId = (Date.now() + 1).toString()
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '' },
        ])
        playSound('pop')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            )
          }
        }
      } catch (err) {
        console.error('Chat error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [api, body]
  )

  // Trigger AI's opening message on mount
  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true
      sendMessages([])
    }
  }, [sendMessages])

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
    [input, isLoading, messages, sendMessages]
  )

  return { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error }
}

export default function PracticePage({ params }: PracticePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const body = useMemo(() => ({ lessonId: id }), [id])

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body,
  })

  const handleTranscript = useCallback((text: string) => {
    setInput(text)
  }, [setInput])

  useEffect(() => {
    incrementPracticeCount()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <motion.div
      className="flex flex-col h-dvh max-w-lg mx-auto"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) {
          router.push(`/lessons/${id}`)
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] safe-top">
        <Link
          href={`/lessons/${id}`}
          className="flex items-center gap-1 text-sm text-[var(--accent)] font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Lesson
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
            💬 Practice
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <FeatureTooltip
            id="practice"
            message="The AI will start talking first — reply in Hindi (romanized) or English!"
            position="center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mt-16"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <p className="font-medium text-[var(--text-primary)]">Setting the scene...</p>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">Your conversation partner is about to start talking.</p>
            </motion.div>
          </FeatureTooltip>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as 'user' | 'assistant'}
            content={message.content}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg py-2 px-3 mx-auto">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-[var(--bg-surface)] border-t border-[var(--border)] safe-bottom">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type in Hindi or English..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-sm disabled:opacity-50 transition-all"
          />
          <VoiceButton onTranscript={handleTranscript} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </form>
      </div>
    </motion.div>
  )
}
