# Dutch Luisteren (Listening) module — design

**Date:** 2026-05-27
**Status:** Built + shipped
**Track:** Dutch exam-prep (Inburgeringsexamen, Phase 3)

## Problem

The Dutch exam track has KNM and Lezen (Reading) live; Listening / Writing / Speaking show "soon" on the home skill grid. Listening is the next-highest-value module. The central constraint: **the project has no native audio recordings** — only browser/Google TTS via `lib/speech.ts` (which already supports Dutch `nl`).

## Goal

Ship a Listening module at full parity with Lezen (module home + tiered study mode + 25-min timed mock + Chaina moments), using TTS to read Dutch transcripts aloud as the "audio". Approved design decisions:

- **Transcript UX:** audio-only by default; a "show transcript + translation" reveal for study (exam-realistic, mirrors Lezen's "show English" reveal).
- **Scope:** full Lezen parity.
- **Clip format:** mix of monologues (announcements, voicemails, weather) and short 2-person dialogues; single TTS voice reads everything; the revealed transcript labels speakers.

## Architecture (mirrors the Lezen module)

- `content/dutch/luisteren.json` — `{ clips: LuisterClip[] }`. 10 clips (4 A1 / 4 A2 / 2 B1), each with `lines: { speaker?, nl, en }[]` + 4 bilingual `LuisterQuestion`s (same shape as `LezenQuestion`).
- `lib/dutch/luisteren.ts` — loader + `buildAudioScript(clip)` (joins `lines[].nl`, no speaker labels, for TTS) + `drawMockSet(5)` + `scoreMockAttempt` (≥80% pass) + studied tracking + mock history. Keys: `dutch-luisteren-studied`, `dutch-luisteren-mock-attempts`. TDD'd (14 tests in `lib/dutch/luisteren.test.ts`).
- `app/dutch/luisteren/page.tsx` — module home: 3 tier folds, "Start timed mock" CTA, past-mocks fold. Clip cards show 🔊 + title + monologue/dialogue label + studied chip.
- `app/dutch/luisteren/[clipId]/page.tsx` — study mode: TTS audio player (play/stop/replay), "show transcript + translation" reveal (lines with speaker labels + greyed English), 4 question cards (tap to reveal + explanation), mark-studied → `luisterStudyDone` Chaina moment.
- `app/dutch/luisteren/mock/page.tsx` — 25-min timed, 5 clips audio-only (no transcript), 20 Qs, auto-advance 1.5s after reveal, pass ≥80% → `luisterMockPassed` (Confetti) / fail → `knmAttemptComplete`. Saves attempt with `clip_ids`.
- `components/design/moments.ts` — 2 new moments: `luisterStudyDone`, `luisterMockPassed` (Dutch lines, mirror the Lezen ones). `MomentKey` auto-derives from `MOMENTS`.
- `app/page.tsx` — the "Listening / Luisteren" SkillCard flipped from `soon` to live with a `${studied}/10 studied` count.

### Audio engine

`speak(buildAudioScript(clip), 'nl', onEnd)` from `lib/speech.ts` (Google `/api/tts` → browser `speechSynthesis` fallback). A small player polls `isSpeaking()` to sync the play/stop state and `stopSpeaking()` on unmount + clip change. No scrubbing/seek (TTS limitation) — play / stop / replay only.

## Boundaries / known limitations

- **TTS is the audio.** Robotic, no native recordings. Documented constraint, accepted for now.
- Single TTS voice reads dialogues; speaker labels appear only in the revealed transcript.
- No audio scrubbing (TTS can't seek).
- Dutch-only module; Hindi unaffected.
- Writing (Schrijven) and Speaking (Spreken) remain future phases.

## Testing

`lib/dutch/luisteren.test.ts` (14 tests): content well-formedness (ids, tiers, 4 bilingual Qs, dialogue speaker labels, unique ids, all tiers covered), `buildAudioScript` strips speaker labels, `drawMockSet` size, scoring pass/fail, studied tracking, mock-history persistence + corrupt-JSON fallback. Full suite stays green (257 passing; the 7 pre-existing `@testing-library/dom` infra failures are unrelated). The `moments-pick-line` count test updated 22 → 24.
