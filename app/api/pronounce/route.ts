import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Gemini-based pronunciation feedback (Fast MVP). The client records the user
// saying a word/phrase; we send the audio + the target (romanized) and a
// Devanagari/native reference to Gemini and ask for short, plain-language
// coaching. Qualitative — not calibrated phoneme scores (that'd be Azure later).
const FeedbackSchema = z.object({
  score: z.number().min(0).max(100).describe('overall closeness to a native pronunciation, 0-100'),
  verdict: z.string().describe('a short, warm one-liner headline (≤6 words)'),
  good: z.string().describe('one specific thing they got right, plain language, ≤12 words'),
  fix: z.string().describe('the single most useful thing to improve, plain everyday language (no phonetics jargon), ≤16 words; empty string if already great'),
  close: z.boolean().describe('true if it was good enough to move on'),
})

/** True if the error is a transient Gemini overload / unavailability, possibly
 *  wrapped in the AI SDK's retry-error envelope. */
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
    const { audioBase64, mimeType, target, reference, language = 'hindi' } = await req.json()
    if (!audioBase64 || !target) {
      return Response.json({ error: 'Missing audio or target' }, { status: 400 })
    }
    const langName = language === 'dutch' ? 'Dutch' : 'Hindi'
    const ref = reference ? ` (written: ${reference})` : ''

    const prompt =
      `You are a warm, encouraging ${langName} pronunciation coach for a beginner. ` +
      `The learner is trying to say "${target}"${ref}. Listen to the attached audio of their attempt and judge how close it is to a natural ${langName} pronunciation. ` +
      `Be kind and specific. Use plain, everyday words — NO phonetics jargon (don't say "retroflex", "aspirated", "schwa"). ` +
      `Describe sounds the way a friendly tutor would ("the 'd' should curl your tongue back a bit", "give the 'kh' a puff of air"). ` +
      `If the audio is silent, unclear, or not speech, give score 0, verdict "didn't catch that", and ask them to try again in 'fix'. ` +
      `Keep every field short. Write naturally with simple punctuation. Do NOT use em-dashes or arrows.`

    // Pass raw bytes (a base64 *string* can be misread as a URL by the SDK).
    const bytes = Uint8Array.from(Buffer.from(audioBase64, 'base64'))
    const content = [
      { type: 'text' as const, text: prompt },
      { type: 'file' as const, data: bytes, mediaType: mimeType || 'audio/wav' },
    ]

    const run = async (modelId: string) => {
      const { object } = await generateObject({
        model: google(modelId),
        schema: FeedbackSchema,
        maxRetries: 2,
        temperature: 0.3,
        messages: [{ role: 'user', content }],
      })
      return object
    }

    // gemini-2.5-flash gets overloaded ("high demand"); on that, fall back to
    // 2.0-flash (also multimodal) before giving up.
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
    if (isBusy(error)) {
      return Response.json({ error: 'busy' }, { status: 503 })
    }
    if (/quota|rate.?limit|429|too many requests/i.test(msg)) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }
    console.error('Pronounce API error:', msg)
    return Response.json({ error: 'Failed to assess', detail: msg.slice(0, 300) }, { status: 500 })
  }
}
