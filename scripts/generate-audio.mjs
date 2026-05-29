// One-time audio generator for the Dutch "Sounds" module via ElevenLabs.
//
// Pre-renders every spoken string in content/dutch/pronunciation-course.json
// (letter sounds, anchor words, ear-quiz words, blend parts + wholes) to a
// static .mp3 under public/audio/sounds/, and records text -> filename in
// content/dutch/sounds-audio.json. The app prefers these clips and falls back
// to live Google TTS for anything not in the manifest.
//
// The key is used ONLY here at generation time — it is never committed and the
// runtime never needs it (the clips are static).
//
// Usage (needs open network access to api.elevenlabs.io):
//   ELEVENLABS_API_KEY=sk_... ELEVEN_VOICE_NL=<voiceId> node scripts/generate-audio.mjs
//
// Optional:
//   ELEVEN_MODEL=eleven_multilingual_v2   (default; handles Dutch well)
//   --force   regenerate even if a clip already exists

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const COURSE = resolve(ROOT, 'content/dutch/pronunciation-course.json')
const OUT_DIR = resolve(ROOT, 'public/audio/sounds')
const MANIFEST = resolve(ROOT, 'content/dutch/sounds-audio.json')

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE = process.env.ELEVEN_VOICE_NL
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2'
const FORCE = process.argv.includes('--force')

if (!API_KEY || !VOICE) {
  console.error('Missing env. Usage:\n  ELEVENLABS_API_KEY=sk_... ELEVEN_VOICE_NL=<voiceId> node scripts/generate-audio.mjs')
  process.exit(1)
}

/** Every Dutch string the Sounds module speaks aloud. */
function collectTexts() {
  const course = JSON.parse(readFileSync(COURSE, 'utf8'))
  const texts = new Set()
  for (const stage of course.stages) {
    for (const c of stage.cards ?? []) {
      texts.add(c.say ?? c.grapheme) // the isolated sound / letter
      texts.add(c.anchor.word)        // the anchor word
    }
    for (const item of stage.earQuiz?.items ?? []) texts.add(item.say)
    for (const w of stage.blend?.words ?? []) {
      for (const p of w.parts) texts.add(p.text)
      texts.add(w.whole)
    }
  }
  return [...texts].map((t) => String(t).trim()).filter(Boolean)
}

function fileFor(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 16) + '.mp3'
}

async function tts(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`)
  return Buffer.from(await res.arrayBuffer())
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  const texts = collectTexts()
  console.log(`${texts.length} unique strings to render (voice ${VOICE}, model ${MODEL}).`)

  let made = 0
  let skipped = 0
  for (const text of texts) {
    const file = fileFor(text)
    const onDisk = existsSync(resolve(OUT_DIR, file))
    if (!FORCE && manifest[text] === file && onDisk) {
      skipped++
      continue
    }
    try {
      const buf = await tts(text)
      writeFileSync(resolve(OUT_DIR, file), buf)
      manifest[text] = file
      made++
      console.log(`  ✓ ${text}  →  ${file}`)
      await sleep(250) // be polite to the API
    } catch (e) {
      console.error(`  ✗ ${text}  →  ${e.message}`)
    }
  }

  // Write the manifest sorted for stable diffs.
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`Done. ${made} generated, ${skipped} already current. Manifest: ${MANIFEST}`)
}

main()
