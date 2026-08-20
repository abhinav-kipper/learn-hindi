import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Word Lookup — a beginner dictionary. The learner types a single word (or short
// phrase) in the target language; we return its English translation plus enough
// context to actually use it: the article (de/het for Dutch nouns), part of
// speech, a plain-English meaning, and a natural example sentence. The page
// speaks the word aloud separately via lib/speech.ts. Gemini-backed; the client
// shows a friendly offline/error message if this route can't be reached.
const DefineSchema = z.object({
  found: z
    .boolean()
    .describe('true if this is a real word or short phrase in the target language'),
  word: z
    .string()
    .describe(
      'the word in the target language, corrected to standard spelling if the input had a small typo; lowercase unless it is a proper noun',
    ),
  article: z
    .string()
    .describe(
      "for a Dutch noun, its definite article: exactly 'de' or 'het'. Empty string for non-nouns or when not applicable.",
    ),
  partOfSpeech: z
    .string()
    .describe('short part of speech in plain English, e.g. noun, verb, adjective, adverb, phrase'),
  translation: z
    .string()
    .describe('the primary English translation, just a few words'),
  meaning: z
    .string()
    .describe('a plain one-sentence English explanation of what it means or when it is used. Max ~18 words.'),
  example: z
    .string()
    .describe('one short, natural example sentence in the target language that uses the word'),
  example_en: z.string().describe('the English translation of the example sentence'),
})

/** Transient Gemini overload / unavailability (possibly wrapped by the SDK). */
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

export async function POST(req: Request) {
  try {
    const { word, language = 'dutch' } = await req.json()
    if (!word || typeof word !== 'string' || !word.trim()) {
      return Response.json({ error: 'Missing word' }, { status: 400 })
    }
    const clean = word.trim().slice(0, 60)
    const langName = language === 'hindi' ? 'Hindi' : 'Dutch'

    const sys =
      `You are a warm, clear ${langName}-to-English dictionary for a beginner learner.\n` +
      `The learner typed: "${clean}".\n\n` +
      `Return a beginner-friendly entry. If the input has a small spelling slip, correct it in "word" and define the intended ${langName} word. ` +
      `If it is genuinely not a ${langName} word or phrase, set found=false and leave the other fields empty.\n\n` +
      `Rules:\n` +
      `- Keep every field short and plain. No grammar jargon.\n` +
      (language === 'dutch'
        ? `- For a Dutch noun, ALWAYS fill "article" with exactly "de" or "het". Leave it empty for verbs, adjectives, and everything else.\n`
        : `- Leave "article" empty.\n`) +
      `- "translation" is just the core English meaning in a few words.\n` +
      `- The example sentence must be natural and actually use the word.\n` +
      `- Simple punctuation. No em-dashes, no arrows.`

    const run = (modelId: string) =>
      generateObject({
        model: google(modelId),
        schema: DefineSchema,
        maxRetries: 2,
        temperature: 0.2,
        prompt: sys,
      }).then((r) => r.object)

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
    console.error('Define API error:', msg)
    return Response.json({ error: 'Failed to look up', detail: msg.slice(0, 300) }, { status: 500 })
  }
}
