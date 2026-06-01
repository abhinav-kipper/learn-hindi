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
// Each voice set also renders its mascot's non-verbal "barks" (bark-0..N-1.mp3)
// into the same dir — short voiced interjections played on light touch points.
//
// Two more non-voice sets, each gated on its own flag:
//   ELEVEN_SFX=1     → designed UI sound pack (tap/correct/.../levelup) via the
//                      Sound Effects API → public/audio/sfx/<type>.mp3.
//   ELEVEN_AMBIENT=1 → faint loopable ambient soundscapes (chai-stall / café)
//                      via the Sound Effects API → public/audio/ambient/<track>.mp3.
//
// The key is used ONLY here at generation time — it is never committed and the
// runtime never needs it (the clips are static).
//
// Usage (needs open network access to api.elevenlabs.io):
//   ELEVENLABS_API_KEY=sk_... \
//   ELEVEN_VOICE_NL=<dutch-female-id> \
//   ELEVEN_VOICE_HI=<hindi-female-id> \
//   ELEVEN_VOICE_NL_MASCOT=<dutch-male-id> \
//   ELEVEN_SFX=1 ELEVEN_AMBIENT=1 \
//   node scripts/generate-audio.mjs
//
// Optional:
//   ELEVEN_MODEL=eleven_multilingual_v2   (default; handles Dutch + Hindi well)
//   --force   regenerate even if a clip already exists

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs'
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
const HI_LESSONS_DIR = resolve(ROOT, 'public/audio/hi')
const HI_TRANSLIT = resolve(ROOT, 'content/hi-translit.json')
const HI_MANIFEST = resolve(ROOT, 'content/hi-audio.json')
const HI_SOUNDS_COURSE = resolve(ROOT, 'content/hindi/pronunciation-course.json')
const HI_SOUNDS_DIR = resolve(ROOT, 'public/audio/hi-sounds')
const HI_SOUNDS_MANIFEST = resolve(ROOT, 'content/hindi/sounds-audio.json')
const NL_LESSONS_DIR = resolve(ROOT, 'public/audio/nl')
const NL_MANIFEST = resolve(ROOT, 'content/nl-audio.json')
const SFX_DIR = resolve(ROOT, 'public/audio/sfx')
const SFX_MANIFEST = resolve(ROOT, 'content/sfx-audio.json')
const DO_SFX = process.env.ELEVEN_SFX === '1'
const AMBIENT_DIR = resolve(ROOT, 'public/audio/ambient')
const DO_AMBIENT = process.env.ELEVEN_AMBIENT === '1'

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_NL = process.env.ELEVEN_VOICE_NL
const VOICE_HI = process.env.ELEVEN_VOICE_HI
const VOICE_NL_MASCOT = process.env.ELEVEN_VOICE_NL_MASCOT
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2'
// Playback pace. ElevenLabs accepts 0.7–1.2 (1.0 = default; lower = slower).
const SPEED = Number(process.env.ELEVEN_SPEED || '0.85')
const FORCE = process.argv.includes('--force')

if (!API_KEY || (!VOICE_NL && !VOICE_HI && !VOICE_NL_MASCOT && !DO_SFX && !DO_AMBIENT)) {
  console.error(
    'Missing env. Set ELEVENLABS_API_KEY plus at least one of:\n' +
      '  ELEVEN_VOICE_NL=<dutch-female>         → Sounds module\n' +
      '  ELEVEN_VOICE_HI=<hindi-female>         → Chaina mascot lines + barks\n' +
      '  ELEVEN_VOICE_NL_MASCOT=<dutch-male>    → Mr. Stroopwafel mascot lines + barks\n' +
      '  ELEVEN_SFX=1                           → UI sound-effect pack\n' +
      '  ELEVEN_AMBIENT=1                       → ambient soundscape loops',
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
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true, speed: SPEED },
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

// ─── 1b. Hindi lesson phrases ────────────────────────────────────────────────

// Hindi content is romanized, but ElevenLabs reads Latin text with an English
// accent. content/hi-translit.json maps each romanized phrase (the exact string
// the app passes to speak()) → Devanagari, which we feed to ElevenLabs for a
// correct Hindi accent. Output is keyed by the ROMANIZED string so lib/speech.ts
// can look it up. Uses the same Hindi voice as Chaina (ELEVEN_VOICE_HI).
async function generateHindiLessons() {
  if (!existsSync(HI_TRANSLIT)) {
    console.log('\nHindi lessons: no content/hi-translit.json, skipping.')
    return
  }
  const translit = JSON.parse(readFileSync(HI_TRANSLIT, 'utf8'))
  const entries = Object.entries(translit)
  if (entries.length === 0) {
    console.log('\nHindi lessons: hi-translit.json is empty, skipping.')
    return
  }
  mkdirSync(HI_LESSONS_DIR, { recursive: true })
  const manifest = existsSync(HI_MANIFEST) ? JSON.parse(readFileSync(HI_MANIFEST, 'utf8')) : {}
  console.log(`\nHindi lessons: ${entries.length} phrases (voice ${VOICE_HI}, model ${MODEL}, speed ${SPEED}).`)

  let made = 0
  let skipped = 0
  for (const [rom, dev] of entries) {
    const key = rom.trim()
    const file = fileFor(key)
    const onDisk = existsSync(resolve(HI_LESSONS_DIR, file))
    if (!FORCE && manifest[key] === file && onDisk) {
      skipped++
      continue
    }
    try {
      const buf = await tts(dev, VOICE_HI) // Devanagari in → correct Hindi accent
      writeFileSync(resolve(HI_LESSONS_DIR, file), buf)
      manifest[key] = file
      made++
      console.log(`  ✓ ${rom}  →  ${file}`)
      await sleep(250)
    } catch (e) {
      console.error(`  ✗ ${rom}  →  ${e.message}`)
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(HI_MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`Hindi lessons done. ${made} generated, ${skipped} already current.`)
}

// ─── 1bb. Dutch lesson + foundation phrases ──────────────────────────────────

// Dutch "hear it" for lesson/foundation phrases + theory examples. Dutch is
// natively Latin, so the text is fed to ElevenLabs as-is (no transliteration).
// Keyed by the parenthetical-stripped string speak() looks up. Uses the Dutch
// female voice (ELEVEN_VOICE_NL), same as the Sounds module.
const stripParen = (s) => s.replace(/\s*\([^)]*\)/g, '').trim()

function collectDutchTexts() {
  const out = new Set()
  for (const d of ['content/dutch/lessons', 'content/dutch/foundations']) {
    const dir = resolve(ROOT, d)
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const l = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
      for (const p of l.phrases ?? []) if (p.hindi) out.add(stripParen(p.hindi))
      for (const sec of l.theory?.sections ?? []) for (const e of sec.examples ?? []) if (e.hindi) out.add(stripParen(e.hindi))
    }
  }
  return [...out].filter(Boolean)
}

async function generateDutchLessons() {
  const texts = collectDutchTexts()
  if (texts.length === 0) {
    console.log('\nDutch lessons: no strings, skipping.')
    return
  }
  mkdirSync(NL_LESSONS_DIR, { recursive: true })
  const manifest = existsSync(NL_MANIFEST) ? JSON.parse(readFileSync(NL_MANIFEST, 'utf8')) : {}
  console.log(`\nDutch lessons: ${texts.length} phrases (voice ${VOICE_NL}, model ${MODEL}, speed ${SPEED}).`)
  let made = 0
  let skipped = 0
  for (const text of texts) {
    const file = fileFor(text)
    const onDisk = existsSync(resolve(NL_LESSONS_DIR, file))
    if (!FORCE && manifest[text] === file && onDisk) {
      skipped++
      continue
    }
    try {
      const buf = await tts(text, VOICE_NL)
      writeFileSync(resolve(NL_LESSONS_DIR, file), buf)
      manifest[text] = file
      made++
      console.log(`  ✓ ${text}  →  ${file}`)
      await sleep(250)
    } catch (e) {
      console.error(`  ✗ ${text}  →  ${e.message}`)
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(NL_MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`Dutch lessons done. ${made} generated, ${skipped} already current.`)
}

// ─── 1c. Hindi "Sounds" pronunciation module ─────────────────────────────────

// The Hindi Sounds course is romanized for display, but every spoken string
// carries a Devanagari `dev` form. We feed the Devanagari to ElevenLabs (correct
// accent) and key the manifest by the ROMANIZED string the page passes to
// speak(), so lib/hindi/sounds-audio.ts can look it up. Same Anika voice as the
// lessons (ELEVEN_VOICE_HI).
function collectHindiSounds() {
  if (!existsSync(HI_SOUNDS_COURSE)) return []
  const course = JSON.parse(readFileSync(HI_SOUNDS_COURSE, 'utf8'))
  const map = new Map() // romanized -> devanagari (first non-empty wins)
  const add = (rom, dev) => {
    if (!rom || !dev) return
    const k = String(rom).trim()
    if (!k) return
    if (!map.has(k)) map.set(k, String(dev).trim())
  }
  for (const stage of course.stages ?? []) {
    for (const c of stage.cards ?? []) {
      add(c.say ?? c.grapheme, c.dev)
      add(c.anchor?.word, c.anchor?.dev)
    }
    for (const item of stage.earQuiz?.items ?? []) add(item.say, item.dev)
    for (const w of stage.blend?.words ?? []) {
      for (const p of w.parts ?? []) add(p.text, p.dev)
      add(w.whole, w.whole_dev)
    }
  }
  return [...map.entries()]
}

async function generateHindiSounds() {
  const pairs = collectHindiSounds()
  if (pairs.length === 0) {
    console.log('\nHindi Sounds: no course strings, skipping.')
    return
  }
  mkdirSync(HI_SOUNDS_DIR, { recursive: true })
  const manifest = existsSync(HI_SOUNDS_MANIFEST) ? JSON.parse(readFileSync(HI_SOUNDS_MANIFEST, 'utf8')) : {}
  console.log(`\nHindi Sounds: ${pairs.length} strings (voice ${VOICE_HI}, model ${MODEL}, speed ${SPEED}).`)
  let made = 0
  let skipped = 0
  for (const [rom, dev] of pairs) {
    const file = fileFor(rom)
    const onDisk = existsSync(resolve(HI_SOUNDS_DIR, file))
    if (!FORCE && manifest[rom] === file && onDisk) {
      skipped++
      continue
    }
    try {
      const buf = await tts(dev, VOICE_HI) // Devanagari in → correct Hindi accent
      writeFileSync(resolve(HI_SOUNDS_DIR, file), buf)
      manifest[rom] = file
      made++
      console.log(`  ✓ ${rom}  (${dev})  →  ${file}`)
      await sleep(250)
    } catch (e) {
      console.error(`  ✗ ${rom}  →  ${e.message}`)
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(HI_SOUNDS_MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`Hindi Sounds done. ${made} generated, ${skipped} already current.`)
}

// ─── 1d. UI sound-effect pack (ElevenLabs Sound Effects API) ──────────────────

// Designed counterparts to the synth blips in lib/sounds.ts. Generated once to
// public/audio/sfx/<type>.mp3; the app prefers them and falls back to synth.
// Cute / friendly Duolingo-ish character — short, soft, never harsh.
const SFX = {
  tap:      { prompt: 'juicy playful mobile-game UI tap: soft tactile bubble click with a tiny bouncy boing, candy-like and satisfying', seconds: 0.5 },
  pop:      { prompt: 'satisfying juicy bubble pop with a springy cartoon boing, candy-crush style, playful', seconds: 0.5 },
  swipe:    { prompt: 'snappy playful card-swipe whoosh with a soft sparkle tail, clean mobile game UI', seconds: 0.5 },
  correct:  { prompt: 'happy bright correct-answer reward: cheerful marimba and glockenspiel two-note ding-DING up, with a little sparkle, juicy and satisfying mobile game', seconds: 0.9 },
  wrong:    { prompt: 'playful gentle wrong-answer boing: soft springy cartoon descending wobble, friendly and funny, warm, not harsh', seconds: 0.7 },
  complete: { prompt: 'joyful lesson-complete victory jingle: bright ascending marimba and glockenspiel arpeggio with bells and a warm sparkle swell, cute kids mobile game, celebratory and rewarding', seconds: 1.6 },
  streak:   { prompt: 'magical sparkly streak reward: shimmering glockenspiel and chime cascade with rising twinkle and a soft whoosh, fairy-dust, exciting and rewarding', seconds: 1.3 },
  levelup:  { prompt: 'epic triumphant level-up power-up fanfare: bright synth-and-brass rising swell with sparkle shimmer and a satisfying chime hit at the end, celebratory arcade win, joyful', seconds: 1.8 },
}

async function sfxGen(text, seconds) {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, duration_seconds: seconds, prompt_influence: 0.65, output_format: 'mp3_44100_128' }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`)
  return Buffer.from(await res.arrayBuffer())
}

async function generateSfx() {
  mkdirSync(SFX_DIR, { recursive: true })
  const manifest = existsSync(SFX_MANIFEST) ? JSON.parse(readFileSync(SFX_MANIFEST, 'utf8')) : {}
  console.log(`\nUI sound pack: ${Object.keys(SFX).length} effects (ElevenLabs Sound Effects).`)
  let made = 0
  let skipped = 0
  for (const [type, { prompt, seconds }] of Object.entries(SFX)) {
    const file = `${type}.mp3`
    if (!FORCE && manifest[type] === file && existsSync(resolve(SFX_DIR, file))) {
      skipped++
      continue
    }
    try {
      const buf = await sfxGen(prompt, seconds)
      writeFileSync(resolve(SFX_DIR, file), buf)
      manifest[type] = file
      made++
      console.log(`  ✓ ${type}  →  ${file}`)
      await sleep(300)
    } catch (e) {
      console.error(`  ✗ ${type}  →  ${e.message}`)
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(SFX_MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`UI sound pack done. ${made} generated, ${skipped} already current.`)
}

// ─── 1e. Ambient soundscapes (ElevenLabs Sound Effects API) ───────────────────

// A faint, loopable background bed per learning track. Played at low volume on
// the home screen (lib/ambient.ts), opt-in via Settings. ElevenLabs caps a
// single sound-generation at 22s, which loops cleanly for ambience.
const AMBIENT = {
  hindi: {
    prompt:
      'calm continuous ambient soundscape of an Indian roadside chai stall, gentle and cozy: faint distant street chatter, soft clink of small glass cups, a kettle quietly simmering, a far-off bicycle bell now and then, warm relaxed background hum, seamless loop, no music, no sudden loud sounds',
    seconds: 22,
  },
  dutch: {
    prompt:
      'calm continuous ambient soundscape of a quiet Dutch city café terrace, gentle and cozy: faint distant chatter, soft clink of cups and saucers, an occasional passing bicycle bell, light breeze, relaxed background hum, seamless loop, no music, no sudden loud sounds',
    seconds: 22,
  },
}

async function generateAmbient() {
  mkdirSync(AMBIENT_DIR, { recursive: true })
  console.log(`\nAmbient soundscapes: ${Object.keys(AMBIENT).length} loops (ElevenLabs Sound Effects).`)
  let made = 0
  let skipped = 0
  for (const [track, { prompt, seconds }] of Object.entries(AMBIENT)) {
    const file = `${track}.mp3`
    const outPath = resolve(AMBIENT_DIR, file)
    if (!FORCE && existsSync(outPath)) {
      skipped++
      continue
    }
    try {
      const buf = await sfxGen(prompt, seconds)
      writeFileSync(outPath, buf)
      made++
      console.log(`  ✓ ${track}  →  ${file}`)
      await sleep(300)
    } catch (e) {
      console.error(`  ✗ ${track}  →  ${e.message}`)
    }
  }
  console.log(`Ambient done. ${made} generated, ${skipped} already on disk.`)
}

// ─── 1f. Mascot barks (short non-verbal voiced interjections) ─────────────────

// Tiny voiced reactions in each mascot's own voice, played on light touch
// points (lib/chaina-voice.ts bark()). bark-0..N-1.mp3 — keep BARK_COUNT in
// lib/chaina-voice.ts in sync with the number of lines here.
const BARKS = {
  hi: ['हम्म!', 'ओहो!', 'अरे वाह!', 'हे हे!'],
  nl: ['Hè!', 'Oho!', 'Hmm!', 'Tjonge!'],
}

async function generateBarks(label, dir, voiceId, lines) {
  mkdirSync(dir, { recursive: true })
  let made = 0
  let skipped = 0
  console.log(`\n${label} barks: ${lines.length} clips (voice ${voiceId}).`)
  for (let idx = 0; idx < lines.length; idx++) {
    const outPath = join(dir, `bark-${idx}.mp3`)
    if (!FORCE && existsSync(outPath)) {
      skipped++
      continue
    }
    try {
      const buf = await tts(lines[idx], voiceId)
      writeFileSync(outPath, buf)
      made++
      console.log(`  ✓ bark-${idx}  "${lines[idx]}"`)
      await sleep(250)
    } catch (e) {
      console.error(`  ✗ bark-${idx}  →  ${e.message}`)
    }
  }
  console.log(`${label} barks done. ${made} generated, ${skipped} already on disk.`)
}

// ─── 2 + 3. Mascot moment lines ──────────────────────────────────────────────

// Moments that only ever fire on the Dutch track (Mr. Stroopwafel speaks them,
// never Chaina). Their default LINES are Dutch, so we skip them for the Chaina
// (Hindi) voice — those clips would be a Hindi voice reading Dutch and are
// never played (locale 'nl' → /stroopwafel/, not /chaina/).
const DUTCH_ONLY_MOMENTS = new Set([
  'knmAttemptComplete', 'knmPassed', 'a2Milestone',
  'lezenStudyDone', 'lezenMockPassed',
  'luisterStudyDone', 'luisterMockPassed',
  // NOTE: pronStageDone is bilingual now — Chaina (Hindi Sounds) + Stroopwafel
  // (Dutch Sounds) — so it is generated for both voices.
])

// ElevenLabs pronounces by script: romanized Hindi (Latin) gets anglicized.
// For Chaina we feed Devanagari for the Hindi words so the accent is correct;
// English words (perfect, Chapter done, Try…) stay Latin so they read English.
// Keyed by the exact romanized `speak` string in moments.ts; lines absent here
// (pure English greetings) are generated as-is.
const HI_DEVANAGARI = {
  'Arrey, kahan the? Missed you, dost.': 'अरे, कहाँ थे? Missed you, दोस्त।',
  'Chai is getting cold. Kab aaoge?': 'Chai is getting cold. कब आओगे?',
  'Namaste, dost.': 'नमस्ते, दोस्त।',
  'Shubh prabhat. Chalo, shuru karein?': 'शुभ प्रभात। चलो, शुरू करें?',
  'Aaj kya seekhenge?': 'आज क्या सीखेंगे?',
  'Bilkul sahi!': 'बिल्कुल सही!',
  'Ekdum perfect.': 'एकदम perfect।',
  'Kya baat hai!': 'क्या बात है!',
  'Koi baat nahin.': 'कोई बात नहीं।',
  'Arrey, almost! Thoda aur try karo.': 'अरे, almost! थोड़ा और try करो।',
  'No worries, dost.': 'No worries, दोस्त।',
  'Wah, shabash! Chapter done.': 'वाह, शाबाश! Chapter done।',
  'Kya baat hai. Aage badho.': 'क्या बात है। आगे बढ़ो।',
  'Streak! Mehnat rang laayi.': 'Streak! मेहनत रंग लाई।',
  'Streak strong, dost. Aise hi chalte raho.': 'Streak strong, दोस्त। ऐसे ही चलते रहो।',
  'Streak saved! Today is done, dost.': 'Streak saved! Today is done, दोस्त।',
  'Aaj ka kaam pura. Streak alive.': 'आज का काम पूरा। Streak alive।',
  'Shabash, counted! Kal phir milte hain.': 'शाबाश, counted! कल फिर मिलते हैं।',
  'Saved for later. Drill karenge baad mein.': 'Saved for later. Drill करेंगे बाद में।',
  'Phir milte hain!': 'फिर मिलते हैं!',
  'Tata, dost.': 'टाटा, दोस्त।',
  'Haan, kya hua?': 'हाँ, क्या हुआ?',
  'Oye!': 'ओए!',
  'Chai garam hai.': 'चाय गरम है।',
  'Bolo, dost.': 'बोलो, दोस्त।',
  'Arrey, naye lessons aaye hain. Try karke dekho.': 'अरे, नए lessons आए हैं। Try करके देखो।',
  'Kuch naya hai. Check karo.': 'कुछ नया है। Check करो।',
  'Naya content unlocked. Mazaa aayega.': 'नया content unlocked। मज़ा आएगा।',
  'Daily goal done! Mehnat ki keemat.': 'Daily goal done! मेहनत की कीमत।',
  'Wah, target hit! Aaj ka kaam pura.': 'वाह, target hit! आज का काम पूरा।',
  'Kya baat hai. Today minutes done.': 'क्या बात है। Today minutes done।',
}

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
async function generateMascot(label, dir, voiceId, linesFor, opts = {}) {
  const { textMap = {}, skipMoments = new Set() } = opts
  const { MOMENTS, LINES_NL } = loadMoments()
  mkdirSync(dir, { recursive: true })
  let made = 0
  let skipped = 0
  console.log(`\n${label}: voice ${voiceId}, model ${MODEL}, speed ${SPEED}.`)
  for (const [key, cfg] of Object.entries(MOMENTS)) {
    if (!cfg.voice || skipMoments.has(key)) continue
    const lines = linesFor(key, cfg.lines, LINES_NL)
    for (let idx = 0; idx < lines.length; idx++) {
      const raw = lines[idx]?.speak
      if (!raw) continue
      const text = textMap[raw] ?? raw // Devanagari for Chaina's Hindi lines
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
  if (VOICE_NL) {
    await generateSounds()
    // Dutch lesson + foundation "hear it" phrases share the Dutch voice.
    await generateDutchLessons()
  }
  if (VOICE_HI) {
    // Chaina speaks the default (Hindi/Hinglish) lines, rendered from Devanagari
    // for a correct accent; the Dutch-only moments are skipped (never played).
    await generateMascot('Chaina (hi)', CHAINA_DIR, VOICE_HI, (_key, defaultLines) => defaultLines, {
      textMap: HI_DEVANAGARI,
      skipMoments: DUTCH_ONLY_MOMENTS,
    })
    // Hindi lesson "hear it" phrases share the Chaina voice.
    await generateHindiLessons()
    // Hindi "Sounds" pronunciation module — same voice, Devanagari-fed.
    await generateHindiSounds()
    // Chaina's non-verbal barks.
    await generateBarks('Chaina (hi)', CHAINA_DIR, VOICE_HI, BARKS.hi)
  }
  if (VOICE_NL_MASCOT) {
    // Mr. Stroopwafel speaks the Dutch variant where present, else the default.
    await generateMascot('Mr. Stroopwafel (nl)', STROOPWAFEL_DIR, VOICE_NL_MASCOT, (key, defaultLines, LINES_NL) =>
      LINES_NL[key] ?? defaultLines,
    )
    // Mr. Stroopwafel's non-verbal barks.
    await generateBarks('Mr. Stroopwafel (nl)', STROOPWAFEL_DIR, VOICE_NL_MASCOT, BARKS.nl)
  }
  if (DO_SFX) await generateSfx()
  if (DO_AMBIENT) await generateAmbient()
  console.log('\nAll requested voice sets complete.')
}

main()
