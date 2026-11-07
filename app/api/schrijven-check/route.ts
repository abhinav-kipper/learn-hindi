import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Schrijven (A2 writing) marker. Grades a learner's answer the way the real
// paper is marked: first on whether every point the task asked for is covered,
// then on language. Mirrors the model-fallback pattern of /api/journal-check
// (Claude first for intent, Gemini when the key is absent or Claude is busy),
// and the client degrades to the task's own checklist + model answer offline.
const CheckSchema = z.object({
  covered: z
    .array(z.boolean())
    .describe(
      'One true/false per checklist point, in the SAME ORDER as the list given. true only if the answer genuinely covers that point. This is the most important field: the real paper marks on coverage.',
    ),
  verdict: z
    .string()
    .describe('One plain sentence on whether this would pass the task. Max ~18 words. Warm but honest.'),
  band: z
    .enum(['not yet', 'nearly', 'pass', 'strong'])
    .describe(
      'Overall judgement against A2. "not yet" = points missing or too short. "nearly" = covers most, language gets in the way. "pass" = would score. "strong" = clearly above the bar.',
    ),
  strength: z
    .string()
    .describe('One specific thing they did well, quoting their own words where possible. Max ~18 words.'),
  fixes: z
    .array(
      z.object({
        original: z.string().describe('the exact slip, copied VERBATIM from the answer (must appear character-for-character)'),
        fix: z.string().describe('the corrected Dutch, keeping the learner\'s meaning'),
        note: z.string().describe('a one-line plain-English reason, no grammar jargon. Max ~16 words.'),
      }),
    )
    .max(5)
    .describe('0 to 5 real errors, the ones that cost marks first (word order, verb form, de/het, missing opening or closing). Empty if the Dutch is fine.'),
  corrected: z
    .string()
    .describe(
      'THE LEARNER\'S OWN ANSWER, rewritten correctly. Keep their content, their details and their voice; fix only what is wrong. Do NOT substitute a different, better answer.',
    ),
})

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

function anthropicMissing(): boolean {
  return !process.env.ANTHROPIC_API_KEY
}

const TYPE_RULES: Record<string, string> = {
  formulier:
    'This is a FORM. Expect short entries, not sentences, except in any box that explicitly asks for a reason or motivation, which must be full sentences. Mark hard on format accuracy: a Dutch postcode is 4 digits + 2 letters (1015 CJ), dates are day-month-year, and email addresses must be plausible. Do not ask for sentences in plain data fields.',
  briefje:
    'This is a SHORT NOTE (briefje) of 3 to 5 sentences to someone the learner knows. Informal register is correct: "Hoi"/"Hallo" and "Groetjes"/"Groeten" are right, and a formal "Geachte heer/mevrouw" would be wrong here. It must be signed.',
  email:
    'This is a SEMI-FORMAL EMAIL of 4 to 6 sentences. It needs a proper opening and a matching closing: "Geachte heer/mevrouw" pairs with "Met vriendelijke groet"; "Beste <name>" is also fine. Mixing an informal opening with a formal closing, or omitting either, costs a mark. It must be signed.',
  vrij:
    'This is a SHORT FREE TEXT of about 4 or 5 sentences on an everyday topic. Full sentences, not a list. Simple correct sentences score better than ambitious broken ones; do not penalise plain language.',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { answer, taskType, promptNl, promptEn, mustInclude } = body as {
      answer?: string
      taskType?: string
      promptNl?: string
      promptEn?: string
      mustInclude?: string[]
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return Response.json({ error: 'Missing answer' }, { status: 400 })
    }
    const checklist = Array.isArray(mustInclude) ? mustInclude.filter((s) => typeof s === 'string') : []
    if (checklist.length === 0) {
      return Response.json({ error: 'Missing checklist' }, { status: 400 })
    }

    const typeRule = TYPE_RULES[taskType ?? ''] ?? TYPE_RULES.vrij
    const numbered = checklist.map((p, i) => `${i + 1}. ${p}`).join('\n')

    const sys =
      `You are a calm, experienced Dutch NT2 teacher marking one task from the A2 ` +
      `inburgeringsexamen Schrijven paper.\n\n` +
      `WHO IS WRITING: an adult learning Dutch, at or near A2. Their Dutch will be simple and will ` +
      `contain errors. That is expected at this level. You are marking against A2, not against a ` +
      `native speaker. Never rewrite simple-but-correct Dutch into something fancier.\n\n` +
      `THE TASK (as given to the learner, in Dutch):\n"""${(promptNl ?? '').slice(0, 600)}"""\n` +
      (promptEn ? `In English: "${promptEn.slice(0, 400)}"\n` : '') +
      `\nTASK TYPE RULES: ${typeRule}\n\n` +
      `THE MARKING CHECKLIST. The real paper scores on whether each point is covered. ` +
      `Return "covered" as one boolean per point, in exactly this order:\n${numbered}\n\n` +
      `HOW TO MARK:\n` +
      `1. covered: for each point, true only if the answer really does it. Be strict but fair. ` +
      `If the task asked for a concrete proposal and they only said "another day", that is false.\n` +
      `2. band: weigh coverage first, then language. Missing points cannot be a "pass".\n` +
      `3. strength: name one real thing they did well. Always find something.\n` +
      `4. fixes: at most five errors, most costly first. Each "original" MUST appear in their text ` +
      `character-for-character. Never invent one.\n` +
      `5. corrected: THEIR answer with the errors fixed. Keep their details, their names, their ` +
      `reasons, their voice. You are correcting, not replacing. If their answer is too short, fix ` +
      `what is there and do not pad it out.\n\n` +
      `HARD RULES:\n` +
      `- Never invent a correction whose "original" is not in the text.\n` +
      `- Never change their meaning. A correction fixes form, not message.\n` +
      `- Judge register by task type: informal in a briefje is correct, not an error.\n` +
      `- Write every field in plain English, short, no grammar jargon, no em-dashes, no arrows.\n\n` +
      `THE LEARNER'S ANSWER:\n"""${answer.slice(0, 2000)}"""`

    const run = (fn: () => Promise<{ object: unknown }>) => fn().then((r) => r.object)
    const runAnthropic = () =>
      run(() =>
        generateObject({
          model: anthropic('claude-sonnet-4-6'),
          schema: CheckSchema,
          maxRetries: 2,
          temperature: 0.2,
          prompt: sys,
        }),
      )
    const runGoogle = (modelId: string) =>
      run(() =>
        generateObject({
          model: google(modelId),
          schema: CheckSchema,
          maxRetries: 2,
          temperature: 0.2,
          prompt: sys,
        }),
      )

    let object: unknown
    let served: string
    if (anthropicMissing()) {
      served = 'gemini-2.5-flash'
      object = await runGoogle('gemini-2.5-flash')
    } else {
      try {
        object = await runAnthropic()
        served = 'claude-sonnet-4-6'
      } catch (e) {
        if (isBusy(e)) {
          try {
            object = await runGoogle('gemini-2.5-flash')
            served = 'gemini-2.5-flash'
          } catch {
            object = await runGoogle('gemini-2.0-flash')
            served = 'gemini-2.0-flash'
          }
        } else {
          throw e
        }
      }
    }

    // The model occasionally returns a short/long `covered` array. Normalise it
    // so the UI can always zip it against the checklist without crashing.
    const o = object as { covered?: boolean[] } & Record<string, unknown>
    const covered = Array.isArray(o.covered) ? o.covered : []
    o.covered = checklist.map((_, i) => covered[i] === true)

    return Response.json(o, { headers: { 'x-schrijven-model': served } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (isBusy(error)) return Response.json({ error: 'busy' }, { status: 503 })
    if (/quota|rate.?limit|429|too many requests/i.test(msg)) {
      return Response.json({ error: 'rate-limited' }, { status: 429 })
    }
    return Response.json({ error: 'check-failed' }, { status: 500 })
  }
}
