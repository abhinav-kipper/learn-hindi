import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { buildDutchSystemPrompt } from '@/lib/system-prompt-dutch'
import { getAnyLessonById } from '@/lib/lessons'
import { getDutchAnyLessonById } from '@/lib/dutch/lessons'

export async function POST(req: Request) {
  try {
    const { messages, lessonId, language = 'hindi', userContext } = await req.json()

    const lesson = language === 'dutch'
      ? getDutchAnyLessonById(lessonId)
      : getAnyLessonById(lessonId)

    if (!lesson) {
      return new Response('Lesson not found', { status: 404 })
    }

    const systemPrompt = language === 'dutch'
      ? buildDutchSystemPrompt(lesson, userContext)
      : buildSystemPrompt(lesson, userContext)

    const chatMessages = messages.length === 0
      ? [{ role: 'user' as const, content: 'Start the session. Introduce today\'s topic and give the first prompt.' }]
      : messages

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: chatMessages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
