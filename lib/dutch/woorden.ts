import { computeNextSchedule } from '@/lib/review'
import a0 from '@/content/dutch/woorden/a0.json'
import a1 from '@/content/dutch/woorden/a1.json'
import a2 from '@/content/dutch/woorden/a2.json'

/**
 * Word Lab: the Dutch vocabulary section, built on what the research on
 * vocabulary acquisition actually supports rather than on what feels tidy.
 *
 * 1. **The unit of learning is a chunk, not a word.** Collocation studies find
 *    better retention when a sequence is presented whole than when the learner
 *    has to assemble it from parts, so the content stores `elke dag`, not
 *    `elke`, and `het boek`, not `boek`.
 * 2. **Every entry names its pattern.** Boers and Lindstromberg found that
 *    explicit attention to the lexical pattern raises retention, so `pattern`
 *    is a required field, not an optional note.
 * 3. **Nouns always carry their article.** L2 learners of Dutch systematically
 *    overuse `de` on neuter nouns, and both the research and the teaching
 *    literature converge on the same fix: store the article with the noun. The
 *    article drill below tracks de/het separately for that reason.
 * 4. **Spaced retrieval, not re-reading.** Scheduling reuses
 *    `computeNextSchedule` from `lib/review.ts`, the SM-2 implementation that
 *    already drives the Hindi daily review, so there is one scheduler in the
 *    codebase rather than two that can drift.
 * 5. **Mastery is counted in successful retrievals.** Roughly eight exposures
 *    is where a collocation starts to be processed at native-like speed, which
 *    is where `MASTERY_HITS` comes from.
 * 6. **Packs are frequency-ordered.** The high-frequency core is where the
 *    coverage is: around 2,000 word families reaches roughly 96% of informal
 *    spoken text, and informal speech is what the A2 exam is made of.
 */

export type Stage = 'A0' | 'A1' | 'A2'
export type Pos = 'noun' | 'verb' | 'phrase' | 'adjective' | 'adverb' | 'question' | 'connector' | 'number'

export interface WordExample {
  nl: string
  en: string
}

export interface WordEntry {
  id: string
  /** The thing actually learned: a whole chunk, never a bare headword. */
  chunk: string
  gloss: string
  pos: Pos
  pron: string
  /** The lexical pattern, named explicitly rather than left to be noticed. */
  pattern: string
  examples: WordExample[]
  tags: string[]
  /** Required on nouns. de/het is stored with the noun, never separately. */
  article?: 'de' | 'het'
  hook?: string
  origin?: string
  family?: string[]
  pitfall?: string
}

export interface WordPack {
  id: string
  stage: Stage
  title: string
  subtitle_nl: string
  blurb: string
  emoji: string
  entries: WordEntry[]
}

const packs = [
  ...(a0 as { packs: WordPack[] }).packs,
  ...(a1 as { packs: WordPack[] }).packs,
  ...(a2 as { packs: WordPack[] }).packs,
] as WordPack[]

export const STAGES: Stage[] = ['A0', 'A1', 'A2']

/** Successful retrievals before a chunk counts as known. */
export const MASTERY_HITS = 8

/** How many cards one review sitting serves. */
export const SESSION_SIZE = 12

const SRS_KEY = 'dutch-woorden-srs'
const MET_KEY = 'dutch-woorden-met'

// ─────────────────────────────────────────────────────────────── content

export function getPacks(): WordPack[] {
  return packs
}

export function getPack(id: string): WordPack | undefined {
  return packs.find((p) => p.id === id)
}

export function getPacksByStage(stage: Stage): WordPack[] {
  return packs.filter((p) => p.stage === stage)
}

export function getAllEntries(): WordEntry[] {
  return packs.flatMap((p) => p.entries)
}

export function getEntry(id: string): WordEntry | undefined {
  return getAllEntries().find((e) => e.id === id)
}

/** Nouns only, which is what the de/het drill draws from. */
export function getArticleEntries(): WordEntry[] {
  return getAllEntries().filter((e) => e.pos === 'noun' && e.article)
}

// ───────────────────────────────────────────────────────────── srs state

export interface WordRecord {
  id: string
  /** Successful retrievals so far. Mastery is counted in these. */
  hits: number
  misses: number
  interval: number
  easeFactor: number
  nextReviewAt: string
  lastReviewed: string
}

function readRecords(): Record<string, WordRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SRS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeRecords(records: Record<string, WordRecord>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(records))
  } catch {
    /* storage unavailable, progress is best-effort */
  }
}

export function getRecord(id: string): WordRecord | undefined {
  return readRecords()[id]
}

/**
 * Record one retrieval attempt. Scheduling is delegated to the shared SM-2
 * implementation so the two review systems in the app cannot drift apart.
 */
export function recordAttempt(id: string, correct: boolean, now: Date = new Date()): WordRecord {
  const records = readRecords()
  const prev = records[id]
  const { interval, easeFactor, nextReviewAt } = computeNextSchedule(
    prev?.interval ?? 0,
    prev?.easeFactor ?? 2.5,
    correct,
    now,
  )
  const next: WordRecord = {
    id,
    hits: (prev?.hits ?? 0) + (correct ? 1 : 0),
    misses: (prev?.misses ?? 0) + (correct ? 0 : 1),
    interval,
    easeFactor,
    nextReviewAt,
    lastReviewed: now.toISOString(),
  }
  records[id] = next
  writeRecords(records)
  return next
}

/** A chunk counts as known once it has survived MASTERY_HITS retrievals. */
export function isMastered(id: string): boolean {
  return (readRecords()[id]?.hits ?? 0) >= MASTERY_HITS
}

export function getMasteredCount(): number {
  const records = readRecords()
  return getAllEntries().filter((e) => (records[e.id]?.hits ?? 0) >= MASTERY_HITS).length
}

// ────────────────────────────────────────────────────── met (first exposure)

/** Chunks the learner has been introduced to. Only these enter the review queue. */
function readMet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(MET_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((v) => typeof v === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

export function isMet(id: string): boolean {
  return readMet().has(id)
}

export function markMet(ids: string[]): void {
  if (typeof window === 'undefined') return
  const s = readMet()
  ids.forEach((i) => s.add(i))
  try {
    localStorage.setItem(MET_KEY, JSON.stringify([...s]))
  } catch {
    /* storage unavailable */
  }
}

export function getMetCount(): number {
  const ids = new Set(getAllEntries().map((e) => e.id))
  return [...readMet()].filter((id) => ids.has(id)).length
}

export function getPackProgress(packId: string): { met: number; mastered: number; total: number } {
  const p = getPack(packId)
  if (!p) return { met: 0, mastered: 0, total: 0 }
  const met = readMet()
  const records = readRecords()
  return {
    met: p.entries.filter((e) => met.has(e.id)).length,
    mastered: p.entries.filter((e) => (records[e.id]?.hits ?? 0) >= MASTERY_HITS).length,
    total: p.entries.length,
  }
}

// ───────────────────────────────────────────────────────── the review queue

export type DrillKind = 'recall' | 'article' | 'cloze'

export interface ReviewCard {
  entry: WordEntry
  kind: DrillKind
}

/** Chunks that are met and due (or have never been reviewed). */
export function getDueEntries(now: Date = new Date()): WordEntry[] {
  const met = readMet()
  const records = readRecords()
  return getAllEntries().filter((e) => {
    if (!met.has(e.id)) return false
    const r = records[e.id]
    if (!r) return true
    return new Date(r.nextReviewAt).getTime() <= now.getTime()
  })
}

export function getDueCount(now: Date = new Date()): number {
  return getDueEntries(now).length
}

/**
 * Pick the drill kind for a chunk.
 *
 * Nouns alternate between typing the whole chunk and the de/het decision,
 * because the article is the part that stays wrong longest. An entry with a
 * usable example sentence can also be clozed. Everything else is typed recall,
 * which is productive rather than recognition: the generation effect means
 * producing the chunk beats picking it from a list.
 */
export function pickDrill(entry: WordEntry, seed: number): DrillKind {
  if (entry.pos === 'noun' && entry.article) return seed % 2 === 0 ? 'article' : 'recall'
  if (entry.examples.length > 0 && seed % 3 === 0) return 'cloze'
  return 'recall'
}

/**
 * Build one review sitting. Cards are interleaved across packs rather than
 * grouped, because blocking by topic inflates performance during practice and
 * depresses it later.
 */
export function buildSession(size = SESSION_SIZE, now: Date = new Date()): ReviewCard[] {
  const due = getDueEntries(now)
  if (due.length === 0) return []

  // Oldest due first, so nothing starves at the back of the queue.
  const records = readRecords()
  const byDue = [...due].sort((a, b) => {
    const ra = records[a.id]
    const rb = records[b.id]
    if (!ra && !rb) return 0
    if (!ra) return -1
    if (!rb) return 1
    return new Date(ra.nextReviewAt).getTime() - new Date(rb.nextReviewAt).getTime()
  })

  const chosen = byDue.slice(0, size)

  // Interleave: spread consecutive cards from the same pack apart where we can.
  const packOf = new Map<string, string>()
  for (const p of packs) for (const e of p.entries) packOf.set(e.id, p.id)
  const spread: WordEntry[] = []
  const pool = [...chosen]
  let lastPack = ''
  while (pool.length) {
    const i = pool.findIndex((e) => packOf.get(e.id) !== lastPack)
    const take = i === -1 ? 0 : i
    const [e] = pool.splice(take, 1)
    spread.push(e)
    lastPack = packOf.get(e.id) ?? ''
  }

  return spread.map((entry, i) => ({ entry, kind: pickDrill(entry, i) }))
}

// ─────────────────────────────────────────────────────────────── answering

/** Forgiving comparison: case, accents and surrounding punctuation are ignored. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkRecall(entry: WordEntry, answer: string): boolean {
  const given = normalize(answer)
  if (!given) return false
  if (given === normalize(entry.chunk)) return true
  // A noun typed without its article is not yet right: the article is the
  // point of storing the chunk in the first place.
  return false
}

export function checkArticle(entry: WordEntry, answer: 'de' | 'het'): boolean {
  return entry.article === answer
}

/** The example sentence with the chunk blanked out. */
export function buildCloze(entry: WordEntry): { sentence: string; answer: string } | null {
  for (const ex of entry.examples) {
    const idx = ex.nl.toLowerCase().indexOf(entry.chunk.toLowerCase())
    if (idx !== -1) {
      return {
        sentence: ex.nl.slice(0, idx) + '___' + ex.nl.slice(idx + entry.chunk.length),
        answer: entry.chunk,
      }
    }
  }
  return null
}

// ──────────────────────────────────────────────────────────────── overview

export function getStageProgress(stage: Stage): { met: number; mastered: number; total: number } {
  const entries = getPacksByStage(stage).flatMap((p) => p.entries)
  const met = readMet()
  const records = readRecords()
  return {
    met: entries.filter((e) => met.has(e.id)).length,
    mastered: entries.filter((e) => (records[e.id]?.hits ?? 0) >= MASTERY_HITS).length,
    total: entries.length,
  }
}

/** The next pack with anything left to meet, so the hub can offer one step. */
export function getNextPack(): WordPack | undefined {
  return packs.find((p) => getPackProgress(p.id).met < p.entries.length)
}
