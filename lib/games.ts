import type { Duel, DuelItem } from '@/types/game'
import genderDuel from '@/content/games/hindi/gender-duel.json'

const DUELS: Duel[] = [genderDuel as Duel]

/** All duels for a language (Dutch duels can be added later). */
export function getDuels(language: string): Duel[] {
  return DUELS.filter((d) => d.language === language)
}

export function getDuelById(id: string): Duel | undefined {
  return DUELS.find((d) => d.id === id)
}

/**
 * Draw `count` items for one play: a Fisher-Yates shuffle, capped at the pool
 * size (so a 52-item duel with rounds=30 gives a fresh 30 each time).
 */
export function drawDuelRound(duel: Duel, count = duel.rounds ?? 30): DuelItem[] {
  const pool = [...duel.items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

// ── Best-score persistence (per language prefix) ─────────────────────────────

const bestKey = (prefix: string, id: string) => `${prefix}-game-${id}-best`

export interface DuelBest {
  score: number
  total: number
}

export function getDuelBest(prefix: string, id: string): DuelBest | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(bestKey(prefix, id))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.score === 'number' && typeof parsed?.total === 'number') return parsed
    return null
  } catch {
    return null
  }
}

/** Save a result if it beats the stored best (by score, then by accuracy). */
export function recordDuelResult(prefix: string, id: string, score: number, total: number): DuelBest {
  const prev = getDuelBest(prefix, id)
  const isBetter =
    !prev ||
    score > prev.score ||
    (score === prev.score && total > 0 && score / total > prev.score / Math.max(prev.total, 1))
  const best = isBetter ? { score, total } : prev
  if (isBetter && typeof window !== 'undefined') {
    try {
      localStorage.setItem(bestKey(prefix, id), JSON.stringify(best))
    } catch {
      /* ignore */
    }
  }
  return best as DuelBest
}
