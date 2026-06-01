# Chaina as a Friend — a persistent companion who remembers you

**Date:** 2026-06-01
**Status:** Design approved, pre-implementation
**Audience:** The app owner first (a learner whose top motive is "partner/family
speaks Hindi"), then any casual Hindi learner. Hindi-only for MVP; the
architecture is language-aware so a Mr. Stroopwafel companion can follow.

## Problem

Chaina exists as two things today and neither builds a relationship:

1. A **tutor/character** *inside* per-lesson practice (`/practice/[id]`) — a
   per-lesson, 8–10-turn conversation that resets and forgets you each time.
2. A **popup mascot** — the `moments.ts` / `MomentStage` system that fires
   short voiced reactions on app beats.

Both are transactional. The deepest, least-gimmicky source of fun in a language
app is *connection* — using the language with someone who matters and who knows
you. We have the rare ingredients to make that real (Gemini chat + a beloved
mascot + her own ElevenLabs voice) and we're not using them for it.

## Goal

A third mode: **a persistent person you talk to who remembers you across
sessions.** Not a lesson, not a popup — an ongoing relationship.

## The one beat we protect

You open the app and she says:

> *"arey [name]! kal tum thake the — aaj better?"*

A callback that proves she remembers. **If that beat lands and repeats, the
feature works.** Every decision below serves making that beat real, cheap, and
reliable.

## Locked decisions (2026-06-01)

- **Surface — a dedicated `/chaina` mode.** Standalone, always-available
  persistent chat with its own entry point, separate from lesson practice. One
  ongoing relationship thread (not reset per session). Keeps the *friend* and
  *tutor* personas cleanly apart and gives us a home to grow.
- **Corrections — friendly, but she still corrects.** She keeps the current
  correction discipline (flag real mistakes via the existing `correction`
  field) but in a warm friend tone, not a schoolteacher one. *Rationale:* the
  owner wants real learning to keep happening while chatting — so chatting with
  a friend still feeds the same `correction → lib/mistakes.ts → /mistakes drill`
  pipeline. Best of both: connection *and* feedback.
- **Proactivity — a light home nudge.** When she has an open thread and it's
  been a while, a small "Chaina left you a message" sticker appears on home and
  opens the chat with her line. No OS notifications in MVP (those come later via
  the existing notification infra).

## Persona

- A **friend, not a schoolteacher.** Warm, curious about your life, teasing,
  uses your name. Hinglish-leaning so a beginner never drowns (more English
  scaffolding than the strict lesson tutor).
- **Asks about you** — your day, your people, your plans — and *remembers the
  answers* (that's what the memory engine is for).
- **Still keeps you honest.** When you make a real Hindi mistake she corrects it
  warmly ("arey, chhoti si baat — ...") via the `correction` field, then keeps
  the conversation moving. She does NOT nitpick every micro-slip the way a drill
  would; she corrects what's worth teaching and lets trivial things slide to
  protect the chat flow.

## Memory model (the engine)

A compact, persistent **Memory Card**, one per language, in localStorage under
`${prefix}-chaina-memory`:

```ts
interface ChainaMemory {
  facts: string[]          // durable personal facts; cap ~20, deduped
  threads: string[]        // open loops to follow up on; cap ~8
  runningSummary: string   // 2–3 sentence gist of the relationship
  lastTopic: string        // what you last talked about
  lastSeenAt: string       // ISO; drives the returning-callback opener
  chatCount: number        // how many times you've talked
}
```

The ongoing transcript lives separately under `${prefix}-chaina-thread`
(reuse the existing `lib/chat-history` shape; cap the stored tail, e.g. last
~30 turns, so localStorage stays bounded).

**Injection.** The Memory Card renders into the system prompt as a
`WHAT YOU REMEMBER ABOUT [name]` block on every turn. Bounded by the caps above
so per-turn token cost stays flat.

**Write-back.** On session end (leave/idle/explicit "bye"), *one* cheap Gemini
call summarizes the new turns into updated `facts` / `threads` /
`runningSummary` / `lastTopic`, then we merge → dedupe → cap and persist. One
extra call **per session**, not per turn — safe against the Gemini free-tier
20 req/min limit. The write-back prompt is tuned to extract *durable* facts
(names, relationships, job, recurring preferences, ongoing events), not
transient chatter.

## Session lifecycle

1. Open `/chaina` → load Memory Card + transcript tail.
2. If `now - lastSeenAt > ~12h` (or first ever), she opens with a **callback**
   referencing a `thread` or `fact`; else she just continues the thread.
3. You chat freely. She replies in-persona, recasts/corrects real mistakes via
   `correction`, asks about you.
4. On leave/idle → fire write-back → update memory + `lastSeenAt`.

## Reuse (what we DON'T rebuild)

- **Endpoint.** Add a companion path to `app/api/chat/route.ts` (a `mode:
  'companion'` flag or a sibling route) that skips the lesson lookup, builds the
  friend prompt, and runs the same `generateObject` + `ChatReplySchema`.
  `correction` is already optional in the schema — no schema change needed.
- **Prompt.** New `lib/chaina-friend-prompt.ts` `buildFriendPrompt(profile,
  memory)`. Reuses the romanization + register + correction-format rules from
  `lib/system-prompt.ts`, swaps the tutor framing for the friend framing, and
  injects the Memory Card block.
- **Client.** Reuse the `useChat` hook (re-pointed at the companion endpoint,
  no `lessonId`), `ChaiGalliChatMessage`, `<Mascot>`, and her ElevenLabs voice
  clips / TTS for an optional "hear it" on her lines.
- **Corrections pipeline.** Her `correction` outputs flow into the existing
  `addMistake(..., source: 'practice')` path so chat mistakes show up in
  `/mistakes` and the drill — zero new plumbing.

## Storage keys (new)

- `${prefix}-chaina-memory` — the Memory Card (JSON).
- `${prefix}-chaina-thread` — the ongoing transcript tail.
- `${prefix}-chaina-nudge-dismissed:YYYY-MM-DD` — once-per-day cap for the home
  "she left you a message" sticker.

## MVP — smallest cut that proves the beat

1. `/chaina` route: one persistent thread, reusing `useChat` against the
   companion endpoint.
2. `buildFriendPrompt(profile, memory)` — friend persona, friendly-but-corrects,
   injects the Memory Card.
3. `lib/chaina-memory.ts` — Memory Card load/save/merge/cap (TDD'd, mirrors the
   shape of `lib/mistakes.ts` capping).
4. Write-back summarization on session end (companion endpoint `mode:
   'remember'`, or a tiny `/api/chat/remember`).
5. Returning-callback opener.
6. Home entry: a "talk to Chaina" hero sticker + the light nudge sticker.

## Out of MVP (clean follow-ons)

- OS push notifications (via the existing notification infra).
- Weaving `recurringMistakes` (from `lib/mistakes.ts`) into what she practices
  with you.
- A Dutch / Mr. Stroopwafel companion (architecture is already language-keyed).
- Voice autoplay of her lines (manual "hear it" only in MVP).

## Risks & mitigations

- **Token budget / cost.** Memory Card caps + transcript-tail cap keep per-turn
  size flat; write-back is one call per session.
- **Memory quality.** The write-back prompt must extract durable facts, not
  noise; start conservative (high bar for what becomes a `fact`).
- **Persona drift into tutor-mode.** The friend prompt states the
  correct-but-don't-nitpick balance explicitly and gives examples, the same way
  the tutor prompt enforces strictness.
- **Privacy.** Everything is localStorage, single-user — fine, but the Memory
  Card is personal; the Settings "reset progress" danger-zone should also wipe
  `${prefix}-chaina-*`.
- **Cold start.** With an empty Memory Card she leads with curiosity ("hum
  pehli baar baat kar rahe hain — apne baare mein batao") so the first session
  populates facts.
