# Dutch "Sounds" — a from-zero pronunciation ladder

**Date:** 2026-05-29
**Status:** Design approved, pre-implementation
**Audience:** Primarily the app owner (an English-speaking absolute beginner in
Dutch), then generalizable to any A0 beginner. Dutch-only for now.

## Problem

The existing `content/dutch/foundations/02-pronunciation.json` is a *reference*
chapter: it assumes the learner can already read Dutch and jumps straight to the
hard sounds (g/ch, ui, eu, schwa). There is no from-zero on-ramp that teaches an
absolute beginner the sounds of the alphabet, then how those sounds combine into
words, then how words link in speech.

This module is that on-ramp. It feeds *into* the existing foundation, which
stays as the reference chapter.

## Goal

A structured, progressive ladder that takes someone who has never spoken a word
of Dutch from individual letter sounds → words → connected speech. Phase 1 is
pure teaching + listening + self-checked repetition + ear-training (no
recording). Phase 2 (later, out of scope here) adds record-yourself
pronunciation feedback per sound — the schema is built so that drops in cleanly.

## The ladder (8 stages)

Each stage's sounds carry **one A0-easy, high-frequency anchor word** (concrete
nouns / cognates) so an abstract sound always has a usable hook. Anchor words
introduced early are **reused as the Stage 7 blend targets** — no new vocab at
the blending step.

1. **The alphabet & its sounds** (`alphabet`)
   - All 26 letters: letter name + sound value + a keyword (kids'-chart style).
   - Keywords: a-appel, b-boom, c-citroen, d-dak, e-eend, f-fiets, **g-goud
     (guttural, previewed)**, h-huis, i-inkt, j-jas (j=y), k-kat, l-lamp,
     m-maan, n-neus, o-oog, p-pen, q-(rare), r-roos, s-sok, t-tafel, u-uur,
     v-vis (v→f), w-water, x-(rare), y-(rare/ij), z-zon (z→s).
   - q/x/y flagged as rare with a one-line note.
   - Practice: listen & repeat per letter + a 5-item "which letter did you hear" ear quiz.

2. **Short vowels** (`short-vowels`)
   - a-man, e-pen, i-kip, o-pot, u-bus.
   - Practice: listen & repeat + a short vowel-ID ear quiz.

3. **Long vowels & the doubling rule** (`long-vowels`)
   - aa-maan, ee-zee, oo-boom, uu-vuur, + open-syllable long (ga, zo).
   - Practice: listen & repeat + minimal-pair ear quiz (man/maan, bom/boom,
     zon/zoon, pen/peen, kop/koop).

4. **Easy consonants + Dutch twists** (`consonants`)
   - Close-to-English (b, d, f, k, l, m, n, p, s, t) covered briskly; then the
     twists each as a card with an anchor word: v→f (vis), z→s (zon), w (water),
     j=y (jas), rolled/uvular r (rood), plus final devoicing (hond→hont, bad→bat).
   - Practice: listen & repeat + a short "twist" ear quiz.

5. **The guttural g / ch / sch** (`guttural-g`)
   - g-goud, ch-lachen/nacht, sch-school/schip.
   - Practice: heavy listen & repeat + ear quiz (pick the word with the g/ch sound).

6. **Compound vowels** (`compound-vowels`)
   - ij/ei-mijn/klein, oe-boek, au/ou-vrouw/goud, ui-huis, eu-deur/neus.
   - Practice: listen & repeat + ear quiz on the confusable rounded ones
     (ui vs oe vs ou) and the identical pair (ij = ei).

7. **Blending into words** (`blending`)
   - Blend builder using earlier anchor words: m‑aa‑n→maan, b‑oe‑k→boek,
     h‑ui‑s→huis, s‑ch‑oo‑l→school, w‑a‑t‑er→water, p‑e‑n→pen.
   - Practice: each part playable in sequence, then the whole word; complete all.

8. **Linking & rhythm** (`linking`)
   - Schwa (de→duh, het→ut, lopen→LOH-pun), first-syllable stress (WA-ter,
     MOR-gen), word linking (een appel→ay-NAP-pel, het is→ut-IS).
   - Practice: listen & repeat connected-speech chunks + a short "tap the
     stressed syllable" quiz.

## Unlock model

Rolling frontier: **completing a stage unlocks the next two.** Stage 1 starts
open. Concretely, a stage at `order = i` is unlocked when
`i <= maxCompletedOrder + 2` (with `maxCompletedOrder` = -1 when nothing is
done, so stages 0 and 1 are open at the start). The learner always has a small
window of unlocked-but-unfinished stages to choose from, but can't leap ahead to
the hard sounds.

A stage **completes** when: every card is marked *got it* AND its ear-quiz is
passed (if present) AND its blend set is finished (if present).

## Stage screen UX

- Orange Dutch theme, Mr. Stroopwafel mascot (`useTheme()` / `<Mascot>`).
- One-line Mr. Stroopwafel intro bubble for the stage.
- **Sound cards** deck — each card shows: the grapheme/letter big, a plain
  how-to hint, the anchor word + English gloss, and a 🔊 button (Google TTS via
  `lib/speech.ts`, `speak(word, 'nl')`). Listen → say aloud → mark *got it /
  again*.
- **Ear quiz** block (stages 1, 2, 3, 4, 5, 6, 8 where specified): hear a TTS'd
  Dutch word, tap which word/letter it was. Reuses the quiz-card shake/reveal
  pattern.
- **Blend builder** (stage 7): word assembles part-by-part, each part playable,
  then the whole.
- Completion CTA marks the stage done → Confetti + a Chaina moment
  (`pronStageDone`, Dutch line) → back to the ladder, next two stages now lit.

## Module home (the ladder)

- Route `/dutch/sounds`. Header: orange band, Mr. Stroopwafel, "Sounds"
  (English) + italic Dutch subtitle "uitspraak".
- Goal banner: "learn to speak Dutch from zero — letters → words → flow."
- Vertical list of the 8 stages as Stickers: locked (dimmed + lock glyph),
  unlocked (tappable + progress ring), complete (green ✓). Overall
  "N / 8 stages" progress at top.

## Home integration

A prominent "Sounds — *learn to speak from zero*" card on the Dutch home
(`app/page.tsx`), placed before the A1 lessons (it is pre-A1 foundation), with a
`N/8 stages` count.

## Data model

Content: `content/dutch/pronunciation-course.json`.

```ts
interface PronStage {
  id: string            // 'alphabet', 'short-vowels', ...
  order: number         // 0-based, drives the ladder + unlock frontier
  title: string         // English label
  subtitle: string      // Dutch, italic
  goal: string          // one-line "what you'll be able to do"
  intro: string         // Mr. Stroopwafel bubble
  cards: PronCard[]
  earQuiz?: EarQuiz
  blend?: BlendSet
}
interface PronCard {
  id: string            // unique, e.g. 'g-goud'
  grapheme: string      // 'g' / 'ui' / 'a' (shown large)
  hint: string          // plain how-to
  anchor: { word: string; en: string }   // huis / house — TTS reads `word`
  kind: 'letter' | 'vowel' | 'consonant' | 'digraph'
  note?: string         // e.g. "rare in Dutch" for q/x/y
}
interface EarQuiz {
  prompt: string        // "Which word did you hear?"
  items: { say: string; options: string[]; correctIndex: number }[]  // `say` is TTS'd in nl
}
interface BlendSet {
  words: { parts: { text: string }[]; whole: string; en: string }[]
}
```

Loader: `lib/dutch/pronunciation.ts` (TDD'd). API:
- `getStages(): PronStage[]`, `getStage(id): PronStage | undefined`
- `markCardDone(cardId)`, `isCardDone(cardId)`
- `markEarQuizPassed(stageId)`, `isEarQuizPassed(stageId)`
- `isStageComplete(stage): boolean` — derived from cards + earQuiz + blend
- `unlockedStageIds(): string[]` — frontier rule above
- `getCourseProgress(): { completed: number; total: number }`

Storage keys (prefix `dutch`, per app convention):
- `dutch-pron-cards-done` — JSON array of card ids (blend words tracked as their `whole` id)
- `dutch-pron-earquiz-done` — JSON array of stage ids whose ear-quiz passed

Stage completion + unlock are **derived** from those two sets (no separate
stored "stages-done" to drift out of sync).

## Chaina moments

- `pronStageDone` — Dutch line, fires on completing a stage (debounce-800ms).
- Optional `pronCourseDone` — fires once when all 8 stages complete.

Registered in `components/design/moments.ts` (+ Dutch `LINES`); the
`moments-pick-line` test count bumps accordingly.

## Testing

- `lib/dutch/pronunciation.test.ts` (TDD): loader returns all 8 stages in order;
  unlock frontier (nothing done → stages 0,1 open; completing stage 0 → up to
  order 2 open; completing 2 → up to order 4); `isStageComplete` requires cards
  + earQuiz + blend; progress count.
- No component tests required beyond the existing infra (the 7 chronically
  failing component test files are unrelated).

## Phase 2 seam (out of scope now)

Each `PronCard` isolates one target sound + anchor word. A future `record` mode
adds a 🎙 "say it" button per card that records the learner and scores it
(Web Speech API STT in `nl-NL`, or an audio-similarity check). No schema change
needed — the card is already the unit of feedback. Phase 1 ships pure
listen / repeat / ear-quiz / blend.

## Out of scope (Phase 1)

- Recording / pronunciation feedback (Phase 2).
- Hindi parity (Dutch-only for now).

## Audio quality upgrade — ElevenLabs (in progress, 2026-05-29)

The free Google Translate TTS is robotic and weak on isolated sounds, so we are
pre-rendering natural ElevenLabs voices to static mp3s (live TTS stays as the
fallback). Pipeline built (`scripts/generate-audio.mjs`, `lib/dutch/sounds-audio.ts`,
`speakUrl()` in `lib/speech.ts`); manifest ships empty until generated.

**3-voice plan (`eleven_multilingual_v2`):**
1. Dutch pronunciation — the Sounds module → **female** Dutch voice (`ELEVEN_VOICE_NL`).
2. Mr. Stroopwafel mascot (nl moment lines) → **male** Dutch voice (`ELEVEN_VOICE_NL_MASCOT`, planned).
3. Chaina mascot + Hindi (hi moment lines) → **female** Hindi voice (`ELEVEN_VOICE_HI`, planned).

Generation needs a fresh session (the env's open network policy only applies to
new sessions) + the 3 voice IDs. See the CLAUDE.md "🚧 IN PROGRESS" handoff for
the exact next steps (generate Sounds, then extend the generator + `chaina-voice.ts`
for the mascot clips). The key is used only at generation time, never shipped.
