#!/usr/bin/env node
// scripts/generate-lesson.mjs
//
// Weekly content generator. Picks the next topic off content/lesson-queue.json,
// asks Gemini for a situational lesson JSON + a themed vocab batch, validates,
// writes them, patches lib/lessons.ts, and bumps the queue.
//
// Triggered by .github/workflows/generate-content.yml every Monday at
// 09:00 UTC. Can also be run locally:
//
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-lesson.mjs --dry-run
//   GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-lesson.mjs --topic=doctor-visit
//
// On success, prints the generated lesson id + vocab category id, and writes
// files to disk. The workflow then creates a branch + PR for review.
//
// On failure (queue empty, Gemini parse error, schema validation fail), exits
// non-zero with a clear error message. The workflow opens a GitHub issue
// with the error in the body instead of creating a PR.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const topicOverride = args.find((a) => a.startsWith('--topic='))?.split('=')[1]

const QUEUE_PATH = join(repoRoot, 'content', 'lesson-queue.json')
const LESSONS_DIR = join(repoRoot, 'content', 'lessons')
const VOCAB_PATH = join(repoRoot, 'content', 'vocabulary.json')
const LIB_LESSONS_PATH = join(repoRoot, 'lib', 'lessons.ts')

// ─────────────────────────────────────────────────────────────
// Style guide pulled out of CONTENT.md so the model sees it inline.
// Keep this in sync if the canonical style guide changes.
// ─────────────────────────────────────────────────────────────
const STYLE_GUIDE = `
REGISTER POLICY (Hindi has 3 forms of "you" — get this right):
- DEFAULT: "aap" (respectful). Use for shopkeepers, auto drivers, strangers, elders, anyone you're not close with.
- "tum": friendly/peer (chai with a mate, classmates, weekend plans).
- "tu": intimate/playful (sibling teasing, very close friend, anger). Use sparingly.
- Teaching exceptions: lesson IDs "01-greetings" and "06-pronouns-verbs" explicitly teach the contrast — only there can "tu" phrases appear, and they MUST be tagged "(very informal)" or "(intimate)" in the english field.
- The practice tutor flags register-mismatches as corrections; authored content must never model those mismatches.

ROMANIZATION RULES (must follow exactly):
- ASCII romanization only — NO Devanagari script.
- Single-vowel endings: write "karta" not "kartaa", "karunga" not "karoongaa".
- Use "chh" for छ sound (e.g. "chhat").
- Use "dh" for ध (e.g. "dhanyavaad"), "th" for थ (e.g. "thoda").
- Use "aa" only when ambiguity matters ("haan" vs "han").

PRONUNCIATION FIELD:
- SYLLABLE-stress format. Hyphens between syllables. CAPS on the stressed syllable.
- Example: "BA-zaar ja-NA hai", "na-mas-TE AUN-ty ji".

GENDER:
- Where verb endings differ by speaker gender, show both: "main jaa raha hoon / jaa rahi hoon".
- For single-form examples, use FEMININE ("-i", "-rahi", "-gayi") — the app defaults users to female gender.

CONTENT STYLE:
- Phrases should sound like real conversation, not textbook Hindi. Use fillers (arrey, accha, matlab, yaar, bas, dekho, na, haan).
- 2-3 Hindi sentences per phrase MAX. One is often best.
- Avoid textbook connectives in phrases: "iss prakar", "isliye", "parantu", "kintu". Put those in grammar_notes only.
- Each phrase has a "context" field explaining the social nuance.
- Culture notes give one practical tip about social dynamics, not generic facts.
- references[] field is REQUIRED — cite at least one specific chapter/lesson from the canonical sources below.
`.trim()

const SOURCES = `
CANONICAL SOURCES — ground your phrases in these, not invented examples:
- Snell & Weightman "Teach Yourself Hindi" — 22 chapters, grammar-progressive. Good for grammar accuracy and idiomatic patterns. Slightly formal in tone — soften when porting.
- Afroz Taj "A Door Into Hindi" (UNC Chapel Hill, taj.oasis.unc.edu) — 24 video lessons with transcripts. Conversational, North Indian register. Usually drop-in usable.
- McGregor "Outline of Hindi Grammar" — Oxford. Use ONLY for grammar disambiguation. Never lift phrases from it (too academic-formal).

Always populate references[] with at least one specific chapter/lesson like "Snell & Weightman Ch. 11" or "Afroz Taj Lesson 9".
`.trim()

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────
const PhraseSchema = z.object({
  hindi: z.string(),
  english: z.string(),
  context: z.string(),
  pronunciation: z.string(),
})

const SkillBreakdownSchema = z.object({
  skill: z.string(),
  explanation: z.string(),
  more_examples: z
    .array(z.object({ hindi: z.string(), english: z.string() }))
    .min(3)
    .max(6),
})

const LessonSchema = z.object({
  id: z.string().min(2),
  title: z.string(),
  situation: z.string(),
  skills: z.array(z.string()).min(2).max(5),
  phrases: z.array(PhraseSchema).min(8).max(10),
  grammar_notes: z.array(z.string()).min(3).max(6),
  culture_notes: z.array(z.string()).min(2).max(4),
  skill_breakdown: z.array(SkillBreakdownSchema).min(2).max(3),
  practice_prompt: z.string(),
  references: z.array(z.string()).min(1),
})

const VocabWordSchema = z.object({
  hindi: z.string(),
  pronunciation: z.string(),
  english: z.string(),
  example: z.string(),
  type: z.string(),
})

const VocabBatchSchema = z.object({
  category: z.enum(['everyday', 'emotions', 'food', 'people', 'time', 'actions']),
  words: z.array(VocabWordSchema).min(8).max(12),
})

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function nextLessonNumber() {
  const files = readdirSync(LESSONS_DIR).filter((f) => /^\d{2}-.+\.json$/.test(f))
  const nums = files.map((f) => parseInt(f.slice(0, 2), 10)).sort((a, b) => a - b)
  return (nums.at(-1) ?? 0) + 1
}

function buildLessonPrompt(topic, existingLessons) {
  const sample = existingLessons[0]
  return `You are a Hindi curriculum writer. Generate ONE situational Hindi
lesson as JSON, matching the schema exactly.

TOPIC: ${topic.title} (id: ${topic.id})
SCENARIO: ${topic.scenario}
SKILLS TO COVER (use these as the lesson.skills field, mostly verbatim):
${topic.skills.map((s) => `- ${s}`).join('\n')}
LEVEL: ${topic.level ?? 'A2'}
${topic.references?.length ? `REFERENCES (cite these in the lesson.references field): ${topic.references.join(', ')}` : ''}

${STYLE_GUIDE}

  ${SOURCES}

REFERENCE EXAMPLE (an existing lesson in the same style — do NOT copy
phrases from it; this is purely a style template):

${JSON.stringify(sample, null, 2)}

YOUR OUTPUT REQUIREMENTS:
- id: "${topic.id}" exactly (do not invent a different id).
- title: short, evocative, title-case (e.g. "${topic.title}").
- situation: 1-2 sentences setting the scene.
- skills: 3-5 short skill names (use the suggested skills above).
- phrases: 8-10 colloquial phrases that naturally arise in this scenario.
- grammar_notes: 3-5 short notes about grammar that shows up in the phrases.
- culture_notes: 2-3 practical tips about the social dynamic, not generic facts.
- skill_breakdown: 2-3 entries, each with 4-5 more_examples.
- practice_prompt: 2-3 sentences asking the learner to roleplay the scenario.
- references: cite the textbook sections from REFERENCES above if any.

Avoid these existing lesson ids (don't recreate them): ${existingLessons.map((l) => l.id).join(', ')}.`
}

function buildVocabPrompt(topic, existingHindi) {
  return `You are building a Hindi vocabulary batch thematically connected
to the lesson topic "${topic.title}" (${topic.scenario}).

Output 8-12 Hindi vocabulary words (romanized, ASCII only — NO Devanagari).
Each word must include:
  - hindi: romanized word
  - pronunciation: stress-marked (CAPS on stressed syllable, hyphens for syllables)
  - english: short gloss (1-4 words)
  - example: one short Hindi sentence using the word + dash + English translation
  - type: noun, verb, adjective, adverb, pronoun, filler, postposition, conjunction, etc.

Pick the most appropriate vocab category for the batch from this fixed list:
  - everyday — common conversational words
  - emotions — feelings, reactions, moods
  - food — meals, ingredients, eating
  - people — relationships, roles, social roles
  - time — when/now/later/days/hours
  - actions — verbs and action expressions

Avoid these existing Hindi words (don't recreate them):
${existingHindi.slice(0, 200).join(', ')}

${STYLE_GUIDE}`
}

function patchLibLessons(slug, varName) {
  const src = readFileSync(LIB_LESSONS_PATH, 'utf8')

  // Insert the import after the last `import ... from '@/content/lessons/...'`
  const lines = src.split('\n')
  let lastImportIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^import .+ from '@\/content\/lessons\//.test(lines[i])) {
      lastImportIdx = i
    }
  }
  if (lastImportIdx === -1) {
    throw new Error('Could not find @/content/lessons import block in lib/lessons.ts')
  }
  lines.splice(lastImportIdx + 1, 0, `import ${varName} from '@/content/lessons/${slug}.json'`)

  // Insert into the `const lessons: Lesson[] = [...]` array, after the last entry.
  // The array spans multiple lines and ends with `] as Lesson[]`.
  const arrayEndIdx = lines.findIndex((l) => /^\] as Lesson\[\]/.test(l.trim()))
  if (arrayEndIdx === -1) {
    throw new Error('Could not find lessons array close in lib/lessons.ts')
  }
  lines.splice(arrayEndIdx, 0, `  ${varName},`)

  writeFileSync(LIB_LESSONS_PATH, lines.join('\n'))
}

function camelCase(slug) {
  return slug
    .split('-')
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('')
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY env var not set')
  }

  const queue = loadJSON(QUEUE_PATH)
  if (!queue.topics?.length) {
    throw new Error(
      'QUEUE_EMPTY: content/lesson-queue.json has no topics. Add at least one to topics[] and re-run.',
    )
  }

  // Pick topic
  let topic
  if (topicOverride) {
    topic = queue.topics.find((t) => t.id === topicOverride)
    if (!topic) throw new Error(`Topic "${topicOverride}" not found in queue`)
  } else {
    topic = queue.topics[0]
  }
  console.log(`→ Topic: ${topic.id} — ${topic.title}`)

  // Load existing content for context + duplicate-avoidance
  const existingLessonFiles = readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.json'))
  const existingLessons = existingLessonFiles.map((f) =>
    loadJSON(join(LESSONS_DIR, f)),
  )

  if (existingLessons.find((l) => l.id === topic.id)) {
    throw new Error(
      `DUPLICATE_ID: A lesson with id "${topic.id}" already exists. Remove from queue or rename.`,
    )
  }

  const vocab = loadJSON(VOCAB_PATH)
  const existingHindi = vocab.categories.flatMap((c) => c.words.map((w) => w.hindi))

  // ─── Call 1: lesson ─────────────────────────────────────────
  console.log('→ Generating lesson…')
  const lessonPrompt = buildLessonPrompt(topic, existingLessons)
  let lessonJson
  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: LessonSchema,
      prompt: lessonPrompt,
    })
    lessonJson = object
  } catch (err) {
    throw new Error(
      `LESSON_GENERATION_FAILED: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  // Force the id to match the queue topic
  lessonJson.id = topic.id

  // ─── Call 2: vocab ──────────────────────────────────────────
  console.log('→ Generating vocab batch…')
  const vocabPrompt = buildVocabPrompt(topic, existingHindi)
  let vocabBatch
  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: VocabBatchSchema,
      prompt: vocabPrompt,
    })
    vocabBatch = object
  } catch (err) {
    throw new Error(
      `VOCAB_GENERATION_FAILED: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  // Drop any vocab words that are dupes of existing words
  const newWords = vocabBatch.words.filter((w) => !existingHindi.includes(w.hindi))
  if (newWords.length < vocabBatch.words.length) {
    console.log(
      `  dropped ${vocabBatch.words.length - newWords.length} duplicate vocab word(s)`,
    )
  }
  vocabBatch.words = newWords

  // ─── Write outputs ──────────────────────────────────────────
  const nextNum = nextLessonNumber()
  const slug = `${String(nextNum).padStart(2, '0')}-${topic.id}`
  const newLessonPath = join(LESSONS_DIR, `${slug}.json`)

  if (dryRun) {
    console.log('\n── DRY RUN — would write ──')
    console.log(`  ${newLessonPath}`)
    console.log(`    title: ${lessonJson.title}`)
    console.log(`    phrases: ${lessonJson.phrases.length}`)
    console.log(`    skills: ${lessonJson.skills.join(', ')}`)
    console.log(`  ${VOCAB_PATH} (append to "${vocabBatch.category}")`)
    console.log(`    +${vocabBatch.words.length} words: ${vocabBatch.words.map((w) => w.hindi).join(', ')}`)
    console.log(`  ${LIB_LESSONS_PATH} (add import + array entry for ${slug})`)
    console.log(`  ${QUEUE_PATH} (remove topic[0]: ${topic.id})`)
    return
  }

  // Write the lesson JSON
  writeFileSync(newLessonPath, JSON.stringify(lessonJson, null, 2) + '\n')
  console.log(`✓ wrote ${newLessonPath}`)

  // Append vocab to its category
  const catIdx = vocab.categories.findIndex((c) => c.id === vocabBatch.category)
  if (catIdx < 0) {
    throw new Error(`Unknown vocab category "${vocabBatch.category}"`)
  }
  vocab.categories[catIdx].words.push(...vocabBatch.words)
  writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2) + '\n')
  console.log(`✓ appended ${vocabBatch.words.length} words to vocab category "${vocabBatch.category}"`)

  // Patch lib/lessons.ts
  patchLibLessons(slug, camelCase(topic.id))
  console.log(`✓ patched lib/lessons.ts`)

  // Pop topic from queue
  queue.topics = queue.topics.filter((t) => t.id !== topic.id)
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n')
  console.log(`✓ removed topic "${topic.id}" from queue`)

  // Emit a result manifest for the workflow to read (PR title + body)
  const result = {
    topicId: topic.id,
    title: lessonJson.title,
    slug,
    phraseCount: lessonJson.phrases.length,
    vocabCategory: vocabBatch.category,
    vocabCount: vocabBatch.words.length,
    remainingTopics: queue.topics.length,
  }
  writeFileSync(join(repoRoot, '.generated-content.json'), JSON.stringify(result, null, 2))
  console.log('\n──')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error('\n✖ Generation failed:')
  console.error(err instanceof Error ? err.message : String(err))
  if (err instanceof Error && err.stack) console.error('\n' + err.stack)
  process.exit(1)
})
