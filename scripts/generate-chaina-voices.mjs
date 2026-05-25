// generate-chaina-voices.mjs
// One-shot Node script: reads components/design/moments.ts and generates one
// WAV per voice-enabled line via Gemini TTS (gemini-2.5-flash-preview-tts).
// Result: public/chaina/<momentKey>-<idx>.wav
//
// Usage:
//   1. Reuses the existing GOOGLE_GENERATIVE_AI_API_KEY env var
//      (same key the chat tutor uses — get one at
//      https://aistudio.google.com/app/apikey).
//   2. From repo root:
//        GOOGLE_GENERATIVE_AI_API_KEY=... node scripts/generate-chaina-voices.mjs
//   3. Files land in public/chaina/. Commit them.
//
// Re-running is idempotent: existing files are skipped unless you pass --force.
// Override the voice with CHAINA_VOICE_NAME=<voice>. Default: Leda (youthful).
// Other cute female options: Aoede (breezy), Kore (firm), Zephyr (bright).

import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(PROJECT_ROOT, 'public', 'chaina');

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!API_KEY) {
  console.error('Set GOOGLE_GENERATIVE_AI_API_KEY first. Same key the chat tutor uses.');
  console.error('Get one at https://aistudio.google.com/app/apikey');
  process.exit(1);
}

const VOICE_NAME = process.env.CHAINA_VOICE_NAME || 'Leda';
const MODEL = process.env.CHAINA_VOICE_MODEL || 'gemini-2.5-flash-preview-tts';
const FORCE = process.argv.includes('--force');

// Gemini TTS returns raw PCM: 16-bit little-endian, 24 kHz, mono.
const SAMPLE_RATE = 24000;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

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

// Wrap raw PCM bytes in a minimal 44-byte WAV header so the file is browser-playable.
function wrapWav(pcm) {
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE / 8;
  const blockAlign = NUM_CHANNELS * BITS_PER_SAMPLE / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);           // PCM chunk size
  header.writeUInt16LE(1, 20);            // AudioFormat = 1 (PCM)
  header.writeUInt16LE(NUM_CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function tts(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: VOICE_NAME },
          },
        },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const inline = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) {
    throw new Error(`Gemini response missing audio inlineData: ${JSON.stringify(json).slice(0, 300)}`);
  }
  const pcm = Buffer.from(inline.data, 'base64');
  return wrapWav(pcm);
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
      const outPath = join(OUT_DIR, `${key}-${idx}.wav`);
      if (existsSync(outPath) && !FORCE) {
        skipped++;
        console.log(`✓ have ${key}-${idx}.wav`);
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
  console.log(`Voice: ${VOICE_NAME} (override with CHAINA_VOICE_NAME=<name>)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
