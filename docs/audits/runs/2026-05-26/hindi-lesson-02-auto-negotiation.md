# Audit: hindi-lesson-02-auto-negotiation

**File:** content/lessons/02-auto-negotiation.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 4

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `practice_prompt`
   **Was:** `'chodo, dusra auto dekh leta hoon'`
   **Now:** `'chodo, doosra auto dekh leta hoon'`
   **Why:** Internal-consistency fix — phrase 7 romanizes the same word as `doosra`. The variant `dusra` inside the practice prompt was a one-off typo. Single source-of-truth spelling within the file.

### Style (1 item)

1. **Where:** field `phrases[8].english` and `phrases[8].context`
   **Was:** english `"Fine, come sit down"`; context ended `"'baith ja' = sit (casual command)"`
   **Now:** english `"Fine, come on, sit down"`; context ended `"'baith ja' = sit (casual command), 'chal' = come on/alright (filler)"`
   **Why:** Original "come sit down" reads as if `chal` is the verb "come" — but `chal` here is a discourse-filler ("come on / alright"), not the motion verb. Disambiguated with a comma and added the gloss for `chal` so it parallels the existing `baith ja` gloss.

## Items not applied (4)

1. **Where:** field `grammar_notes[2]`
   **Issue:** Note says `'chaloge?'` "future tense with polite '-ge' ending shows respect even while negotiating." The `-ge` suffix is the 2nd-person familiar (`tum`) future ending — it isn't a respect marker. True respect would use `aap` + `chaliyega`. Calling `-ge` "polite" risks the learner mis-modeling register.
   **Suggested fix:** Rephrase as `"'chaloge?' = will you go? — 'tum' future shows you're being familiar-but-respectful (the auto register), not formal"` or similar.
   **Why not applied:** Pedagogical-meaning change. Author may have intended "polite" loosely (as in "not rude"). Flagging for review.

2. **Where:** field `phrases[7].hindi` — `pachattar`
   **Issue:** The standard romanization of 75 (पचहत्तर) is often written `pachhattar` (double-t). `pachattar` is also seen but less common.
   **Suggested fix:** Consider `pachhattar`.
   **Why not applied:** Debated romanization (rubric §2.4 skip list — devanagari sources vary, and both forms appear in colloquial usage). No clear majority style in repo.

3. **Where:** root level — missing `references` field
   **Issue:** Rubric §1.6 says `references[]` should be non-empty for lessons. This lesson has no `references` field at all.
   **Suggested fix:** Add `references: ["Snell & Weightman Ch. X", "Afroz Taj Lesson Y"]` matching the actual sources the author used.
   **Why not applied:** Fabricating source citations is worse than missing them. Lesson predates the 2026-05-21 wave that added the `references` field convention. Flagging for author to backfill.

4. **Where:** field `pronunciation` (various phrases)
   **Issue:** Some CAPS stress placements look counterintuitive in isolation (e.g. `muj-HE` in phrase 6, `na-HI` in phrase 4, `it-NA zya-DA` in phrase 2).
   **Suggested fix:** None — checked against rubric §1.3 / §2.4 / CONTENT.md Audit Notes.
   **Why not applied:** Rubric explicitly marks prosodic-stress CAPS as INTENTIONAL (sentence-level beat, not lexical stress). The same words show different stress markers across phrases in this file, consistent with the "where the spoken beat falls" model. No fix warranted.
