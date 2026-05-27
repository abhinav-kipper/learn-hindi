#!/usr/bin/env node
// scripts/generate-vocab.mjs
//
// One-shot vocab expansion generator. Drafts N new words for a single
// category via Gemini, validates them against the existing VocabWord
// schema, writes the draft to content/vocabulary-draft.json. The user
// reviews and merges the entries into content/vocabulary.json manually.
//
// Usage:
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-vocab.mjs --category food --count 35
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-vocab.mjs --category everyday --count 35 --dry-run

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

const args = process.argv.slice(2)
const categoryId =
  args.find((a) => a.startsWith('--category='))?.split('=')[1] ??
  (args.includes('--category') ? args[args.indexOf('--category') + 1] : null)
const countArg =
  args.find((a) => a.startsWith('--count='))?.split('=')[1] ??
  (args.includes('--count') ? args[args.indexOf('--count') + 1] : '35')
const count = Number(countArg)
const dryRun = args.includes('--dry-run')

if (!categoryId) {
  console.error('Usage: node scripts/generate-vocab.mjs --category <id> [--count N] [--dry-run]')
  process.exit(2)
}
if (!Number.isFinite(count) || count < 1 || count > 100) {
  console.error('--count must be a finite number between 1 and 100')
  process.exit(2)
}

const VOCAB_PATH = join(repoRoot, 'content', 'vocabulary.json')
const DRAFT_PATH = join(repoRoot, 'content', 'vocabulary-draft.json')

const vocabRaw = JSON.parse(readFileSync(VOCAB_PATH, 'utf8'))
const category = vocabRaw.categories.find((c) => c.id === categoryId)
if (!category) {
  console.error(
    `Unknown category '${categoryId}'. Available: ${vocabRaw.categories.map((c) => c.id).join(', ')}`,
  )
  process.exit(2)
}

const existingHindi = new Set(category.words.map((w) => w.hindi))

const STYLE_GUIDE = `
ROMANIZATION RULES (canonical from CONTENT.md):
- No Devanagari. Romanized Hindi only.
- 'chh' not 'cc' for aspirated cha (e.g., 'achchha', 'pakka' is fine).
- Single-vowel endings: 'karta' (not 'kartaa'), 'doosra' (not 'dusra'), 'woh' (not 'wo'), 'hum' (not 'ham').
- Pronunciation hints use lowercase hyphenated syllables with CAPS on stressed syllables (e.g., 'naa-MUS-tay').
- A1-A2 difficulty: everyday vocab, no obscure literary words.

VOCAB WORD SCHEMA (must match exactly):
- hindi: the romanized headword (string)
- pronunciation: hyphenated syllable hint (string)
- english: short English gloss (string, lowercase preferred unless proper noun)
- example: one short Hindi example sentence using the word, romanized (string)
- type: part of speech in lowercase (string) — e.g., 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'phrase'

STYLE:
- No AI clichés ('certainly', 'absolutely', emojis).
- Examples should sound like real conversational Hindi, not textbook prose.
- Avoid duplicates of the existing words listed below.
`

const VocabWordSchema = z.object({
  hindi: z.string().min(1),
  pronunciation: z.string().min(1),
  english: z.string().min(1),
  example: z.string().min(1),
  type: z.string().min(1),
})
const ResponseSchema = z.object({
  words: z.array(VocabWordSchema).min(1),
})

const existingList = category.words.map((w) => `- ${w.hindi} (${w.english})`).join('\n')

const prompt = `You are a Hindi vocab content author for a romanized-Hindi learning app.

Generate ${count} NEW vocab words for the "${category.title}" category (id: ${category.id}, emoji ${category.emoji}).

${STYLE_GUIDE}

The following words ALREADY EXIST in this category — do NOT include any of them or close variants:
${existingList}

Return exactly ${count} words.`

const model = google('gemini-2.5-flash')

console.log(`Generating ${count} new '${categoryId}' words via Gemini…`)
const { object } = await generateObject({
  model,
  schema: ResponseSchema,
  prompt,
})

const filtered = object.words.filter((w) => !existingHindi.has(w.hindi))
const dropped = object.words.length - filtered.length
if (dropped > 0) {
  console.log(`Dropped ${dropped} duplicates of existing words.`)
}

const draftPayload = {
  generatedAt: new Date().toISOString(),
  categoryId: category.id,
  categoryTitle: category.title,
  emoji: category.emoji,
  count: filtered.length,
  words: filtered,
}

if (dryRun) {
  console.log('\n--- DRY RUN — would write to', DRAFT_PATH, '---')
  console.log(JSON.stringify(draftPayload, null, 2))
  process.exit(0)
}

let existingDraft = []
if (existsSync(DRAFT_PATH)) {
  try {
    const raw = JSON.parse(readFileSync(DRAFT_PATH, 'utf8'))
    existingDraft = Array.isArray(raw) ? raw : (raw.batches ?? [])
  } catch {
    existingDraft = []
  }
}

const merged = {
  batches: [...existingDraft.filter((b) => b.categoryId !== category.id), draftPayload],
}
writeFileSync(DRAFT_PATH, JSON.stringify(merged, null, 2) + '\n')

console.log(`\n✓ Wrote ${filtered.length} draft words to ${DRAFT_PATH}.`)
console.log(
  `Review the draft, then merge approved words into content/vocabulary.json under category '${category.id}'.`,
)
