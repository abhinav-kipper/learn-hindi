/**
 * Persists in-progress practice conversations so closing and reopening the
 * practice page resumes the chat instead of starting a new session.
 *
 * Storage key: `{prefix}-practice-chat-{lessonId}` → serialized ChatTurn[]
 * Failed / transient placeholder messages are NOT persisted — only successful
 * exchanges with parsed assistant replies.
 *
 * Cap: 50 turns (25 user + 25 assistant) to keep localStorage bounded.
 */
import type { ChatReply } from '@/lib/chat-schema'

export interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  parsed?: ChatReply
}

const MAX_TURNS = 50

function storageKey(prefix: string, lessonId: string): string {
  return `${prefix}-practice-chat-${lessonId}`
}

export function loadChatHistory(lessonId: string, prefix = 'hindi'): ChatTurn[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(storageKey(prefix, lessonId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is ChatTurn =>
        t && typeof t.id === 'string' && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string',
    )
  } catch {
    return []
  }
}

export function saveChatHistory(lessonId: string, turns: ChatTurn[], prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  // Strip transient fields (failed placeholders, retryAfterSeconds) before persisting.
  const cleaned: ChatTurn[] = turns
    .filter(t => t.role === 'user' || (t.role === 'assistant' && !!t.parsed))
    .map(t => ({ id: t.id, role: t.role, content: t.content, parsed: t.parsed }))
    .slice(-MAX_TURNS)
  if (cleaned.length === 0) {
    localStorage.removeItem(storageKey(prefix, lessonId))
    return
  }
  localStorage.setItem(storageKey(prefix, lessonId), JSON.stringify(cleaned))
}

export function clearChatHistory(lessonId: string, prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(prefix, lessonId))
}
