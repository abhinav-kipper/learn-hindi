import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { getLessonById } from '@/lib/lessons'

export async function POST(req: Request) {
  try {
    const { messages, lessonId } = await req.json()

    const lesson = getLessonById(lessonId)
    if (!lesson) {
      return new Response('Lesson not found', { status: 404 })
    }

    const systemPrompt = buildSystemPrompt(lesson)

    // If no messages (initial trigger), send a hidden user message to prompt the AI to start
    const chatMessages = messages.length === 0
      ? [{ role: 'user' as const, content: 'Start the conversation. Set the scene and talk to me in character.' }]
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
