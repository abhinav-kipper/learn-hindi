import { generateObject, NoObjectGeneratedError } from 'ai'
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
  return NON_LATIN_RE.test(reply.hindi)
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

    // First attempt: schema-enforced structured output. Low temperature for
    // format adherence while still feeling natural.
    let reply: ChatReply
    try {
      const result = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: ChatReplySchema,
        system: systemPrompt,
        messages: chatMessages,
        temperature: 0.6,
      })
      reply = result.object
    } catch (err) {
      // Schema mismatch or parse failure — retry once with a stricter nudge.
      if (err instanceof NoObjectGeneratedError) {
        const result = await generateObject({
          model: google('gemini-2.5-flash'),
          schema: ChatReplySchema,
          system: systemPrompt + '\n\nIMPORTANT: Your previous response was malformed. Return ONLY a valid JSON object matching the schema. Keep the hindi field romanized.',
          messages: chatMessages,
          temperature: 0.3,
        })
        reply = result.object
      } else {
        throw err
      }
    }

    // Defense: if the model slipped non-Latin script into the hindi field
    // (e.g. Devanagari), retry once asking for romanization.
    if (language === 'hindi' && hasForbiddenScript(reply)) {
      try {
        const result = await generateObject({
          model: google('gemini-2.5-flash'),
          schema: ChatReplySchema,
          system: systemPrompt + '\n\nIMPORTANT: Your previous reply contained Devanagari/non-Latin script. Re-emit it with the hindi field FULLY romanized (English alphabet a-z only).',
          messages: chatMessages,
          temperature: 0.3,
        })
        if (!hasForbiddenScript(result.object)) {
          reply = result.object
        }
        // If still non-Latin after retry, fall through with the original —
        // better to show something than to fail entirely.
      } catch {
        // Same: prefer original to a hard error.
      }
    }

    return new Response(JSON.stringify(reply), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
