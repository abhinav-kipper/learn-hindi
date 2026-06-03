// Content QUALITY gate — runs in CI alongside lint-content (copy style).
//
// Two checks over every learner-facing lesson/foundation JSON in content/:
//
//   1. REFERENCES — each lesson must cite at least one source, and every source
//      must be on the vetted allowlist of real, checkable references. This stops
//      fabricated or conflated citations (e.g. attributing a Hindi author to a
//      Dutch grammar) from slipping in.
//
//   2. PLAIN LANGUAGE — grammar jargon must be introduced with a plain-words
//      gloss at least once per file (the house style: "the helper verb
//      (auxiliary)"). Keeps the tone easy and non-AI. The gloss is required once
//      per file, not per sentence (the term may be reused after it's introduced).
//
// Exit 1 on any violation. A "lesson" file = a JSON object with both `phrases`
// and `practice_prompt` (skips vocab/knm/lezen/luisteren/gloss/audio data files).
//
//   node scripts/lint-quality.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = resolve(ROOT, 'content')
const rel = (p) => p.slice(ROOT.length + 1)

// ── Vetted sources. A reference passes if it contains one of these fragments
// (case-insensitive). Add a fragment here only after verifying the source is
// real and appropriate. ──────────────────────────────────────────────────────
const KNOWN_SOURCES = [
  // Dutch
  'Naar Nederland', 'TaalCompleet', 'oefenen.nl', 'DUO oefenen', 'dutchgrammar.com',
  'Bart de Pau', 'learndutch', 'Nederlands in gang', 'Taalthuis', 'Taalunie', 'CEFR',
  'Referentiekader', 'van der Sijs', 'Chronologisch woordenboek', 'Donaldson', 'Shetter',
  'Prisma cursus', 'Inburgering', 'inburgering.nl', 'rijksoverheid',
  'Dutch business culture', 'Dutch school system',
  // Hindi
  'Snell & Weightman', 'Afroz Taj', 'A Door Into Hindi', 'McGregor',
].map((s) => s.toLowerCase())

// ── Jargon that must be glossed in plain words once per file. term -> at least
// one of these plain companions must also appear in the file. ────────────────
const JARGON = {
  auxiliary: ['helper'],
  infinitive: ['base form', 'dictionary form', 'base or dictionary'],
  diphthong: ['sound'],
  interrogative: ['question'],
  ergative: ['doer'],
}

function jsonFiles(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...jsonFiles(p))
    else if (e.endsWith('.json')) out.push(p)
  }
  return out
}

function collectStrings(node, acc) {
  if (typeof node === 'string') acc.push(node)
  else if (Array.isArray(node)) node.forEach((v) => collectStrings(v, acc))
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => collectStrings(v, acc))
  return acc
}

let violations = 0

for (const file of jsonFiles(CONTENT)) {
  let data
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`✗ ${rel(file)}: invalid JSON — ${e.message}`)
    violations++
    continue
  }

  // Only lesson/foundation files carry references + teaching prose.
  const isLesson = data && !Array.isArray(data) && Array.isArray(data.phrases) && typeof data.practice_prompt === 'string'
  if (!isLesson) continue

  // 1. References
  const refs = data.references
  if (!Array.isArray(refs) || refs.length === 0) {
    console.error(`✗ ${rel(file)}: missing references[] (every lesson must cite at least one vetted source)`)
    violations++
  } else {
    for (const r of refs) {
      if (typeof r !== 'string' || r.trim().length < 6) {
        console.error(`✗ ${rel(file)}: reference too short / not a string: ${JSON.stringify(r)}`)
        violations++
        continue
      }
      if (!KNOWN_SOURCES.some((k) => r.toLowerCase().includes(k))) {
        console.error(`✗ ${rel(file)}: unrecognized reference "${r}". Use a vetted source, or add it to KNOWN_SOURCES in scripts/lint-quality.mjs after verifying it is real.`)
        violations++
      }
    }
  }

  // 2. Plain language
  const text = collectStrings(data, []).join('  ').toLowerCase()
  for (const [term, companions] of Object.entries(JARGON)) {
    const used = new RegExp(`\\b${term}`, 'i').test(text)
    if (used && !companions.some((c) => text.includes(c))) {
      console.error(`✗ ${rel(file)}: jargon "${term}" is never glossed in plain words. Introduce it once like "${term} (${companions[0]}...)".`)
      violations++
    }
  }
}

if (violations) {
  console.error(`\n✗ lint-quality: ${violations} issue(s). Fix references (vetted sources only) and gloss grammar jargon in plain words.`)
  process.exit(1)
}
console.log('✓ lint-quality: references vetted and grammar jargon glossed in plain words.')
