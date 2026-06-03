# Audit: simple-sentences

**File:** content/dutch/foundations/11-simple-sentences.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

The chapter is accurate, consistent, and stylistically sound. No fixes needed.

### Accuracy checks performed (all pass)

- **Basic order (subject + finite verb + rest):** `Ik drink koffie`, `Zij woont in Utrecht`, `Wij eten brood` all correct. Table and skill_breakdown examples match.
- **V2 (finite verb is the second element):** Every plain-order example places the conjugated verb second (`Ik` / `drink`, `Zij` / `woont`, `Hij` / `speelt`). quick_check #2 (`woont` = second) correct.
- **Fronting forces inversion (verb stays second, subject moves after it):** `Vandaag werk ik` (NOT `Vandaag ik werk`), `In Amsterdam woont mijn zus`, `Om zes uur eten wij`, `Hier woont mijn zus`, `Morgen ga ik` all correct. The warning callout and quick_check #3 explicitly reject `Vandaag ik werk`. Culture note `Morgen ga ik naar de markt` correct.
- **er is / er zijn agreement:** `Er is een probleem` (sg), `Er zijn veel mensen` (pl), `Er is geen melk` (sg, correctly singular under negation), `Er is een winkel`, `Er zijn twee kamers`, `Er zijn veel kinderen` all correct. quick_check #4 correctly rejects `Er is veel mensen`.
- **Consistency with A2 word-order chapter (05-word-order.json):** This chapter is a clean A1 subset/preview. Same terminology (verb-second, "second element", inversion, "verb stays second / subject moves behind it"). Nothing contradicts the A2 chapter, which extends into separable verbs, rest-of-verb-at-end, and subordinate verb-final — all explicitly deferred here ("The bigger word-order rules come later").
- **quick_check.correct_index:** All four verified (0, 1, 1, 1) and match their explanations.
- **Pronunciation (syllable-stress format):** Hyphenated syllables with CAPS on the stressed beat throughout; `van-DAACH`, `AY-ten`, `proh-BLAYM`, `MEN-sen` etc. consistent with the codebase's Dutch respelling conventions.

### Schema / structural

- Valid JSON. Required fields present (id, title, level, skills, phrases, grammar_notes, culture_notes, skill_breakdown, practice_prompt, references, theory).
- `references[]` non-empty and all vetted (Shetter & Ham, Naar Nederland, Bart de Pau/learndutch.org).
- All 4 theory sections have heading, body, cutting_intro, quick_check, plus a table or examples.
- Jargon glossed in plain words (inversion gloss "the verb and subject swap places" present; "subject" / "verb" used plainly; no infinitive jargon needed at this A1 level).

### Style

- No AI-cliché openers, no em-dashes, no arrows. Cutting/Stroopwafel intros are in-voice. Practice prompt is directive and uses the correction-tag format.

### Items noted but not changed

- `pronunciation` for Utrecht renders as `U-trecht` (no CAPS-stressed syllable, "trecht" not respelled). This matches the existing codebase convention in `content/dutch/lessons/05-transport.json` (`U-trecht`), so it was left as-is for consistency. Not an accuracy error.

## Linters

- `node scripts/lint-content.mjs` → clean (no em-dashes, arrows, or clichés).
- `node scripts/lint-quality.mjs` → clean (references vetted, jargon glossed).
