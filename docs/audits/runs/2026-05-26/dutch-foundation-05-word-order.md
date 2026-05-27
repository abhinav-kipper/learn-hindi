# Audit: dutch-foundation-05-word-order

**File:** content/dutch/foundations/05-word-order.json
**Audit date:** 2026-05-26
**Total fixes applied:** 3
**Items not applied:** 2

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[3].hindi` + `.english` + `.context` + `.pronunciation`
   **Was:** `"bellen: ik bel op, aanzetten: ik zet aan, ..."` with infinitive label `bellen` (which is just "to call/ring", NOT a separable verb) and pronunciation `"BEL-len: ik BEL op, aan-ZET-ten: ..."`
   **Now:** `"opbellen: ik bel op, aanzetten: ik zet aan, ..."` with infinitive label `opbellen` (the actual separable verb meaning "to call up") and pronunciation `"OP-bel-len: ik BEL op, AAN-zet-ten: ..."`
   **Why:** (a) The phrase exemplifies separable verbs, so the headword must be the separable infinitive `opbellen`, not the simplex `bellen`. The example `ik bel op` only makes sense as the split form of `opbellen`. (b) Dutch separable-verb infinitives carry obligatory stress on the prefix (`OP-bel-len`, `AAN-zet-ten`), which is what distinguishes them phonologically from inseparable compounds. The dictionary-lookup hint in `context` was also updated from `op|staan` (irrelevant — that's the previous phrase) to `op|bellen` to match.

2. **Where:** field `phrases[2].pronunciation`
   **Was:** `"op-STAAN: ik STAA op. ..."`
   **Now:** `"OP-staan: ik STAA op. ..."`
   **Why:** Dutch separable-verb infinitives stress the prefix, not the root: `OP-staan`, not `op-STAAN`. Same phonological rule as fix #1.

3. **Where:** field `theory.sections[1].table.rows[2]` (Statement vs question table, wh-question example)
   **Was:** `"Waar ga jij naar toe?"`
   **Now:** `"Waar ga jij naartoe?"`
   **Why:** `naartoe` is a single word in modern standard Dutch spelling (per Groene Boekje / Van Dale). Writing it split as `naar toe` is a spelling error — the question pronoun-adverb form is fixed as `naartoe`. The colloquial/standard variants are `naartoe` (one word) or `heen` (alternative); never `naar toe` (two words).

## Items not applied (2)

1. **Where:** field `phrases[1].pronunciation`
   **Issue:** `"TOWS WERK ik AL-tayt"` — the romanization `TOWS` for `thuis` is an approximation of the `ui` diphthong /œy/ that English speakers may misread as the "ow" of "cow". A closer approximation is `TUS` or `TOEYS`.
   **Suggested fix:** Consider revisiting all `ui` romanizations across the Dutch foundation pronunciation fields for consistency — `huis`, `thuis`, `uit`, etc.
   **Why not applied:** This is a cross-file romanization convention question, not a single-file fix. Confidence <80% that `TOWS` is the wrong choice rather than the intentional house style; needs a broader pronunciation-style pass to settle.

2. **Where:** field `theory.sections[1].body`
   **Issue:** Body says "For wh-questions, the question word (waar, wanneer, waarom, hoe, wie) takes position 1, the verb stays in position 2, and the subject follows." This is mostly correct, but `wie` as the subject of the clause (`Wie komt er?`) doesn't show the inversion pattern the surrounding text implies — the subject IS the question word, so there's no "subject follows" step.
   **Suggested fix:** Add a brief note that when the question word is itself the subject (`wie`, `wat`), the verb sits at position 2 and there's no subject-verb inversion to speak of (e.g., `Wie komt er morgen?`).
   **Why not applied:** Pedagogical-meaning change at the level of nuance — adding a sub-case the author may have deliberately deferred to a later chapter on questions. Flagging for user review rather than rewriting.
