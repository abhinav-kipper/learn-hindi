# Audit: hindi-foundation-03-past-tense

**File:** content/foundations/03-past-tense.json
**Audit date:** 2026-05-26
**Total fixes applied:** 8
**Items not applied:** 3

## Fixes applied

### Accuracy (6 items)

1. **Where:** field `phrases[7].hindi`
   **Was:** `bachhpan mein hum roz khelke aate the`
   **Now:** `bachpan mein hum roz khelke aate the`
   **Why:** Spelling consistency — `bachpan` is used in `grammar_notes` and `skill_breakdown` elsewhere in the same file. `bachhpan` is a single-instance variant.

2. **Where:** field `phrases[7].pronunciation`
   **Was:** `BACH-pan mein HUM ROZ khel-TE aa-TE THE`
   **Now:** `BACH-pan mein HUM ROZ khel-KE aa-TE THE`
   **Why:** Pronunciation must match the `hindi` field — phrase uses `khelke` (conjunctive participle, "having played"), not `khelte` (the habitual `-te` form). The pronunciation said the wrong word.

3. **Where:** field `theory.sections[4].body`
   **Was:** ``Main thaktha tha` = I used to get tired.``
   **Now:** ``Main thakta tha` = I used to get tired.``
   **Why:** Typo. The verb `thakna` (to get tired) takes the habitual `-ta` ending; `thaktha` has a spurious `h`.

4. **Where:** field `theory.sections[3].body`
   **Was:** ``Maine pee gaya` = I drank it down.``
   **Now:** ``Main pee gaya` = I drank it down (note: `jaana` as auxiliary overrides the `ne` rule — subject stays plain).``
   **Why:** Grammatical error — when `jaana` is the compound-verb auxiliary, the `ne` construction is suppressed (a well-known exception). `maine pee gaya` is ungrammatical; the standard form is `main pee gaya`. Also added a brief explanatory parenthetical so the reader notices the exception.

5. **Where:** field `phrases[3].english`
   **Was:** `I had said (to a male topic) / I had said (to a female topic)`
   **Now:** `I had said it (masc. object) / I had said it (fem. object)`
   **Why:** "To a male topic" wrongly implies the recipient's gender; the `ne` rule's verb agrees with the OBJECT's gender, not the addressee's. The phrase's own context line correctly states "Gender matches OBJECT". New gloss matches the underlying grammar.

6. **Where:** field `phrases[4].pronunciation`
   **Was:** `TUM ka-HAAN THE? / TUM ka-HAAN THI?`
   **Now:** `TUM ka-HAN THE? / TUM ka-HAN THI?`
   **Why:** Pronunciation should match the `hindi` field's romanization, which uses `kahan` (single `a`). The `-aa` doubling in the pronunciation field is inconsistent with the phrase's spelling.

### Style (2 items)

1. **Where:** field `theory.sections[0].body`
   **Was:** "Past habitual covers repeated or ongoing-in-the-past actions ..."
   **Now:** "Past habitual covers repeated or customary past actions ..."
   **Why:** "Ongoing-in-the-past" is the description of past continuous, not habitual — pedagogically misleading. "Customary" captures the right semantic range without the conflation.

2. **Where:** field `theory.sections[0].quick_check.explanation`
   **Was:** "Past habitual — the action was repeated/ongoing in the past."
   **Now:** "Past habitual — the action was repeated/customary in the past."
   **Why:** Same as above — kept the framing consistent between body and quick-check explanation.

## Items not applied (3)

1. **Where:** field `skill_breakdown[2].more_examples[3]`
   **Issue:** Spelling variant `kahaan` (doubled `aa`) in `tum kahaan jaa rahi thi?`, while the rest of the file uses `kahan`.
   **Suggested fix:** Normalize to `kahan` for in-file consistency.
   **Why not applied:** Per rubric §2.4 skip list — `kahan` vs `kahaan` is a debated romanization. Not auto-applied.

2. **Where:** field `grammar_notes[2]`
   **Issue:** Claim "theen (female plural)" — `theen` is one accepted romanization for the nasalized feminine plural form, but most of the file uses `thi` for both fem. sg. and fem. pl. The theory tables use `karti thi` for `hum` (plural) too.
   **Suggested fix:** Either drop the `theen` mention (since the file otherwise collapses fem. sg./pl. to `thi`) or call out the optional nasalization more explicitly.
   **Why not applied:** Pedagogical-meaning change — there's a real linguistic distinction here (some dialects/registers nasalize, some don't), and choosing which way to standardize is an authorial call. <80% confident which direction is "correct" for this codebase.

3. **Where:** field `phrases[5].pronunciation` (`MUJH-e PHONE ki-YA`)
   **Issue:** `MUJH-e` is an unusual syllabification — splitting after the aspirated `jh` looks awkward. More natural is `mu-JHE` or `MUJ-he`.
   **Suggested fix:** Change to `mu-JHE PHONE ki-YA`.
   **Why not applied:** Per CONTENT.md audit notes, pronunciation field formatting is prosodic (sentence-stress) not lexical, and intentional. The current `MUJH-e` may reflect a deliberate stress choice. Not auto-applied.
