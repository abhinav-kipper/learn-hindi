// Chaina-as-friend memory. A compact, per-language "Memory Card" persisted in
// localStorage that the companion chat injects into its system prompt so she
// remembers you across sessions (your name is in the profile; this holds the
// relationship — facts, open threads, the running gist, when you last talked).
//
// Storage key: `${prefix}-chaina-memory` → serialized ChainaMemory.
// Kept tiny on purpose so per-turn token cost stays flat: facts cap 20,
// threads cap 8.

export interface ChainaMemory {
  /** Durable personal facts ("has a sister Priya", "works in tech"). */
  facts: string[]
  /** Open loops to follow up on ("job interview Friday"). */
  threads: string[]
  /** 2-3 sentence gist of the relationship so far. */
  runningSummary: string
  /** What you last talked about — seeds the next opener. */
  lastTopic: string
  /** ISO timestamp of the last chat; drives the returning-callback opener. */
  lastSeenAt: string
  /** How many times you've talked. */
  chatCount: number
}

/** The shape the write-back summarization call returns. All fields optional. */
export interface MemoryUpdate {
  newFacts?: string[]
  newThreads?: string[]
  /** Threads that got resolved this session and should be dropped. */
  resolvedThreads?: string[]
  runningSummary?: string
  lastTopic?: string
}

export const FACTS_CAP = 20
export const THREADS_CAP = 8

function key(prefix: string): string {
  return `${prefix}-chaina-memory`
}

export function emptyMemory(): ChainaMemory {
  return { facts: [], threads: [], runningSummary: '', lastTopic: '', lastSeenAt: '', chatCount: 0 }
}

/** Dedupe case-insensitively, keep the LAST occurrence, then keep the last `cap`. */
function dedupeCap(items: string[], cap: number): string[] {
  const seen = new Map<string, string>()
  for (const raw of items) {
    const v = (raw ?? '').trim()
    if (!v) continue
    seen.set(v.toLowerCase(), v) // last wins
  }
  return [...seen.values()].slice(-cap)
}

export function getMemory(prefix = 'hindi'): ChainaMemory {
  if (typeof window === 'undefined') return emptyMemory()
  try {
    const raw = localStorage.getItem(key(prefix))
    if (!raw) return emptyMemory()
    const p = JSON.parse(raw)
    return {
      facts: Array.isArray(p.facts) ? p.facts.filter((x: unknown) => typeof x === 'string') : [],
      threads: Array.isArray(p.threads) ? p.threads.filter((x: unknown) => typeof x === 'string') : [],
      runningSummary: typeof p.runningSummary === 'string' ? p.runningSummary : '',
      lastTopic: typeof p.lastTopic === 'string' ? p.lastTopic : '',
      lastSeenAt: typeof p.lastSeenAt === 'string' ? p.lastSeenAt : '',
      chatCount: typeof p.chatCount === 'number' ? p.chatCount : 0,
    }
  } catch {
    return emptyMemory()
  }
}

export function saveMemory(mem: ChainaMemory, prefix = 'hindi'): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key(prefix), JSON.stringify(mem))
  } catch {
    /* ignore quota / serialization errors */
  }
}

/**
 * Apply a write-back update from the summarization call: merge + dedupe + cap
 * facts/threads, drop resolved threads, replace summary/lastTopic when given,
 * bump chatCount, and stamp lastSeenAt = now. Pure — returns the next memory.
 */
export function mergeMemory(current: ChainaMemory, update: MemoryUpdate, now: Date = new Date()): ChainaMemory {
  const resolved = new Set((update.resolvedThreads ?? []).map((t) => t.trim().toLowerCase()))
  const keptThreads = current.threads.filter((t) => !resolved.has(t.trim().toLowerCase()))
  return {
    facts: dedupeCap([...current.facts, ...(update.newFacts ?? [])], FACTS_CAP),
    threads: dedupeCap([...keptThreads, ...(update.newThreads ?? [])], THREADS_CAP),
    runningSummary:
      typeof update.runningSummary === 'string' && update.runningSummary.trim()
        ? update.runningSummary.trim()
        : current.runningSummary,
    lastTopic:
      typeof update.lastTopic === 'string' && update.lastTopic.trim()
        ? update.lastTopic.trim()
        : current.lastTopic,
    lastSeenAt: now.toISOString(),
    chatCount: current.chatCount + 1,
  }
}

/** Convenience: merge an update and persist it. Returns the saved memory. */
export function applyRemember(update: MemoryUpdate, prefix = 'hindi', now: Date = new Date()): ChainaMemory {
  const next = mergeMemory(getMemory(prefix), update, now)
  saveMemory(next, prefix)
  return next
}

/** True when it's been at least `gapHours` since the last chat (or never). */
export function isReturning(mem: ChainaMemory, gapHours = 12, now: Date = new Date()): boolean {
  if (!mem.lastSeenAt) return true
  const last = new Date(mem.lastSeenAt).getTime()
  if (Number.isNaN(last)) return true
  return now.getTime() - last >= gapHours * 60 * 60 * 1000
}
