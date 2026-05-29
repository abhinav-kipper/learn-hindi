// One-time audio generator for natural ElevenLabs voices.
//
// Renders three independent voice sets, each gated on its own voice-id env var
// (run any subset; at least one is required):
//
//   1. ELEVEN_VOICE_NL        → the Dutch "Sounds" module (female Dutch).
//      Every spoken string in content/dutch/pronunciation-course.json (letter
//      sounds, anchor words, ear-quiz words, blend parts + wholes) → a static
//      .mp3 under public/audio/sounds/, recorded text -> filename in
//      content/dutch/sounds-audio.json. The app prefers these clips and falls
//      back to live Google TTS for anything not in the manifest.
//
//   2. ELEVEN_VOICE_HI        → the Chaina mascot, Hindi/Hinglish moment lines
//      (female Hindi). Each voice-enabled line in components/design/moments.ts
//      → public/chaina/<momentKey>-<idx>.mp3.
//
//   3. ELEVEN_VOICE_NL_MASCOT → the Mr. Stroopwafel mascot, Dutch moment lines
//      (male Dutch). Uses the LINES_NL variant where present, else the default
//      line → public/stroopwafel/<momentKey>-<idx>.mp3.
//
// The mascot clip paths are deterministic (<momentKey>-<idx>.mp3), so lib/
// chaina-voice.ts finds them with no manifest. Only the Sounds set needs the
// hash manifest because its strings are arbitrary.
//
// The key is used ONLY here at generation time — it is never committed and the
// runtime never needs it (the clips are static).
//
// Usage (needs open network access to api.elevenlabs.io):
//   ELEVENLABS_API_KEY=sk_... \
//   ELEVEN_VOICE_NL=<dutch-female-id> \
//   ELEVEN_VOICE_HI=<hindi-female-id> \
//   ELEVEN_VOICE_NL_MASCOT=<dutch-male-id> \
//   node scripts/generate-audio.mjs
//
// Optional:
//   ELEVEN_MODEL=eleven_multilingual_v2   (default; handles Dutch + Hindi well)
//   --force   regenerate even if a clip already exists

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const COURSE = resolve(ROOT, 'content/dutch/pronunciation-course.json')
const MOMENTS_FILE = resolve(ROOT, 'components/design/moments.ts')
const SOUNDS_DIR = resolve(ROOT, 'public/audio/sounds')
const MANIFEST = resolve(ROOT, 'content/dutch/sounds-audio.json')
const CHAINA_DIR = resolve(ROOT, 'public/chaina')
const STROOPWAFEL_DIR = resolve(ROOT, 'public/stroopwafel')

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_NL = process.env.ELEVEN_VOICE_NL
const VOICE_HI = process.env.ELEVEN_VOICE_HI
const VOICE_NL_MASCOT = process.env.ELEVEN_VOICE_NL_MASCOT
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2'
const FORCE = process.argv.includes('--force')

if (!API_KEY || (!VOICE_NL && !VOICE_HI && !VOICE_NL_MASCOT)) {
  console.error(
    'Missing env. Set ELEVENLABS_API_KEY plus at least one voice id:\n' +
      '  ELEVEN_VOICE_NL=<dutch-female>         → Sounds module\n' +
      '  ELEVEN_VOICE_HI=<hindi-female>         → Chaina mascot lines\n' +
      '  ELEVEN_VOICE_NL_MASCOT=<dutch-male>    → Mr. Stroopwafel mascot lines',
  )
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function fileFor(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 16) + '.mp3'
}

async function tts(text, voiceId) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`
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

// ─── 1. Sounds module ──────────────────────────────────────────────────────

/** Every Dutch string the Sounds module speaks aloud. */
function collectSoundsTexts() {
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

async function generateSounds() {
  mkdirSync(SOUNDS_DIR, { recursive: true })
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  const texts = collectSoundsTexts()
  console.log(`\nSounds module: ${texts.length} unique strings (voice ${VOICE_NL}, model ${MODEL}).`)

  let made = 0
  let skipped = 0
  for (const text of texts) {
    const file = fileFor(text)
    const onDisk = existsSync(resolve(SOUNDS_DIR, file))
    if (!FORCE && manifest[text] === file && onDisk) {
      skipped++
      continue
    }
    try {
      const buf = await tts(text, VOICE_NL)
      writeFileSync(resolve(SOUNDS_DIR, file), buf)
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
  console.log(`Sounds done. ${made} generated, ${skipped} already current.`)
}

// ─── 2 + 3. Mascot moment lines ──────────────────────────────────────────────

/**
 * Parse components/design/moments.ts for the spoken lines, mirroring the
 * runtime selection in pickLine(): each moment's default lines come from
 * LINES, and the Dutch (Stroopwafel) variant uses LINES_NL[momentKey] when it
 * exists. Returns { MOMENTS, LINES_NL } keyed by moment key.
 */
function loadMoments() {
  const src = readFileSync(MOMENTS_FILE, 'utf8')

  const grab = (name) => {
    const m = src.match(new RegExp(`const ${name}: Record<string, Line\\[\\]> = (\\{[\\s\\S]*?\\n\\});`))
    if (!m) throw new Error(`Could not find ${name} literal in moments.ts`)
    // eslint-disable-next-line no-new-func
    return new Function(`return ${m[1]}`)()
  }
  const LINES = grab('LINES')
  const LINES_NL = grab('LINES_NL')

  const momentsMatch = src.match(/export const MOMENTS: Record<string, Moment> = (\{[\s\S]*?\n\});/)
  if (!momentsMatch) throw new Error('Could not find MOMENTS literal in moments.ts')
  const MOMENTS = {}
  const keyRe = /(\w+):\s*\{([\s\S]*?lines:\s*LINES\.(\w+),[\s\S]*?)\n\s*\},/g
  let mm
  while ((mm = keyRe.exec(momentsMatch[1])) !== null) {
    const key = mm[1]
    const linesKey = mm[3]
    const voice = /voice:\s*true/.test(mm[2])
    MOMENTS[key] = { voice, lines: LINES[linesKey] || [] }
  }
  return { MOMENTS, LINES_NL }
}

/**
 * Render one mascot voice set to its own dir, keyed <momentKey>-<idx>.mp3.
 * `linesFor(key, defaultLines)` resolves the line array the runtime will read.
 */
async function generateMascot(label, dir, voiceId, linesFor) {
  const { MOMENTS, LINES_NL } = loadMoments()
  mkdirSync(dir, { recursive: true })
  let made = 0
  let skipped = 0
  console.log(`\n${label}: voice ${voiceId}, model ${MODEL}.`)
  for (const [key, cfg] of Object.entries(MOMENTS)) {
    if (!cfg.voice) continue
    const lines = linesFor(key, cfg.lines, LINES_NL)
    for (let idx = 0; idx < lines.length; idx++) {
      const text = lines[idx]?.speak
      if (!text) continue
      const outPath = join(dir, `${key}-${idx}.mp3`)
      if (!FORCE && existsSync(outPath)) {
        skipped++
        continue
      }
      try {
        const buf = await tts(text, voiceId)
        writeFileSync(outPath, buf)
        made++
        console.log(`  ✓ ${key}-${idx}  "${text}"`)
        await sleep(250)
      } catch (e) {
        console.error(`  ✗ ${key}-${idx}  →  ${e.message}`)
      }
    }
  }
  console.log(`${label} done. ${made} generated, ${skipped} already on disk.`)
}

// ─── run ─────────────────────────────────────────────────────────────────────

async function main() {
  if (VOICE_NL) await generateSounds()
  if (VOICE_HI) {
    // Chaina speaks the default (Hindi/Hinglish) lines.
    await generateMascot('Chaina (hi)', CHAINA_DIR, VOICE_HI, (_key, defaultLines) => defaultLines)
  }
  if (VOICE_NL_MASCOT) {
    // Mr. Stroopwafel speaks the Dutch variant where present, else the default.
    await generateMascot('Mr. Stroopwafel (nl)', STROOPWAFEL_DIR, VOICE_NL_MASCOT, (key, defaultLines, LINES_NL) =>
      LINES_NL[key] ?? defaultLines,
    )
  }
  console.log('\nAll requested voice sets complete.')
}

main()
