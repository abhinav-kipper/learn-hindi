'use client'

// Shared chat hook used by both the per-lesson practice page and the
// persistent "talk to Chaina" companion. Posts a message list + an arbitrary
// `body` to `api`, expects a ChatReply back, and (optionally) persists the
// transcript via lib/chat-persistence keyed by `persistKey`.

import { useState, useEffect, useRef, useCallback, type FormEvent, type ChangeEvent } from 'react'
import { playSound } from '@/lib/sounds'
import type { ChatReply } from '@/lib/chat-schema'
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  type ChatTurn,
} from '@/lib/chat-persistence'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parsed?: ChatReply
  failed?: boolean
  retryAfterSeconds?: number
}

export function useChat({
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
          const errBody = await response.json().catch(() => ({}))
          const retryAfterSeconds: number | undefined =
            typeof errBody?.retryAfterSeconds === 'number' ? errBody.retryAfterSeconds : undefined
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
