import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  type ChatTurn,
} from '@/lib/chat-persistence'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    _dump: () => ({ ...store }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

const userTurn = (id: string, content: string): ChatTurn => ({
  id, role: 'user', content,
})

const assistantTurn = (id: string, reply: string, english: string): ChatTurn => ({
  id, role: 'assistant', content: reply, parsed: { reply, english },
})

describe('chat persistence', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips a simple conversation', () => {
    const turns = [
      userTurn('1', 'namaste'),
      assistantTurn('2', 'arey kya haal hai?', 'How are you?'),
    ]
    saveChatHistory('greetings', turns, 'hindi')
    expect(loadChatHistory('greetings', 'hindi')).toEqual(turns)
  })

  it('isolates by lessonId', () => {
    saveChatHistory('greetings', [userTurn('1', 'a')], 'hindi')
    saveChatHistory('ordering-food', [userTurn('2', 'b')], 'hindi')
    expect(loadChatHistory('greetings', 'hindi')).toHaveLength(1)
    expect(loadChatHistory('ordering-food', 'hindi')).toHaveLength(1)
    expect(loadChatHistory('greetings', 'hindi')[0].content).toBe('a')
  })

  it('isolates by language prefix', () => {
    saveChatHistory('greetings', [userTurn('1', 'hi-content')], 'hindi')
    saveChatHistory('dutch-cafe', [userTurn('2', 'nl-content')], 'dutch')
    expect(loadChatHistory('greetings', 'hindi')[0].content).toBe('hi-content')
    expect(loadChatHistory('greetings', 'dutch')).toEqual([])
    expect(loadChatHistory('dutch-cafe', 'dutch')[0].content).toBe('nl-content')
  })

  it('drops failed/transient placeholder messages on save', () => {
    const turns: ChatTurn[] = [
      userTurn('1', 'namaste'),
      // No parsed → looks like a failed assistant placeholder.
      { id: '2', role: 'assistant', content: '' },
      userTurn('3', 'second'),
      assistantTurn('4', 'haan', 'yes'),
    ]
    saveChatHistory('greetings', turns, 'hindi')
    const loaded = loadChatHistory('greetings', 'hindi')
    expect(loaded.map(t => t.id)).toEqual(['1', '3', '4'])
  })

  it('caps history at 50 turns (keeping the most recent)', () => {
    const turns: ChatTurn[] = []
    for (let i = 0; i < 80; i++) {
      turns.push(userTurn(`u${i}`, `msg ${i}`))
      turns.push(assistantTurn(`a${i}`, `reply ${i}`, `english ${i}`))
    }
    saveChatHistory('greetings', turns, 'hindi')
    const loaded = loadChatHistory('greetings', 'hindi')
    expect(loaded).toHaveLength(50)
    // Most recent kept — last id should be a79
    expect(loaded[loaded.length - 1].id).toBe('a79')
  })

  it('clearChatHistory empties the slot', () => {
    saveChatHistory('greetings', [userTurn('1', 'a'), assistantTurn('2', 'b', 'c')], 'hindi')
    clearChatHistory('greetings', 'hindi')
    expect(loadChatHistory('greetings', 'hindi')).toEqual([])
  })

  it('removes the key entirely when no real turns remain', () => {
    // Only a transient failed bubble — should not leave a stale empty array
    saveChatHistory('greetings', [{ id: '1', role: 'assistant', content: '' }], 'hindi')
    expect(localStorageMock._dump()['hindi-practice-chat-greetings']).toBeUndefined()
  })

  it('tolerates corrupted JSON in storage', () => {
    localStorage.setItem('hindi-practice-chat-greetings', 'not json {')
    expect(loadChatHistory('greetings', 'hindi')).toEqual([])
  })
})
