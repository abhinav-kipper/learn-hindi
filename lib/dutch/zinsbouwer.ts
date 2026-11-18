// Zinsbouwer ("sentence builder") — the Dutch word-order game.
//
// Why this exists next to the older /play/sentence builder: that one is a fixed
// 12-sentence run with no idea what it is teaching. Word order is *the* thing
// English speakers get wrong in Dutch, and the exam marks it, so this one tags
// every sentence with the grammar concept it drills, levels them A1/A2/B1, and
// steers practice toward the concepts you keep missing.
//
// Two design decisions worth keeping:
//
//  1. ALTERNATE ORDERS ARE ACCEPTED. "Morgen ga ik naar de gemeente" and
//     "Ik ga morgen naar de gemeente" are both correct Dutch built from the
//     same tiles. Marking one of them wrong would teach a rule that does not
//     exist, so items carry an `accept` list and every entry in it is checked.
//  2. TILES ARE LOWERCASE. Content is stored lowercase (bar proper nouns) and
//     the built row is capitalised on screen. A capitalised tile would give
//     away which word starts the sentence, which is half the puzzle.

import raw from '@/content/dutch/zinsbouwer.json'

export type Level = 'A1' | 'A2' | 'B1'

export interface ConceptInfo {
  /** plain-English name shown on the chip */
  label: string
  /** the Dutch term, shown as a subtitle for exposure */
  nl: string
  /** one-line rule shown after an answer and in the rules list */
  rule: string
}

export interface SentenceEntry {
  id: string
  /** correct word order, lowercase apart from proper nouns, no final punctuation */
  nl: string
  /** English prompt. Ends in "?" when the Dutch is a question. */
  en: string
  level: Level
  concept: string
  /** why this order is right, shown on every answer */
  why: string
  /** other orders that are equally correct, same words */
  accept?: string[]
}

interface Corpus {
  id: string
  title: string
  subtitle_nl: string
  concepts: Record<string, ConceptInfo>
  items: SentenceEntry[]
}

const CORPUS = raw as Corpus

export const LEVELS: Level[] = ['A1', 'A2', 'B1']
export const SPRINT_SECONDS = 90

/** Function words that would too easily form a different true sentence. */
const UNSAFE_DECOYS = new Set(['niet', 'geen', 'wel', 'nooit', 'ook'])

export function getConcepts(): Record<string, ConceptInfo> {
  return CORPUS.concepts
}

export function getConcept(key: string): ConceptInfo | undefined {
  return CORPUS.concepts[key]
}

export function getItems(): SentenceEntry[] {
  return CORPUS.items
}

export function getItemById(id: string): SentenceEntry | undefined {
  return CORPUS.items.find((i) => i.id === id)
}

/** Words of a sentence, as tiles. */
export function tokens(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean)
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Every order we accept for an item: the canonical one plus its alternates. */
export function acceptedOrders(item: SentenceEntry): string[] {
  return [item.nl, ...(item.accept ?? [])]
}

/** Is this built word list a correct answer? Case and spacing are forgiving. */
export function checkBuild(item: SentenceEntry, built: string[]): boolean {
  const given = normalize(built.join(' '))
  if (!given) return false
  return acceptedOrders(item).some((order) => normalize(order) === given)
}

/** The sentence as a reader sees it: capitalised, with its final punctuation. */
export function displaySentence(item: SentenceEntry, order?: string): string {
  const s = order ?? item.nl
  const end = item.en.trim().endsWith('?') ? '?' : '.'
  return s.charAt(0).toUpperCase() + s.slice(1) + end
}

// ── Diagnosing a miss ────────────────────────────────────────────────────────

export interface MissReason {
  /** the sentence they actually built */
  yours: string
  /** one line naming the mistake they actually made */
  headline: string
}

function countOf(words: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const w of words) m.set(w, (m.get(w) ?? 0) + 1)
  return m
}

/** Words in `a` that `b` does not have enough of. */
function surplus(a: string[], b: string[]): string[] {
  const left = countOf(b.map((w) => w.toLowerCase()))
  const out: string[] = []
  for (const w of a) {
    const k = w.toLowerCase()
    const n = left.get(k) ?? 0
    if (n > 0) left.set(k, n - 1)
    else out.push(w)
  }
  return out
}

/** The accepted order closest to what they built, so the advice is about their attempt. */
function closestTarget(item: SentenceEntry, built: string[]): string[] {
  const lower = built.map((w) => w.toLowerCase())
  let best = tokens(item.nl)
  let bestScore = -1
  for (const order of acceptedOrders(item)) {
    const t = tokens(order)
    let score = 0
    for (let i = 0; i < Math.min(t.length, lower.length); i++) {
      if (t[i].toLowerCase() === lower[i]) score++
    }
    score -= Math.abs(t.length - lower.length)
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return best
}

/**
 * Say what went wrong with THIS attempt, not just what the right answer was.
 *
 * Every claim is checked against *all* accepted orders before it is made. A
 * sentence with two valid orders must not be told a word "goes last" when only
 * one of those orders puts it there, so the positional rules only fire when
 * every accepted order agrees. Otherwise it falls back to naming the first
 * place the attempt diverges, phrased as what this order wants rather than as
 * a rule of Dutch.
 */
export function explainMiss(item: SentenceEntry, built: string[]): MissReason {
  const yours = built.join(' ')
  const target = closestTarget(item, built)
  const extra = surplus(built, target)
  const missing = surplus(target, built)

  if (extra.length > 0 && missing.length > 0) {
    return {
      yours,
      headline: `You used \`${extra[0]}\`, which this sentence does not need, and left out \`${missing[0]}\`.`,
    }
  }
  if (extra.length > 0) {
    return { yours, headline: `\`${extra[0]}\` is a spare tile. This sentence does not use it.` }
  }
  if (missing.length > 0) {
    return { yours, headline: `You left out \`${missing[0]}\`.` }
  }

  const orders = acceptedOrders(item).map(tokens)
  const agreeAt = (i: number): string | null => {
    const at = (t: string[]) => (i < 0 ? t[t.length - 1] : t[i])
    const first = at(orders[0])?.toLowerCase()
    if (!first) return null
    return orders.every((t) => at(t)?.toLowerCase() === first) ? at(orders[0]) : null
  }

  // The signature Dutch error: something that belongs at the end is not there.
  const last = agreeAt(-1)
  if (last && built[built.length - 1].toLowerCase() !== last.toLowerCase()) {
    return {
      yours,
      headline: `\`${last}\` goes last here. You finished with \`${built[built.length - 1]}\`.`,
    }
  }

  // The other signature error: the conjugated verb is not in second place.
  const second = agreeAt(1)
  if (second && built.length > 2 && built[1].toLowerCase() !== second.toLowerCase()) {
    return { yours, headline: `\`${second}\` has to be the second word. You put \`${built[1]}\` there.` }
  }

  for (let i = 0; i < Math.min(target.length, built.length); i++) {
    if (target[i].toLowerCase() === built[i].toLowerCase()) continue
    if (i === 0) return { yours, headline: `This sentence starts with \`${target[0]}\`, not \`${built[0]}\`.` }
    return { yours, headline: `After \`${target[i - 1]}\` this order wants \`${target[i]}\`, not \`${built[i]}\`.` }
  }
  return { yours, headline: 'The words are right but the order is not.' }
}

// ── Drawing a queue ──────────────────────────────────────────────────────────

export interface Build {
  item: SentenceEntry
  /** shuffled tiles: the sentence's own words plus any decoys */
  tiles: { id: number; w: string }[]
  /** how many tiles are decoys (0 at A1) */
  decoys: number
}

/** Decoys per level. Harder level, more noise in the tray. */
export function decoyCount(level: Level): number {
  return level === 'A1' ? 0 : level === 'A2' ? 1 : 2
}

function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface DrawOptions {
  /** a single level, or null for a mix of everything */
  level: Level | null
  /** a single concept key, or null for all */
  concept?: string | null
  count: number
  /** inject randomness for tests */
  rnd?: () => number
  /** weight the draw toward concepts the learner keeps missing (default true) */
  weighted?: boolean
}

export function itemsFor(level: Level | null, concept?: string | null): SentenceEntry[] {
  return CORPUS.items.filter(
    (i) => (!level || i.level === level) && (!concept || i.concept === concept),
  )
}

/**
 * Weight per item: a concept you keep getting wrong comes up more often, an
 * untouched concept comes up a little more than one you have mastered.
 */
function weightOf(concept: string, stats: Stats): number {
  const s = stats[concept]
  if (!s || s.seen < 3) return 2
  const acc = s.correct / s.seen
  if (acc < 0.5) return 6
  if (acc < 0.8) return 3
  return 1
}

function weightedSample(items: SentenceEntry[], count: number, stats: Stats, rnd: () => number): SentenceEntry[] {
  const pool = [...items]
  const out: SentenceEntry[] = []
  while (pool.length > 0 && out.length < count) {
    const weights = pool.map((i) => weightOf(i.concept, stats))
    const total = weights.reduce((a, b) => a + b, 0)
    let r = rnd() * total
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        idx = i
        break
      }
      idx = i
    }
    out.push(pool[idx])
    pool.splice(idx, 1)
  }
  return out
}

/** Build a queue of sentences with their tile trays. */
export function drawQueue(opts: DrawOptions): Build[] {
  const { level, concept = null, count, rnd = Math.random, weighted = true } = opts
  const candidates = itemsFor(level, concept)
  if (candidates.length === 0) return []
  const stats = weighted ? getStats() : {}
  const chosen = weighted
    ? weightedSample(candidates, count, stats, rnd)
    : shuffle(candidates, rnd).slice(0, count)

  // Decoy pool: every word used anywhere, minus the risky function words.
  const allWords = [...new Set(CORPUS.items.flatMap((i) => tokens(i.nl)))].filter(
    (w) => !UNSAFE_DECOYS.has(w.toLowerCase()),
  )

  return chosen.map((item) => {
    const correct = tokens(item.nl)
    const n = decoyCount(item.level)
    const lower = new Set(correct.map((w) => w.toLowerCase()))
    const candidatesForDecoy = shuffle(
      allWords.filter((w) => !lower.has(w.toLowerCase())),
      rnd,
    )
    const decoys = candidatesForDecoy.slice(0, n)
    const tiles = shuffle([...correct, ...decoys], rnd).map((w, i) => ({ id: i, w }))
    return { item, tiles, decoys: decoys.length }
  })
}

// ── Per-concept stats (what drives the weighting and the weak list) ──────────

export type Stats = Record<string, { seen: number; correct: number }>

const STATS_KEY = 'dutch-zinsbouwer-stats'
const BEST_KEY = 'dutch-zinsbouwer-best'

export function getStats(): Stats {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Stats) : {}
  } catch {
    return {}
  }
}

function writeStats(s: Stats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function recordResult(concept: string, correct: boolean): Stats {
  const s = getStats()
  const prev = s[concept] ?? { seen: 0, correct: 0 }
  s[concept] = { seen: prev.seen + 1, correct: prev.correct + (correct ? 1 : 0) }
  writeStats(s)
  return s
}

export function conceptAccuracy(concept: string, stats: Stats = getStats()): number | null {
  const s = stats[concept]
  if (!s || s.seen === 0) return null
  return s.correct / s.seen
}

/** Concepts answered at least 3 times and still under 70% right, worst first. */
export function getWeakConcepts(stats: Stats = getStats()): string[] {
  return Object.keys(CORPUS.concepts)
    .filter((k) => {
      const s = stats[k]
      return s && s.seen >= 3 && s.correct / s.seen < 0.7
    })
    .sort((a, b) => (stats[a].correct / stats[a].seen) - (stats[b].correct / stats[b].seen))
}

/** How many sentences have been answered in total, across every concept. */
export function totalAnswered(stats: Stats = getStats()): number {
  return Object.values(stats).reduce((a, s) => a + s.seen, 0)
}

export function resetStats(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STATS_KEY)
  } catch {
    /* ignore */
  }
}

// ── Sprint best score, per level ─────────────────────────────────────────────

export type SprintBests = Partial<Record<Level | 'mixed', number>>

export function getSprintBests(): SprintBests {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(BEST_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as SprintBests) : {}
  } catch {
    return {}
  }
}

/** Keeps the higher score. A bad sprint never wipes out a good one. */
export function recordSprint(level: Level | 'mixed', score: number): SprintBests {
  const bests = getSprintBests()
  if ((bests[level] ?? -1) < score) {
    bests[level] = score
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(bests))
      } catch {
        /* ignore */
      }
    }
  }
  return bests
}
