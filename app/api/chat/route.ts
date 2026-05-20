import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { getLessonById } from '@/lib/lessons'

export async function POST(req: Request) {
  const { messages, lessonId } = await req.json()

  const lesson = getLessonById(lessonId)
  if (!lesson) {
    return new Response('Lesson not found', { status: 404 })
  }

  const systemPrompt = buildSystemPrompt(lesson)

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
