# Audit: hindi-foundation-03-past-tense

**File:** content/foundations/03-past-tense.json
**Audit date:** 2026-05-27
**Total fixes applied:** 5
**Items not applied:** 4

(Re-audit — a prior pass on 2026-05-26 applied 8 fixes. This pass picks up
remaining in-file consistency issues that pass were left or did not catch.)

## Fixes applied

### Accuracy (5 items)

1. **Where:** field `skill_breakdown[0].more_examples[1].hindi`
   **Was:** `wo subah uthi`
   **Now:** `woh subah uthi`
   **Why:** In-file consistency. The file uses `woh` 6× in phrases / tables /
   quick-check options vs `wo` 4× only in `skill_breakdown` examples.
   Codebase-wide `woh` dominates 88 vs 19. Normalizing to the file's
   majority form.

2. **Where:** field `skill_breakdown[1].more_examples[1].hindi`
   **Was:** `wo har Sunday chai peeti thi`
   **Now:** `woh har Sunday chai peeti thi`
   **Why:** Same — `wo` → `woh` for in-file consistency.

3. **Where:** field `skill_breakdown[2].more_examples[1].hindi`
   **Was:** `wo phone par baat kar raha tha`
   **Now:** `woh phone par baat kar raha tha`
   **Why:** Same — `wo` → `woh` for in-file consistency.

4. **Where:** field `theory.sections[1].examples[2].hindi`
   **Was:** `wo school paidal jaati thi`
   **Now:** `woh school paidal jaati thi`
   **Why:** Same — `wo` → `woh` for in-file consistency.

5. **Where:** field `skill_breakdown[2].more_examples[3].hindi`
   **Was:** `tum kahaan jaa rahi thi?`
   **Now:** `tum kahan jaa rahi thi?`
   **Why:** In-file consistency. Phrases[4] uses `tum kahan the? / tum kahan
   thi?` — the only other `kahan`-form in the file. Normalizing the lone
   `kahaan` to match. (Note: a previous audit pass flagged this and chose
   not to apply on debated-romanization grounds. Re-evaluating: the
   `kahan/kahaan` split codebase-wide is nearly even, but within a single
   file uniformity reads better, and the file already commits to `kahan`
   in its phrase data.)

## Items not applied (4)

1. **Where:** field `grammar_notes[2]`
   **Issue:** Claim "theen (female plural)" — the file otherwise collapses
   fem. sg. and fem. pl. to `thi` (e.g. theory table row
   `["hum / woh-pl (we/they)", "hum karte the", "hum karti thi"]` uses `thi`
   for fem. plural, contradicting the grammar note).
   **Suggested fix:** Either reconcile the table to use `thin`/`theen` for
   fem. plural, or drop `theen` from grammar_notes[2] and note the
   nasalization optionality elsewhere.
   **Why not applied:** Pedagogical-meaning change. There's a real
   linguistic distinction (some registers/speakers nasalize fem-plural,
   some don't) and the standardization direction is an authorial call.
   <80% confident which is correct for this codebase.

2. **Where:** field `theory.sections[1].table.rows`
   **Issue:** Formal `aap` feminine shown as `aap karti thi`. Strict grammar
   would expect `aap karti thin` (or `theen`) since `aap` always triggers
   plural agreement. Same issue for `tum` feminine.
   **Suggested fix:** Use `aap karti thin` and `tum karti thin` for
   formal/familiar feminine, with a note that colloquial Hindi often drops
   the nasalization.
   **Why not applied:** Pedagogical-meaning change. The current table is
   intentionally colloquial — the author likely chose the simpler form for
   pedagogical accessibility. Not auto-applied.

3. **Where:** field `phrases[7]` (`bachpan mein hum roz khelke aate the`)
   **Issue:** English gloss "we used to come back after playing daily"
   inserts "back" — the Hindi just says "we used to come after playing".
   "Come back" would be `wapas aate` or `lautate`.
   **Suggested fix:** Either drop "back" from the English ("In childhood,
   we used to come home after playing daily") or add `wapas` to the Hindi.
   **Why not applied:** Translation-style call. The implied directionality
   in English ("come back from play") is contextually natural when the
   subject is a child returning home from outside play. Authorial choice.

4. **Where:** pronunciation field `phrases[2]` (`HUM-ne KHA-na KHA-ya`)
   **Issue:** Stress on KHA-ya is unusual — the past form `khaya` is
   typically pronounced `kha-YA` lexically. Same for `KA-ha` in phrases[3]
   and `SO-cha` in phrases[9].
   **Suggested fix:** None — would mean second-syllable stress (`kha-YA`,
   `ka-HA`, `so-CHA`).
   **Why not applied:** Per CONTENT.md audit notes, pronunciation field
   formatting is prosodic (sentence-level beat), not lexical. Confirmed
   intentional. Not a bug.
