// Hindi natural-voice coverage check.
//
// Every Hindi lesson/foundation "hear it" string (phrase + theory example) is
// supposed to play a pre-rendered ElevenLabs (Anika) clip. That only happens
// when the exact romanized string has:
//   1. a Devanagari entry in content/hi-translit.json (the generator's input), and
//   2. a rendered clip in content/hi-audio.json (the runtime lookup).
// Without both, speak() silently falls back to Google/browser TTS — a different,
// robotic voice. This script flags any spoken string missing either, so a new
// chapter never ships with an inconsistent voice.
//
// Run it before shipping new Hindi content:
//   node scripts/check-hi-audio.mjs      (or: npm run audio:check)
//
// To fix anything it reports:
//   1. add the missing romanized -> Devanagari pairs to content/hi-translit.json
//   2. regenerate the clips (needs a paid key + the Anika voice id):
//        ELEVENLABS_API_KEY=… ELEVEN_VOICE_HI=<anika-id> node scripts/generate-audio.mjs
//   3. commit the new public/audio/hi/*.mp3 + the updated manifests
//
// Exit 1 if anything is uncovered, 0 if every string has a natural-voice clip.

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const translit = JSON.parse(readFileSync(resolve(ROOT, 'content/hi-translit.json'), 'utf8'))
const audio = JSON.parse(readFileSync(resolve(ROOT, 'content/hi-audio.json'), 'utf8'))
const AUDIO_DIR = resolve(ROOT, 'public/audio/hi')

const strip = (s) => s.replace(/\s*\([^)]*\)/g, '').trim()

// Collect every romanized string the Hindi lessons + foundations speak aloud.
const spoken = new Map() // string -> source file
for (const d of ['content/lessons', 'content/foundations']) {
  const dir = resolve(ROOT, d)
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const l = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    const add = (h) => {
      const s = strip(h || '')
      if (s && !spoken.has(s)) spoken.set(s, `${d}/${f}`)
    }
    for (const p of l.phrases ?? []) add(p.hindi)
    for (const sec of l.theory?.sections ?? []) for (const e of sec.examples ?? []) add(e.hindi)
  }
}

const missingTranslit = []
const missingClip = []
for (const [s, src] of spoken) {
  if (!translit[s]) missingTranslit.push([s, src])
  else if (!audio[s] || !existsSync(resolve(AUDIO_DIR, audio[s]))) missingClip.push([s, src])
}

if (missingTranslit.length === 0 && missingClip.length === 0) {
  console.log(`✓ check-hi-audio: all ${spoken.size} Hindi spoken strings have a natural-voice clip.`)
  process.exit(0)
}

if (missingTranslit.length) {
  console.error(`\n✗ ${missingTranslit.length} string(s) missing from content/hi-translit.json (add Devanagari, then regenerate):`)
  for (const [s, src] of missingTranslit) console.error(`    ${JSON.stringify(s)}   [${src}]`)
}
if (missingClip.length) {
  console.error(`\n✗ ${missingClip.length} string(s) have translit but no rendered clip (run scripts/generate-audio.mjs):`)
  for (const [s, src] of missingClip) console.error(`    ${JSON.stringify(s)}   [${src}]`)
}
console.error('\nFix per the header of scripts/check-hi-audio.mjs, then re-run.')
process.exit(1)
