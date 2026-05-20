'use client'

import { useState, useEffect, useRef, useCallback, useMemo, FormEvent, ChangeEvent } from 'react'
import { use } from 'react'
import Link from 'next/link'
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
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <Link
          href={`/lessons/${id}`}
          className="text-sm text-[var(--accent)] hover:opacity-80 font-medium transition-colors"
        >
          ← Back to lesson
        </Link>
        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Practice Mode</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-5 space-y-3">
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
              className="text-center text-[var(--text-tertiary)] text-sm mt-12"
            >
              <p className="font-medium">Setting the scene...</p>
              <p className="mt-1.5 text-[var(--text-tertiary)]/70">Your conversation partner is about to start talking.</p>
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
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm dark:shadow-none">
              <span className="text-[var(--text-tertiary)] text-sm">Typing...</span>
            </div>
          </motion.div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 dark:text-red-400 mt-2">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[var(--border)]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type in Hindi (roman) or English..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-sm disabled:opacity-50 transition-all duration-200"
          />
          <VoiceButton onTranscript={handleTranscript} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm dark:shadow-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
