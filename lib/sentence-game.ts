import type { SentenceGame, SentenceItem } from '@/types/game'
import { words } from '@/lib/gloss'
import sentenceBuilder from '@/content/games/hindi/sentence-builder.json'

const GAMES: SentenceGame[] = [sentenceBuilder as SentenceGame]

export function getSentenceGames(language: string): SentenceGame[] {
  return GAMES.filter((g) => g.language === language)
}

export function getSentenceGameById(id: string): SentenceGame | undefined {
  return GAMES.find((g) => g.id === id)
}

export interface Build {
  english: string
  /** correct word order */
  correct: string[]
  /** scrambled tiles (correct words + any distractors), each with a stable id */
  tiles: { id: number; w: string }[]
}

const PER_ROUND = 4 // 3 rounds (easy / medium / hard) of 4 = 12 sentences
const LEVELS: SentenceItem['level'][] = ['easy', 'medium', 'hard']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * One game = 3 rounds of PER_ROUND sentences, ramping in difficulty:
 * round 1 = easy (exact tiles), round 2 = medium (+1 decoy), round 3 = hard
 * (+2 decoys). Decoys are random words drawn from the rest of the sentence pool.
 */
export function drawSentenceGame(game: SentenceGame): Build[] {
  const pool = [...new Set(game.items.flatMap((it) => words(it.hindi)))]
  const builds: Build[] = []
  LEVELS.forEach((level, round) => {
    const chosen = shuffle(game.items.filter((it) => it.level === level)).slice(0, PER_ROUND)
    for (const it of chosen) {
      const correct = words(it.hindi)
      const decoys: string[] = []
      const candidates = shuffle(pool.filter((w) => !correct.includes(w)))
      for (let i = 0; i < round && i < candidates.length; i++) decoys.push(candidates[i])
      const tiles = shuffle([...correct, ...decoys]).map((w, i) => ({ id: i, w }))
      builds.push({ english: it.english, correct, tiles })
    }
  })
  return builds
}

export const SENTENCE_TOTAL = PER_ROUND * LEVELS.length // 12
export const SENTENCE_PER_ROUND = PER_ROUND

// ── Best score (per language prefix) ─────────────────────────────────────────

const bestKey = (prefix: string, id: string) => `${prefix}-game-${id}-best`

export interface SentenceBest {
  score: number
  total: number
}

export function getSentenceBest(prefix: string, id: string): SentenceBest | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(bestKey(prefix, id))
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p?.score === 'number' && typeof p?.total === 'number') return p
    return null
  } catch {
    return null
  }
}

export function recordSentenceResult(prefix: string, id: string, score: number, total: number): SentenceBest {
  const prev = getSentenceBest(prefix, id)
  const better = !prev || score > prev.score
  const best = better ? { score, total } : prev
  if (better && typeof window !== 'undefined') {
    try {
      localStorage.setItem(bestKey(prefix, id), JSON.stringify(best))
    } catch {
      /* ignore */
    }
  }
  return best as SentenceBest
}
