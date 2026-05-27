# Audit: hindi-foundation-05-postpositions

**File:** content/foundations/05-postpositions.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 3

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `theory.sections[3].table.rows[3]` (Compound postpositions table)
   **Was:** `["ke pehle", "before", "subah ke pehle (before morning)"]`
   **Now:** `["se pehle", "before", "khaane se pehle (before eating)"]`
   **Why:** "Before" in Hindi takes `se pehle`, not `ke pehle` — this matches the file's own phrase 5 (`khaane se pehle`) and grammar_notes[0] which explicitly flags `'before' uses 'se' not 'ke'`. The table row was teaching a grammatically wrong form.

2. **Where:** field `skill_breakdown[2].explanation`
   **Was:** `'ke piche' (behind)`
   **Now:** `'ke peeche' (behind)`
   **Why:** Internal romanization consistency. The phrase entry, grammar_notes[2], and the compound-postposition table in `theory.sections[3]` all use `peeche`. `piche` was a one-off spelling drift inside the skill_breakdown.

## Items not applied (3)

1. **Where:** field `skill_breakdown[0].explanation`
   **Issue:** `'ko' = to/for (direct/indirect object)` conflates two roles. `ko` marks the indirect object AND the (definite) direct object; "for" is more accurately `ke liye`. The simple-four table later phrases this better as "to / for (indirect object)".
   **Suggested fix:** Drop "for" and clarify: `'ko' = to (indirect object), or definite direct object marker`.
   **Why not applied:** Pedagogical-meaning rewrite of a beginner-friendly summary; <80% confidence the simpler line shouldn't stay for a foundation-level intro. Flagging for author review.

2. **Where:** field `phrases[9]` (`mere bina / tere saath`)
   **Issue:** The grammar_notes and other phrases use the `ke X` framing for compound postpositions (`ke saath`, `ke bina`). With pronouns, the form becomes `mere bina` (oblique pronoun + bina), which is fine — but the context line says `'ke bina' = without`. A learner might wonder why this phrase shows `mere bina` not `mere ke bina`. The connector drops with possessive pronouns (mera/tera/uska already encode `ka`).
   **Suggested fix:** Add a parenthetical: `'ke bina' = without (with pronouns: mere/tere/uske bina — the 'ke' is absorbed by the possessive)`.
   **Why not applied:** Deepens explanation but adds cognitive load to a phrase card; may be deliberate authorial trim. Flagging.

3. **Where:** field `phrases[*].pronunciation` (multiple)
   **Issue:** Prosodic-stress placement (e.g., `tum-HA-re LI-ye`, `DO ba-JE ke BAAD`, `KHA-ne se PEH-le`) doesn't always match standard lexical stress on these words in isolation.
   **Suggested fix:** None — verified intentional per CONTENT.md audit notes (sentence-level prosody, not lexical stress).
   **Why not applied:** Per CONTENT_RUBRIC §1.3 and §2.4 skip-list, prosodic CAPS is intentional across all 19 Hindi files.
