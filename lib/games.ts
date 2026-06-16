import type { Duel, DuelItem } from '@/types/game'
import genderDuel from '@/content/games/hindi/gender-duel.json'
import neRuleDuel from '@/content/games/hindi/ne-rule.json'
import haiHainDuel from '@/content/games/hindi/hai-hain.json'
import registerDuel from '@/content/games/hindi/register-duel.json'
import deHetDuel from '@/content/games/dutch/de-het.json'
import hebbenZijnDuel from '@/content/games/dutch/hebben-zijn.json'

const DUELS: Duel[] = [
  genderDuel as Duel,
  neRuleDuel as Duel,
  haiHainDuel as Duel,
  registerDuel as Duel,
  deHetDuel as Duel,
  hebbenZijnDuel as Duel,
]

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

// ── Resume (per-round checkpoint) ────────────────────────────────────────────
// Saved when a round of 10 completes, so the player can pick up where they left
// off. Cleared when the game finishes or is restarted.

const progressKey = (prefix: string, id: string) => `${prefix}-game-${id}-progress`

export interface DuelProgress {
  items: DuelItem[]
  index: number
  score: number
  combo: number
}

export function getDuelProgress(prefix: string, id: string): DuelProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(progressKey(prefix, id))
    if (!raw) return null
    const p = JSON.parse(raw)
    if (Array.isArray(p?.items) && typeof p?.index === 'number' && p.index > 0 && p.index < p.items.length) {
      return p
    }
    return null
  } catch {
    return null
  }
}

export function saveDuelProgress(prefix: string, id: string, p: DuelProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(progressKey(prefix, id), JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

export function clearDuelProgress(prefix: string, id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(progressKey(prefix, id))
  } catch {
    /* ignore */
  }
}
