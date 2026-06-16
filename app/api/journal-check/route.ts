import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Chai Diary "check my Hindi" — Chaina reads the learner's romanised-Hindi
// (Hinglish) journal entry and returns a warm reaction, a sentiment mood, a few
// GENTLE fixes, and an English translation (for the archive).
//
// Powered by Claude (Sonnet 4.6) because this task needs real understanding of
// code-mixed Hinglish *intent*, not just spelling. Falls back to Gemini if the
// Anthropic key isn't configured or Claude is busy, then the client falls back
// to an offline regex pre-check if the whole route errors.
const CheckSchema = z.object({
  reaction: z
    .string()
    .describe('a warm, personal 1-sentence reaction in Hinglish, like a kind friend who just read the entry. No emojis required. Max ~16 words.'),
  mood: z.enum(['happy', 'sympathy', 'neutral']).describe('overall sentiment of the entry'),
  translation: z
    .string()
    .describe('FILL THIS BEFORE fixes. A natural English translation of what the learner MEANT (not a literal word-for-word gloss), 1-3 sentences. Commit to the most sensible reading given the question and context; the fixes must be consistent with this understanding.'),
  fixes: z
    .array(
      z.object({
        original: z.string().describe('the exact slip, copied VERBATIM from the entry (must appear in the text character-for-character)'),
        fix: z.string().describe('the corrected romanised form that preserves the meaning you captured in translation'),
        note: z.string().describe('a one-line, plain, warm reason. No jargon. Max ~16 words.'),
      }),
    )
    .max(5)
    .describe('0 to 5 GENUINE slips, one per distinct issue across the WHOLE entry (do not stop after the first line). Empty if the entry is already fine, or if you are not sure what a phrase was meant to say.'),
  enrich: z
    .string()
    .describe('an ADDITIONAL gentle suggestion, returned EVEN IF there are fixes. If any clause is garbled or its meaning is unclear or likely not what they intended, suggest a clearer phrasing here as a question (e.g. "Did you mean X? You could write it as: ..."). Empty string only if there is genuinely nothing to add.'),
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
  return /high demand|overloaded|unavailable|503|529|temporarily|try again later/i.test(msgs.join(' '))
}

/** True when Anthropic can't be used (no key configured) so we should use Gemini. */
function anthropicMissing(): boolean {
  return !process.env.ANTHROPIC_API_KEY
}

export async function POST(req: Request) {
  try {
    const { entry, prompt, promptEn, language = 'hindi' } = await req.json()
    if (!entry || typeof entry !== 'string' || !entry.trim()) {
      return Response.json({ error: 'Missing entry' }, { status: 400 })
    }
    const langName = language === 'dutch' ? 'Dutch' : 'Hindi'
    const askedEn = typeof promptEn === 'string' && promptEn.trim() ? ` In plain English the question means: "${promptEn.trim()}".` : ''

    const sys =
      `You are Chaina, a warm, encouraging ${langName} diary companion.\n\n` +
      `WHO IS WRITING: an English speaker learning ${langName} as a BEGINNER. They journal in ROMANISED ${langName} (Hinglish) on purpose and never type the native script. Expect their writing to be rough: the romanisation is phonetic and inconsistent (they spell words the way they hear them), grammar and word order may follow English, agreement and postpositions are often off, and they freely mix in English words (e.g. colleague, feedback, boss, office). Those English words are INTENTIONAL code-mixing, not mistakes, so never flag them.\n\n` +
      `THE QUESTION THEY ANSWERED: "${prompt || 'their day'}".${askedEn} Use it as the anchor for what their entry is probably about.\n\n` +
      `HOW TO READ IT: read by SOUND, not by exact spelling. A beginner often writes a word the way they heard it and lands on a real but UNINTENDED ${langName} word. Use the question and the rest of the entry to pick the word they actually meant, and only correct to it when the context makes the intent clear. Examples of sound-alike confusions: "kheti" (farming) when they mean "kehti" (to say); "hota" vs "hoti"; "sakta" vs "sakti"; "mai" for "main"; "hu" for "hoon".\n\n` +
      `STEPS:\n` +
      `1. reaction: one warm Hinglish line, like a friend, not a teacher.\n` +
      `2. mood: the sentiment.\n` +
      `3. translation: FIRST work out what they MEANT across the WHOLE entry and write it as natural English. Everything else must be consistent with this reading.\n` +
      `4. fixes: up to FIVE genuine slips, covering every line (not just the first). Encouragement first. Correct real errors only (wrong/sound-alike word, missing long vowel, wrong verb ending, wrong/missing postposition, agreement). Each fix MUST keep the meaning from your translation, and its "original" MUST be copied verbatim from the entry.\n` +
      `5. enrich: see rules.\n\n` +
      `HARD RULES:\n` +
      `- NEVER invent a correction. If a fix's "original" is not present word-for-word in the entry, do not include it.\n` +
      `- NEVER rewrite a phrase into a different meaning than the learner intended. A correction fixes form, not message.\n` +
      `- Never flag English loanwords the learner chose to use.\n` +
      `- If a phrase is genuinely garbled and you cannot tell exactly what was meant, do NOT force a fix. Put a gentle suggestion in "enrich", phrased as a question ("Did you mean ...? You could write it as: ..."). Provide "enrich" EVEN IF you also returned some fixes.\n` +
      `- Treat these as correct house spellings, never "fix" them: accha, acchi, khaaya, theek, hoon.\n` +
      `- Keep every field short and human. Simple punctuation. No em-dashes, no arrows.\n\n` +
      `Entry:\n"""${entry.slice(0, 1500)}"""`

    const runAnthropic = () =>
      generateObject({
        model: anthropic('claude-sonnet-4-6'),
        schema: CheckSchema,
        maxRetries: 2,
        temperature: 0.3,
        prompt: sys,
      }).then((r) => r.object)

    const runGoogle = (modelId: string) =>
      generateObject({
        model: google(modelId),
        schema: CheckSchema,
        maxRetries: 2,
        temperature: 0.3,
        prompt: sys,
      }).then((r) => r.object)

    // Prefer Claude (best at Hinglish intent). Fall back to Gemini if the
    // Anthropic key is absent or Claude is overloaded, so the feature keeps
    // working either way. `served` records which model actually answered and is
    // returned as the `x-journal-model` response header (so you can verify in
    // the browser Network tab which model is live).
    let object
    let served: string
    if (anthropicMissing()) {
      served = 'gemini-2.5-flash'
      object = await runGoogle('gemini-2.5-flash')
    } else {
      try {
        object = await runAnthropic()
        served = 'claude-sonnet-4-6'
      } catch (e) {
        if (isBusy(e)) {
          try {
            object = await runGoogle('gemini-2.5-flash')
            served = 'gemini-2.5-flash'
          } catch {
            object = await runGoogle('gemini-2.0-flash')
            served = 'gemini-2.0-flash'
          }
        } else {
          throw e
        }
      }
    }

    return Response.json(object, { headers: { 'x-journal-model': served } })
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
