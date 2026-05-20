'use client'

import { useState, useEffect, useRef, useCallback, useMemo, FormEvent, ChangeEvent } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChatMessage } from '@/components/chat-message'
import { incrementPracticeCount } from '@/lib/progress'

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

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      setError(null)

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      }

      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      setIsLoading(true)

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map(({ role, content }) => ({ role, content })),
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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, api, body]
  )

  return { messages, input, handleInputChange, handleSubmit, isLoading, error }
}

export default function PracticePage({ params }: PracticePageProps) {
  const { id } = use(params)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const body = useMemo(() => ({ lessonId: id }), [id])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body,
  })

  useEffect(() => {
    incrementPracticeCount()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href={`/lessons/${id}`}
          className="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
        >
          ← Back to lesson
        </Link>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Practice Mode</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-5 space-y-3">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-slate-400 text-sm mt-12"
          >
            <p className="font-medium">Start typing to begin practicing!</p>
            <p className="mt-1.5 text-slate-300">Write in romanized Hindi or English.</p>
          </motion.div>
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
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <span className="text-slate-400 text-sm">Typing...</span>
            </div>
          </motion.div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 mt-2">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type in Hindi (roman) or English..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm disabled:opacity-50 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
