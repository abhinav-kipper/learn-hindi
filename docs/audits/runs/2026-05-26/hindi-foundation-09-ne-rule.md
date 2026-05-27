# Audit: hindi-foundation-09-ne-rule

**File:** content/foundations/09-ne-rule.json
**Audit date:** 2026-05-26
**Total fixes applied:** 5
**Items not applied:** 3

## Fixes applied

### Accuracy (4 items)

1. **Where:** field `phrases[8].hindi`
   **Was:** `mein roya / mein royi`
   **Now:** `main roya / main royi`
   **Why:** `mein` means "in" (में). The pronoun "I" is `main` (मैं). The pronunciation field already read `MAIN RO-ya / MAIN RO-yi`, confirming the hindi text was a typo. This is the only phrase in the file that introduced this mismatch.

2. **Where:** field `phrases[7].pronunciation`
   **Was:** `US-ne mu-JHE YEH ba-TAA-yi`
   **Now:** `US-ne mu-JHE YEH ba-TA-yi`
   **Why:** Hindi text uses `batayi` (single `a`); pronunciation field had `TAA` (double). Aligned pronunciation to the canonical hindi spelling per §1.3 (style-guide single-vowel where ambiguity isn't needed).

3. **Where:** field `theory.sections[3].table.rows[6]` (pronoun fused-forms table)
   **Was:** `["ye / we (pl.)", "inhone / unhone", "they (near/far)"]`
   **Now:** `["ye / wo (pl.)", "inhone / unhone", "they (near/far)"]`
   **Why:** `we` is "we" in English; the demonstrative for "those" is `wo` (वो). Typo. Confirmed by grammar_notes line 2 (`wo→usne (sg) / unhone (pl)`) and the rest of the file using `wo`.

4. **Where:** field `theory.sections[3].examples[5].breakdown`
   **Was:** `we + ne → unhone (plural, oblique form)`
   **Now:** `wo + ne → unhone (plural, oblique form)`
   **Why:** Same `we`→`wo` typo as above, in the breakdown for `unhone gaana gaaya`.

### Style (1 item)

1. **Where:** field `theory.intro` (opener)
   **Was:** `Welcome to the chapter Hindi learners fear most.`
   **Now:** `This is the chapter Hindi learners fear most.`
   **Why:** "Welcome to..." is on the AI-cliché list (§2.1, "Welcome to your journey"). Direct opener preserves the framing without the throat-clearing.

## Items not applied (3)

1. **Where:** field `phrases[6].hindi` — `maine usse phone kiya` ("I called him/her")
   **Issue:** Standard idiom for "called him/her on the phone" is usually `maine usko phone kiya` (with `ko` marking the recipient). `usse` is "with/from him" — defensible in colloquial usage but slightly off the canonical form.
   **Suggested fix:** `maine usko phone kiya`. The pronunciation/context would also need a touch-up.
   **Why not applied:** Pedagogical-meaning shift; <80% confidence that the author didn't deliberately use the colloquial `usse` form (some regional speakers do). Flagging for review.

2. **Where:** phrase 3 (`humne movie dekhi`) vs theory section 4 table (`ham → hamne`) and example (`hamne movie dekhi`)
   **Issue:** The file uses both `humne` and `hamne` as romanizations of हमने. Inconsistent within the file (phrase uses `humne`, theory uses `hamne`). Quick_check at section 4 even contrasts them as if they were different forms.
   **Suggested fix:** Pick one (probably `hamne`, matching the explicit table) and normalize throughout.
   **Why not applied:** Debated romanization (per §2.4 skip list — both forms are seen in codebase). Author may have intended both as acceptable variants. Flagging for review.

3. **Where:** field `theory.sections[3].quick_check.options[2]` — `"humne khaana khaayi"`
   **Issue:** The option uses `humne` (the very form that appears in phrase 3 as the canonical), then pairs it with a verb-agreement mistake. Pedagogically risks reinforcing the impression that `humne` itself is the wrong spelling, when the actual error is `khaayi` (fem.) on `khaana` (masc.).
   **Suggested fix:** Change to `hamne khaana khaayi` so the only mistake is the verb-gender mismatch, not the pronoun romanization.
   **Why not applied:** Same debated-romanization rationale as item 2. The explanation does correctly identify the verb-agreement failure as the issue, so the pedagogy still lands — but worth a second look.
