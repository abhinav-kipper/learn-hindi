import { z } from 'zod'

/**
 * Schema for assistant chat messages. The chat API uses Gemini's structured
 * output to enforce this shape, so the client never has to parse free-form
 * text. `correction` is optional — set only when the tutor is correcting a
 * user mistake.
 */
export const ChatReplySchema = z.object({
  reply: z
    .string()
    .min(1)
    .describe(
      'The reply in the target language (Hindi or Dutch), romanized in ASCII for Hindi (English alphabet, no Devanagari/Arabic). For Dutch, write it in standard Dutch orthography.',
    ),
  english: z
    .string()
    .min(1)
    .describe('A short English translation of the reply.'),
  correction: z
    .object({
      original: z.string().describe('What the learner wrote that was wrong.'),
      correct: z.string().describe('The correct form they should have used.'),
      reason: z.string().describe('Short explanation — one sentence max.'),
    })
    .optional()
    .describe(
      "Set only when the learner's previous turn contained a mistake worth flagging. Omit entirely for first turns, English-only messages, or correct attempts.",
    ),
})

export type ChatReply = z.infer<typeof ChatReplySchema>
