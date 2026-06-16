import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Chai Diary "check my Hindi" — Chaina reads the learner's romanised-Hindi
// (Hinglish) journal entry and returns a warm reaction, a sentiment mood, a few
// GENTLE fixes, and an English translation (for the archive). Encouragement
// first: only flag genuine slips, never style-nitpick the app's own romanisation.
const CheckSchema = z.object({
  reaction: z
    .string()
    .describe('a warm, personal 1-sentence reaction in Hinglish, like a kind friend who just read the entry. No emojis required. Max ~14 words.'),
  mood: z.enum(['happy', 'sympathy', 'neutral']).describe('overall sentiment of the entry'),
  fixes: z
    .array(
      z.object({
        original: z.string().describe('the exact slip as the learner wrote it'),
        fix: z.string().describe('the corrected romanised form'),
        note: z.string().describe('a one-line, plain, warm reason. No jargon. Max ~14 words.'),
      }),
    )
    .max(3)
    .describe('0 to 3 genuine beginner romanisation/grammar slips. Empty if the entry is already clean.'),
  enrich: z
    .string()
    .describe('if there are no fixes, one short encouraging tip to add colour next time (e.g. try a feeling word). Empty string if there are fixes.'),
  translation: z.string().describe('a natural English translation of the whole entry, 1-3 sentences.'),
})

function isBusy(err: unknown): boolean {
  const msgs: string[] = []
  const collect = (e: unknown) => {
    const a = e as { message?: string; errors?: unknown[]; lastError?: unknown; statusCode?: number }
    if (a?.message) msgs.push(a.message)
    if (typeof a?.statusCode === 'number') msgs.push(String(a.statusCode))
    if (Array.isArray(a?.errors)) a.errors.forEach(collect)
    if (a?.lastError) collect(a.lastError)
  }
  collect(err)
  return /high demand|overloaded|unavailable|503|temporarily|try again later/i.test(msgs.join(' '))
}

export async function POST(req: Request) {
  try {
    const { entry, prompt, language = 'hindi' } = await req.json()
    if (!entry || typeof entry !== 'string' || !entry.trim()) {
      return Response.json({ error: 'Missing entry' }, { status: 400 })
    }
    const langName = language === 'dutch' ? 'Dutch' : 'Hindi'

    const sys =
      `You are Chaina, a warm, encouraging ${langName} diary companion. The learner journals in ROMANISED ${langName} (Hinglish for Hindi) on purpose, so they never type the native script. ` +
      `They were asked: "${prompt || 'their day'}". Read their entry and respond with: ` +
      `(1) a warm one-line reaction in Hinglish (like a kind friend, not a teacher); ` +
      `(2) the sentiment mood; ` +
      `(3) at most THREE genuine fixes. Encouragement first: only correct real beginner slips (e.g. "mai" should be "main", "hu" should be "hoon", "muje" should be "mujhe", a missing long vowel, a clearly wrong verb ending). ` +
      `Do NOT nitpick valid spellings the learner used (treat "accha", "acchi", "khaaya", "theek" as correct house style, never "fix" them). If the entry is already clean, return zero fixes and one short "enrich" tip instead. ` +
      `(4) a natural English translation of the whole entry. ` +
      `Keep every field short and human. Write with simple punctuation. Do NOT use em-dashes or arrows. Never invent slips that are not in the text.\n\n` +
      `Entry:\n"""${entry.slice(0, 1200)}"""`

    const run = async (modelId: string) => {
      const { object } = await generateObject({
        model: google(modelId),
        schema: CheckSchema,
        maxRetries: 2,
        temperature: 0.4,
        prompt: sys,
      })
      return object
    }

    let object
    try {
      object = await run('gemini-2.5-flash')
    } catch (e) {
      if (isBusy(e)) object = await run('gemini-2.0-flash')
      else throw e
    }

    return Response.json(object)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (isBusy(error)) return Response.json({ error: 'busy' }, { status: 503 })
    if (/quota|rate.?limit|429|too many requests/i.test(msg)) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }
    console.error('Journal check API error:', msg)
    return Response.json({ error: 'Failed to check', detail: msg.slice(0, 300) }, { status: 500 })
  }
}
