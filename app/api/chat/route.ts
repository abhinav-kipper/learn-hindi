import { generateObject, APICallError } from 'ai'
import { google } from '@ai-sdk/google'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { buildDutchSystemPrompt } from '@/lib/system-prompt-dutch'
import { getAnyLessonById } from '@/lib/lessons'
import { getDutchAnyLessonById } from '@/lib/dutch/lessons'
import { ChatReplySchema, type ChatReply } from '@/lib/chat-schema'

// Matches Devanagari, Bengali, Tamil, Telugu, Gurmukhi, Gujarati, Kannada,
// Malayalam, Arabic, and Hebrew. We reject Hindi replies that smuggle in any
// of these despite the system prompt requiring romanized output.
const NON_LATIN_RE = /[ऀ-ॿঀ-৿਀-૿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ؀-ۿ֐-׿]/

function hasForbiddenScript(reply: ChatReply): boolean {
  return NON_LATIN_RE.test(reply.reply)
}

/**
 * Inspect any error returned by the AI SDK and decide whether it's a Gemini
 * rate-limit response. We unwrap AI_RetryError → its last underlying error
 * and check for either a 429 status code or the quota-exceeded message.
 */
function isRateLimitError(err: unknown): { retryAfterSeconds?: number } | null {
  const candidates: unknown[] = [err]
  const maybe = err as { errors?: unknown[]; lastError?: unknown }
  if (Array.isArray(maybe?.errors)) candidates.push(...maybe.errors)
  if (maybe?.lastError) candidates.push(maybe.lastError)

  for (const c of candidates) {
    const apiErr = c as { statusCode?: number; message?: string }
    const status = apiErr?.statusCode
    const message = apiErr?.message ?? ''
    if (status === 429 || /quota|rate.?limit|too many requests/i.test(message)) {
      const match = /retry in (\d+(?:\.\d+)?)s/i.exec(message)
      return { retryAfterSeconds: match ? Math.ceil(parseFloat(match[1])) : undefined }
    }
  }
  return null
}

export async function POST(req: Request) {
  try {
    const { messages, lessonId, language = 'hindi', userContext } = await req.json()

    const lesson = language === 'dutch'
      ? getDutchAnyLessonById(lessonId)
      : getAnyLessonById(lessonId)

    if (!lesson) {
      return new Response(JSON.stringify({ error: 'Lesson not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = language === 'dutch'
      ? buildDutchSystemPrompt(lesson, userContext)
      : buildSystemPrompt(lesson, userContext)

    const chatMessages = messages.length === 0
      ? [{ role: 'user' as const, content: "Start the session. Introduce today's topic and give the first prompt." }]
      : messages

    // generateObject already retries internally on schema/parse failures, so
    // we keep our own retry layer minimal — just one extra attempt if the
    // model emits non-Latin script into the reply field. maxRetries: 1 (down
    // from the SDK default of 2) keeps total backend calls bounded so we
    // don't burn the Gemini free-tier rate limit (20 req/min).
    let reply: ChatReply
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ChatReplySchema,
      system: systemPrompt,
      messages: chatMessages,
      temperature: 0.6,
      maxRetries: 1,
    })
    reply = result.object

    // Defense: if the model slipped non-Latin script into the reply field
    // (e.g. Devanagari), retry once asking for romanization.
    if (language === 'hindi' && hasForbiddenScript(reply)) {
      try {
        const retry = await generateObject({
          model: google('gemini-2.5-flash'),
          schema: ChatReplySchema,
          system: systemPrompt + '\n\nIMPORTANT: Your previous reply contained Devanagari/non-Latin script. Re-emit it with the reply field FULLY romanized (English alphabet a-z only).',
          messages: chatMessages,
          temperature: 0.3,
          maxRetries: 0,
        })
        if (!hasForbiddenScript(retry.object)) reply = retry.object
        // If still non-Latin, fall through with the original — better to
        // show something than to fail entirely.
      } catch {
        // Same — prefer original to a hard error.
      }
    }

    return new Response(JSON.stringify(reply), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Rate-limit (Gemini free tier = 20 req/min): surface a friendly 429
    // with a Retry-After header so the client can show "wait a sec" rather
    // than a generic try-again. APICallError exists on the standalone path.
    const rate = isRateLimitError(error)
    if (rate) {
      const retryAfter = rate.retryAfterSeconds ?? 20
      console.warn('Chat API rate-limited; advising client to retry in', retryAfter, 's')
      return new Response(
        JSON.stringify({ error: 'rate_limited', retryAfterSeconds: retryAfter }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        },
      )
    }

    console.error('Chat API error:', error instanceof APICallError ? error.message : error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
