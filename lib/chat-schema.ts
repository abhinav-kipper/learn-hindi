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

/**
 * Write-back shape for the Chaina-as-friend companion: after a chat, the model
 * distills the conversation into durable updates for the Memory Card. All
 * fields optional — emit only what's genuinely worth remembering.
 */
export const MemoryUpdateSchema = z.object({
  newFacts: z
    .array(z.string())
    .optional()
    .describe('Durable new personal facts learned this chat (names, relationships, job, where they live, lasting preferences). NOT transient small-talk. Empty if nothing durable.'),
  newThreads: z
    .array(z.string())
    .optional()
    .describe('New open loops worth following up next time (e.g. "sister visiting next week", "job interview Friday").'),
  resolvedThreads: z
    .array(z.string())
    .optional()
    .describe('Existing open threads that got resolved/closed this chat and should be dropped. Match the existing thread wording.'),
  runningSummary: z
    .string()
    .optional()
    .describe('An updated 2-3 sentence gist of the whole relationship so far (not just this chat).'),
  lastTopic: z
    .string()
    .optional()
    .describe('A few words naming what this chat was mostly about.'),
})

export type MemoryUpdate = z.infer<typeof MemoryUpdateSchema>
