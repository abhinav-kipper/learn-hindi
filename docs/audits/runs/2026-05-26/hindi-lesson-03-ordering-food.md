# Audit: hindi-lesson-03-ordering-food

**File:** content/lessons/03-ordering-food.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 2

## Fixes applied

None. The file passes accuracy, style, and structural checks under the rubric's clear-confidence threshold.

Spot-checks that all came back clean:
- Verb-gender agreement (`milegi` correctly feminine because `chai` is feminine; `aaunga` correctly masculine 1st-person future).
- Register consistency within phrases (the `tum`/`yaar` shift in phrase 10 — `banate ho ... yaar` — is a deliberate casual-rapport register, not a slip).
- Number list complete and correctly romanized (`ek, do, teen, chaar, paanch, chhe, saat, aath, nau, das, bees, pachaas, sau`).
- Romanization endings already match style guide (`karta`-style single-vowel: `dena`, `rakhna`, `karke`, `aaunga`, `banate`, `sakta`, `bata`, `laga`).
- `chh` digraph used correctly (`chhe`, `chhutta`, `acchi` n/a here).
- Pronunciation field follows the documented prosodic-stress convention (CAPS marks sentence beat, not lexical stress — see CONTENT.md Audit Notes 2026-05-26).
- Practice-prompt voice is directive, system-prompt register, no AI-cliché openers ("Let's", "dive in", "It's important to note" — none present).
- Cultural claims verified (Mumbai cutting chai, UPI prevalence at street stalls, left-hand etiquette, refusing chai social weight — all accurate).
- JSON parses; required fields (`id`, `title`, `phrases`, `grammar_notes`, `culture_notes`, `skill_breakdown`, `practice_prompt`) all present and well-typed.

## Items not applied (2)

1. **Where:** field `phrases[8].hindi` ("chhutta nahi hai, UPI se le lo") vs `practice_prompt` ("chhutta nahin hai bhaiya, UPI chalega?")
   **Issue:** Within-file inconsistency in romanizing नहीं — `nahi` in the phrase, `nahin` (with nasal n) in the practice prompt.
   **Suggested fix:** Standardize to `nahi` (matches the rest of this file's phrase and matches the prevailing form across the situations corpus — `02`, `04`, `05`, `06`, `07`, `08`, `09` all use `nahi` in phrase/pronunciation fields). Practice prompt would become `"chhutta nahi hai bhaiya, UPI chalega?"`.
   **Why not applied:** `nahi` vs `nahin` is a debated romanization (analogous to the rubric §2.4 skip list's `chahiye`/`chaahiye`); both forms appear deliberately across the codebase. Flagging for author judgment rather than forcing a corpus-wide convention silently.

2. **Where:** root object — missing `references[]` array.
   **Issue:** Rubric §1.6 calls `references[]` non-empty for foundations and lessons. Lessons 01–06 predate the requirement and lack the field; only 07–10 cite Snell & Weightman / Afroz Taj.
   **Suggested fix:** Add `references` citing the sources the lesson actually draws from (likely Snell & Weightman Ch. on imperatives + Afroz Taj on ordering/food chapters), e.g. `["Snell & Weightman — Teach Yourself Hindi, Ch. 10 (imperatives) + Ch. 13 (compound verbs)", "Afroz Taj — A Door Into Hindi, Lesson 6 (food vocabulary)"]`.
   **Why not applied:** Citations require source verification — fabricating chapter numbers without confirming the material actually maps to these phrases would be worse than leaving the field absent. Flagging for the author to fill once verified.
