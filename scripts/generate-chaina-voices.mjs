// generate-chaina-voices.mjs
// One-shot Node script: reads components/design/moments.ts and generates one
// MP3 per line via ElevenLabs. Result: public/chaina/<momentKey>-<idx>.mp3
//
// Usage:
//   1. Get an API key: https://elevenlabs.io → Profile → API Keys
//   2. (optional) Pick a voice: https://elevenlabs.io/voice-library
//   3. From repo root:
//        ELEVENLABS_API_KEY=sk_... node scripts/generate-chaina-voices.mjs
//   4. Files land in public/chaina/. Commit them.
//
// Re-running is idempotent: existing files are skipped unless you pass --force.

import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(PROJECT_ROOT, 'public', 'chaina');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Set ELEVENLABS_API_KEY first. Get one at https://elevenlabs.io/profile.');
  process.exit(1);
}

const VOICE_ID = process.env.CHAINA_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
const MODEL = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.45,
  use_speaker_boost: true,
};
const FORCE = process.argv.includes('--force');

function loadLines() {
  const path = join(PROJECT_ROOT, 'components', 'design', 'moments.ts');
  const src = readFileSync(path, 'utf8');
  const linesMatch = src.match(/const LINES: Record<string, Line\[\]> = (\{[\s\S]*?\n\});/);
  if (!linesMatch) throw new Error('Could not find LINES literal in moments.ts');
  // eslint-disable-next-line no-new-func
  const LINES = new Function(`return ${linesMatch[1]}`)();
  const momentsMatch = src.match(/export const MOMENTS: Record<string, Moment> = (\{[\s\S]*?\n\});/);
  if (!momentsMatch) throw new Error('Could not find MOMENTS literal in moments.ts');
  const moments = {};
  const keyRe = /(\w+):\s*\{([\s\S]*?lines:\s*LINES\.(\w+),[\s\S]*?)\n\s*\},/g;
  let mm;
  while ((mm = keyRe.exec(momentsMatch[1])) !== null) {
    const key = mm[1];
    const linesKey = mm[3];
    const voice = /voice:\s*true/.test(mm[2]);
    moments[key] = { voice, lines: LINES[linesKey] || [] };
  }
  return { MOMENTS: moments, LINES };
}

async function tts(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { MOMENTS } = loadLines();

  let generated = 0, skipped = 0, failed = 0;

  for (const [key, cfg] of Object.entries(MOMENTS)) {
    if (!cfg.voice) {
      console.log(`· skip ${key} (voice: false)`);
      continue;
    }
    for (let idx = 0; idx < cfg.lines.length; idx++) {
      const line = cfg.lines[idx];
      if (!line.speak) continue;
      const outPath = join(OUT_DIR, `${key}-${idx}.mp3`);
      if (existsSync(outPath) && !FORCE) {
        skipped++;
        console.log(`✓ have ${key}-${idx}.mp3`);
        continue;
      }
      try {
        process.stdout.write(`→ ${key}-${idx} "${line.speak}" ... `);
        const buf = await tts(line.speak);
        writeFileSync(outPath, buf);
        generated++;
        console.log(`(${buf.length} bytes)`);
      } catch (e) {
        failed++;
        console.error(`FAIL ${key}-${idx}:`, e.message);
      }
    }
  }

  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
  console.log(`Files: ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
