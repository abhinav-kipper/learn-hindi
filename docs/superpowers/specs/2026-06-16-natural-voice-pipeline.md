# Natural-voice pipeline (ElevenLabs) — content authoring reference

**Date:** 2026-06-16
**Why this exists:** the "Adjectives & Agreement" foundation shipped with its
"hear it" buttons falling back to the robotic Google/browser voice instead of
the natural ElevenLabs voice every other chapter uses. Root cause: new spoken
strings were never added to the audio pipeline. This spec pins the voice
identity and makes coverage a CI gate so it can't happen again.

## Voices we use

These are **voice ids**, not secrets — safe to keep here. They select which
ElevenLabs voice the generator renders.

| Track / surface | Voice | Voice id | Env var |
|---|---|---|---|
| **Hindi** — all lesson/foundation "hear it" phrases + theory examples, the Hindi "Sounds" module, and the Chaina mascot moment lines + barks | **Anika** (Sweet, Lively and Warm, `hi`) | `RABOvaPec1ymXz02oDQi` | `ELEVEN_VOICE_HI` |
| Dutch — Sounds module + Dutch lesson/foundation phrases | a Dutch female (e.g. `Ido` / a chosen `nl` voice) | set when generating | `ELEVEN_VOICE_NL` |
| Dutch — Mr. Stroopwafel mascot lines | a Dutch male | set when generating | `ELEVEN_VOICE_NL_MASCOT` |

Model: `eleven_multilingual_v2` (default), speed `0.85`.

## The API key — NEVER commit it

The `ELEVENLABS_API_KEY` is a live secret and must **never** be committed to
this repo or written into any file here. The clips are static once rendered, so
the runtime never needs the key — it is used only at generation time. Keep the
key in one of:
- your shell env / a gitignored `.env.local` when running the generator locally, or
- a secret manager (1Password etc.).

If a key is ever pasted into a chat/PR/issue, **rotate it** in the ElevenLabs
dashboard.

## How a Hindi spoken string becomes a natural-voice clip

1. The app calls `speak(romanizedString, 'hi')` (`lib/speech.ts`).
2. `speak` looks the **parenthetical-stripped romanized string** up in
   `content/hi-audio.json` → plays `public/audio/hi/<hash>.mp3` if present.
3. If absent, it falls back to Google TTS → browser `speechSynthesis` (the
   robotic voice). That fallback is the bug we are guarding against.

So every Hindi "hear it" string needs two things:
- a **Devanagari** entry in `content/hi-translit.json` (fed to ElevenLabs for a
  correct accent; the romanized Latin alone reads with an English accent), and
- a rendered clip recorded in `content/hi-audio.json` + the mp3 on disk.

## Pipeline when adding/editing Hindi content (lessons, foundations)

1. Author the content JSON (`phrases[].hindi`, `theory.sections[].examples[].hindi`).
2. Add a romanized → Devanagari pair for every **new** spoken string to
   `content/hi-translit.json`.
3. Generate the clips (needs the key + Anika voice id):
   ```
   ELEVENLABS_API_KEY=… ELEVEN_VOICE_HI=RABOvaPec1ymXz02oDQi node scripts/generate-audio.mjs
   ```
   It is idempotent: only new strings are rendered, everything else is skipped.
4. Commit the new `public/audio/hi/*.mp3` plus the updated `content/hi-audio.json`
   and `content/hi-translit.json`. **Do not commit the key.**
5. Verify: `npm run audio:check` (must print "all N strings have a clip").

## The guard (CI lint)

`scripts/check-hi-audio.mjs` (`npm run audio:check`) collects every spoken
string from `content/lessons` + `content/foundations` and fails if any lacks a
translit entry or a rendered clip. It is wired into `.github/workflows/ci.yml`,
so a PR that adds Hindi content **without its natural-voice clips goes red**.
No key is needed at CI time — it only checks the committed clips/manifests.

> Note: the weekly Gemini auto-lesson cron writes content but not audio, so its
> PRs will fail this check until clips are generated (step 3) and committed.
> That is intended: it forces the voice step before merge.
