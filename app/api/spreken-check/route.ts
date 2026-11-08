import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

/**
 * Spreken (A2 speaking) marker.
 *
 * The learner records an answer; the browser re-encodes it to 16 kHz mono WAV
 * (see lib/audio-recorder.ts) and posts it here. Gemini is multimodal, so it
 * hears the audio directly: there is no separate speech-to-text step, which
 * matters because the Web Speech API does not work on iOS, where this is
 * actually used.
 *
 * The most valuable field by far is `transcript`. A learner practising
 * speaking alone cannot otherwise tell the difference between "I said it
 * wrong" and "I said it fine but unclearly", and that distinction is the whole
 * game at A2. Everything else is built on top of what was genuinely heard.
 */
const CheckSchema = z.object({
  transcript: z
    .string()
    .describe(
      'EXACTLY what you heard, in Dutch, written out as spoken. Do NOT correct it, do NOT tidy the grammar, do NOT fill in words they did not say. This is the single most important field: the learner needs to see what actually came out of their mouth. If the audio is silent or not speech, return an empty string.',
    ),
  audible: z
    .boolean()
    .describe('false if the recording is silent, far too quiet, or not speech at all. When false, every other judgement is ignored.'),
  dutch: z
    .boolean()
    .describe('false if the learner answered in a language other than Dutch. A correct answer in English scores nothing on the real paper.'),
  covered: z
    .array(z.boolean())
    .describe(
      'One true/false per point in the list given, in the SAME ORDER. true only if the spoken answer genuinely covers that point. The real paper marks coverage first, so this drives the band.',
    ),
  band: z
    .enum(['not yet', 'nearly', 'pass', 'strong'])
    .describe(
      '"not yet" = points missing, or far too short, or hard to follow. "nearly" = most points there but the language gets in the way. "pass" = would score at A2. "strong" = clearly above the bar.',
    ),
  verdict: z.string().describe('One plain sentence on whether this would pass. Max ~18 words. Warm but honest.'),
  strength: z
    .string()
    .describe('One specific thing they did well, quoting their own words where possible. Max ~18 words.'),
  fluency: z
    .string()
    .describe(
      'One sentence on delivery only: pace, long pauses, hesitation, restarts, whether it sounded rehearsed or stuck. Not grammar. Max ~20 words.',
    ),
  pronunciation: z
    .string()
    .describe(
      'At most one sentence naming the single clearest pronunciation problem, in plain everyday words with NO phonetics jargon. Empty string if nothing stood out.',
    ),
  fixes: z
    .array(
      z.object({
        original: z.string().describe('the exact slip, copied VERBATIM from the transcript'),
        fix: z.string().describe("the corrected Dutch, keeping the learner's meaning"),
        note: z.string().describe('a one-line plain-English reason, no grammar jargon. Max ~16 words.'),
      }),
    )
    .max(4)
    .describe('0 to 4 real errors, the ones that cost marks first. Empty if the Dutch was fine.'),
})

type Check = z.infer<typeof CheckSchema>

/** Transient Gemini overload, possibly wrapped in the AI SDK retry envelope. */
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

const TYPE_RULES: Record<string, string> = {
  warmup:
    'This is a short personal question. A few clear sentences about their own life is a full answer. Do not expect complexity; do expect them to answer the actual question and to keep going for more than one sentence.',
  video:
    'Someone spoke to them and they are replying. Mark whether the reply fits what was said, and whether the register matches: a neighbour or colleague is "je", an official or a receptionist is "u". Answering the question that was asked comes before everything else.',
  foto:
    'They are describing a picture. Expect an opening like "Op de foto zie ik", then what is in it, then an opinion or a guess. Reward position words (links, rechts, op de voorgrond) and "aan het" for actions in progress. They cannot be wrong about the picture, so do not mark the content as false; mark whether they described enough of it.',
  keuze:
    'They choose between two options and justify it. A passing answer states the choice plainly, gives at least two reasons, and ideally mentions the option they did not pick. Reward linking words (ten eerste, ten tweede, omdat, want, daarom).',
  verhaal:
    'They tell a three-part story and have the longest time of any task. Expect past tense (the perfect is enough at A2) and sequencing words (eerst, daarna, vervolgens, uiteindelijk). A consistent present tense throughout is acceptable; mixing tenses is not. Expect noticeably more speech than the other task types.',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { audioBase64, mimeType, taskType, promptNl, promptEn, mustCover, seconds } = body as {
      audioBase64?: string
      mimeType?: string
      taskType?: string
      promptNl?: string
      promptEn?: string
      mustCover?: string[]
      seconds?: number
    }

    if (!audioBase64) return Response.json({ error: 'Missing audio' }, { status: 400 })
    const points = Array.isArray(mustCover) ? mustCover.filter((p) => typeof p === 'string') : []
    if (points.length === 0) return Response.json({ error: 'Missing checklist' }, { status: 400 })

    const rules = TYPE_RULES[taskType ?? ''] ?? TYPE_RULES.warmup
    const checklist = points.map((p, i) => `${i + 1}. ${p}`).join('\n')

    const prompt =
      `You are a fair, experienced examiner for the Dutch A2 inburgeringsexamen, Spreken (speaking) paper, ` +
      `and also a warm teacher. Listen to the attached recording of a learner's spoken answer.\n\n` +
      `THE TASK THEY WERE GIVEN (in Dutch): "${promptNl ?? ''}"\n` +
      (promptEn ? `In English: "${promptEn}"\n` : '') +
      `They had about ${seconds ?? 60} seconds to answer out loud, with no second attempt.\n\n` +
      `${rules}\n\n` +
      `THE ANSWER IS MARKED ON THESE POINTS, IN THIS ORDER:\n${checklist}\n\n` +
      `Return one true/false in "covered" for each numbered point above, in that exact order.\n\n` +
      `Write "transcript" as exactly what you heard, uncorrected, even if it is broken Dutch or has false starts. ` +
      `Never improve it. The learner is comparing it against what they meant to say.\n\n` +
      `Judge this as A2, not as a native speaker. An accent is completely fine and must never lower the band. ` +
      `Simple, correct, complete sentences should score well. Only flag pronunciation when it would genuinely stop a Dutch person understanding the word. ` +
      `If the recording is silent or is not speech, set audible false, transcript to an empty string and band "not yet". ` +
      `If they answered in English or another language, set dutch false and band "not yet".\n\n` +
      `Use plain, everyday words throughout. No phonetics or grammar jargon (do not write "voiced fricative", "subordinate clause", "V2"). ` +
      `Say it the way a kind tutor would. Keep every field short. Do NOT use em-dashes or arrows.`

    // Raw bytes: a base64 *string* can be misread as a URL by the SDK.
    const bytes = Uint8Array.from(Buffer.from(audioBase64, 'base64'))
    const content = [
      { type: 'text' as const, text: prompt },
      { type: 'file' as const, data: bytes, mediaType: mimeType || 'audio/wav' },
    ]

    const run = async (modelId: string) => {
      const { object } = await generateObject({
        model: google(modelId),
        schema: CheckSchema,
        maxRetries: 2,
        temperature: 0.2,
        messages: [{ role: 'user', content }],
      })
      return object
    }

    let object: Check
    try {
      object = await run('gemini-2.5-flash')
    } catch (e) {
      if (isBusy(e)) object = await run('gemini-2.0-flash')
      else throw e
    }

    // The UI zips `covered` against the checklist, so it must be exactly as
    // long as the checklist however the model replies.
    const covered = points.map((_, i) => object.covered?.[i] === true)

    // A silent or non-Dutch recording cannot have covered anything, whatever
    // the model filled in for the rest.
    const failed = object.audible === false || object.dutch === false
    return Response.json({
      ...object,
      covered: failed ? points.map(() => false) : covered,
      band: failed ? 'not yet' : object.band,
      fixes: failed ? [] : (object.fixes ?? []),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (isBusy(error)) return Response.json({ error: 'busy' }, { status: 503 })
    if (/quota|rate.?limit|429|too many requests/i.test(msg)) {
      return Response.json({ error: 'rate_limited' }, { status: 429 })
    }
    console.error('Spreken check error:', msg)
    return Response.json({ error: 'check-failed' }, { status: 500 })
  }
}
