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

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: FeedbackSchema,
      maxRetries: 1,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data: bytes, mediaType: mimeType || 'audio/wav' },
          ],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (/quota|rate.?limit|429|too many requests/i.test(msg)) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }
    console.error('Pronounce API error:', msg)
    return Response.json({ error: 'Failed to assess', detail: msg.slice(0, 300) }, { status: 500 })
  }
}
