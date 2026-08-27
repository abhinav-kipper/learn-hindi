// Dutch concept cheatsheets: a reference-plus-drill layer that sits beside the
// exam modules. Content lives in content/dutch/cheatsheet/*.json, one file per
// group, and is flattened here into a single ordered topic list.

import startData from '@/content/dutch/cheatsheet/01-start.json'
import grammarData from '@/content/dutch/cheatsheet/02-grammar.json'
import peopleData from '@/content/dutch/cheatsheet/03-people.json'
import sentencesData from '@/content/dutch/cheatsheet/04-sentences.json'
import timeData from '@/content/dutch/cheatsheet/05-time.json'

export const STUDIED_KEY = 'dutch-cheatsheet-studied'
export const SCORES_KEY = 'dutch-cheatsheet-scores'
export const MIXED_REVIEW_SIZE = 15
export const PASS_THRESHOLD = 0.8

// ── Content shapes ──────────────────────────────────────────────────────────

export interface CheatTableBlock {
  kind: 'table'
  title?: string
  headers: string[]
  rows: string[][]
  note?: string
}

// Each block gets a single literal `kind` so TypeScript can narrow the union
// cleanly at every render site.
interface CheatProseBase {
  title?: string
  body: string
}

export interface CheatRuleBlock extends CheatProseBase {
  kind: 'rule'
}
export interface CheatTipBlock extends CheatProseBase {
  kind: 'tip'
}
export interface CheatPitfallBlock extends CheatProseBase {
  kind: 'pitfall'
}

export interface CheatPair {
  nl: string
  en: string
  note?: string
}

interface CheatListBase {
  title?: string
  items: CheatPair[]
}

export interface CheatExamplesBlock extends CheatListBase {
  kind: 'examples'
}
export interface CheatVocabBlock extends CheatListBase {
  kind: 'vocab'
}

export type CheatBlock =
  | CheatTableBlock
  | CheatRuleBlock
  | CheatTipBlock
  | CheatPitfallBlock
  | CheatExamplesBlock
  | CheatVocabBlock

export interface CheatSection {
  heading: string
  blocks: CheatBlock[]
}

export interface McqExercise {
  id: string
  kind: 'mcq'
  prompt: string
  options: string[]
  correct: number
  explain: string
}

export interface FillExercise {
  id: string
  kind: 'fill'
  prompt: string
  before?: string
  after?: string
  answers: string[]
  explain: string
}

export interface OrderExercise {
  id: string
  kind: 'order'
  prompt: string
  words: string[]
  answer: string[]
  explain: string
}

export type Exercise = McqExercise | FillExercise | OrderExercise

export interface CheatTopic {
  id: string
  title: string
  subtitle_nl: string
  emoji: string
  summary: string
  sections: CheatSection[]
  key_takeaways: string[]
  exercises: Exercise[]
}

export interface CheatGroup {
  id: string
  title: string
  subtitle_nl: string
  blurb: string
  emoji: string
}

export interface CheatGroupWithTopics extends CheatGroup {
  topics: CheatTopic[]
}

export interface TopicScore {
  best: number
  total: number
  attempts: number
  lastTs: number
}

interface GroupFile {
  group: CheatGroup
  topics: CheatTopic[]
}

const FILES = [startData, grammarData, peopleData, sentencesData, timeData] as unknown as GroupFile[]

// ── Reads ───────────────────────────────────────────────────────────────────

export function getGroups(): CheatGroupWithTopics[] {
  return FILES.map((f) => ({ ...f.group, topics: f.topics }))
}

export function getTopics(): CheatTopic[] {
  return FILES.flatMap((f) => f.topics)
}

export function getTopicById(id: string): CheatTopic | undefined {
  return getTopics().find((t) => t.id === id)
}

export function getGroupOfTopic(topicId: string): CheatGroupWithTopics | undefined {
  return getGroups().find((g) => g.topics.some((t) => t.id === topicId))
}

/** The topic after this one in reading order, for the "next up" link. */
export function getNextTopic(topicId: string): CheatTopic | undefined {
  const all = getTopics()
  const i = all.findIndex((t) => t.id === topicId)
  if (i === -1 || i === all.length - 1) return undefined
  return all[i + 1]
}

export function getTotalExerciseCount(): number {
  return getTopics().reduce((n, t) => n + t.exercises.length, 0)
}

// ── Drill sets ──────────────────────────────────────────────────────────────

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function drawTopicDrill(topicId: string): Exercise[] {
  const topic = getTopicById(topicId)
  if (!topic) return []
  return shuffle(topic.exercises)
}

/** A mixed set across every topic, weighted towards nothing in particular. */
export function drawMixedReview(size: number = MIXED_REVIEW_SIZE): Exercise[] {
  return shuffle(getTopics().flatMap((t) => t.exercises)).slice(0, size)
}

/** Scrambled word tiles for an order exercise, never in the correct order. */
export function scrambleWords(ex: OrderExercise): string[] {
  if (ex.words.length < 2) return [...ex.words]
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = shuffle(ex.words)
    if (candidate.join(' ') !== ex.answer.join(' ')) return candidate
  }
  // Deterministic fallback so we never hand back the answer itself.
  return [...ex.words].reverse()
}

// ── Answer checking ─────────────────────────────────────────────────────────

/** Lower-case, strip punctuation and collapse whitespace, so typing is forgiving. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isCorrect(ex: Exercise, response: number | string | string[]): boolean {
  if (ex.kind === 'mcq') return response === ex.correct
  if (ex.kind === 'fill') {
    if (typeof response !== 'string') return false
    const given = normalizeAnswer(response)
    if (!given) return false
    return ex.answers.some((a) => normalizeAnswer(a) === given)
  }
  if (!Array.isArray(response)) return false
  return normalizeAnswer(response.join(' ')) === normalizeAnswer(ex.answer.join(' '))
}

export function scoreDrill(
  exercises: Exercise[],
  responses: Array<number | string | string[] | null>,
): { score: number; total: number; passed: boolean } {
  let score = 0
  exercises.forEach((ex, i) => {
    const r = responses[i]
    if (r !== null && r !== undefined && isCorrect(ex, r)) score++
  })
  const total = exercises.length
  return { score, total, passed: total > 0 && score / total >= PASS_THRESHOLD }
}

// ── Progress ────────────────────────────────────────────────────────────────

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

function readStudied(): Set<string> {
  const w = safeWindow()
  if (!w) return new Set()
  const raw = w.localStorage.getItem(STUDIED_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeStudied(set: Set<string>): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(STUDIED_KEY, JSON.stringify([...set]))
}

export function markTopicStudied(id: string): void {
  const set = readStudied()
  set.add(id)
  writeStudied(set)
}

export function unmarkTopicStudied(id: string): void {
  const set = readStudied()
  set.delete(id)
  writeStudied(set)
}

export function isTopicStudied(id: string): boolean {
  return readStudied().has(id)
}

export function getStudiedCount(): number {
  return readStudied().size
}

export function getScores(): Record<string, TopicScore> {
  const w = safeWindow()
  if (!w) return {}
  const raw = w.localStorage.getItem(SCORES_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, TopicScore>
  } catch {
    return {}
  }
}

export function getTopicScore(topicId: string): TopicScore | undefined {
  return getScores()[topicId]
}

/** Records a drill result, keeping the best ratio ever achieved for the topic. */
export function recordDrillResult(topicId: string, score: number, total: number): TopicScore {
  const w = safeWindow()
  const all = getScores()
  const prev = all[topicId]
  const prevRatio = prev && prev.total > 0 ? prev.best / prev.total : -1
  const ratio = total > 0 ? score / total : 0
  const keepNew = !prev || ratio > prevRatio
  const next: TopicScore = {
    best: keepNew ? score : prev.best,
    total: keepNew ? total : prev.total,
    attempts: (prev?.attempts ?? 0) + 1,
    lastTs: Date.now(),
  }
  all[topicId] = next
  if (w) w.localStorage.setItem(SCORES_KEY, JSON.stringify(all))
  return next
}

/** Topics the learner has read but never scored a pass on, best candidates for revision. */
export function getWeakTopics(): CheatTopic[] {
  const scores = getScores()
  return getTopics().filter((t) => {
    const s = scores[t.id]
    if (!s || s.total === 0) return false
    return s.best / s.total < PASS_THRESHOLD
  })
}

export interface CheatsheetProgress {
  studied: number
  totalTopics: number
  drilled: number
  passed: number
}

export function getOverallProgress(): CheatsheetProgress {
  const topics = getTopics()
  const scores = getScores()
  let drilled = 0
  let passed = 0
  for (const t of topics) {
    const s = scores[t.id]
    if (!s || s.total === 0) continue
    drilled++
    if (s.best / s.total >= PASS_THRESHOLD) passed++
  }
  return { studied: getStudiedCount(), totalTopics: topics.length, drilled, passed }
}
