# Audit: dutch-making-plans

**File:** content/dutch/lessons/16-making-plans.json
**Audit date:** 2026-06-03
**Total fixes applied:** 3
**Items not applied:** 1

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[8].pronunciation` ("Zullen we om acht uur afspreken?")
   **Was:** `ZUL-len we om ACHt uur AF-spray-ken?`
   **Now:** `ZUL-len we om ACHT uur AF-spray-ken?`
   **Why:** Inconsistent stress casing. `acht` is the stressed beat, so the whole syllable should be CAPS (`ACHT`), not `ACHt`. Matches the file's syllable-stress convention.

2. **Where:** field `phrases[8].context` (separable-verb explanation for "afspreken")
   **Was:** "Combining 'Zullen we ...?' for the suggestion with 'afspreken' (separable: base or dictionary form here, moving 'af' to the end). ..."
   **Now:** "Combining 'Zullen we ...?' for the suggestion with 'afspreken'. Here 'afspreken' is the infinitive (the base or dictionary form), so the prefix 'af' stays attached and the whole verb goes to the end. It only splits when it is the finite verb, as in 'Hoe laat spreken we af?'. ..."
   **Why:** The old phrasing "moving 'af' to the end" was misleading. In the infinitive `afspreken` does NOT split; the prefix stays attached and the whole verb (af + spreken) moves to clause-end as one unit. The verb only separates when it is the finite verb in a main clause. This is the exact rule the lesson is teaching, so the description needed to match the grammar.

3. **Where:** field `grammar_notes[4]` ('je' vs 'jou'), final sentence
   **Was:** "After prepositions, both are correct but 'jou' is often preferred in writing."
   **Now:** "After a preposition you also use the object form, and the stressed 'jou' is the more common choice there: 'voor jou', 'met jou'."
   **Why:** The old sentence conflated register with medium ("preferred in writing") and was imprecise about what governs the choice after a preposition. The corrected version states the rule accurately (preposition takes the object form; stressed `jou` is the unmarked choice) and gives concrete examples.

## Items not applied (1)

1. **Where:** field `phrases[4]` ("Past zaterdag je?") + its context
   **Issue:** `passen` is used in the sense "to suit a schedule" ("Does Saturday work for you?"). The more textbook-standard verbs for "to suit someone's schedule" are `schikken` ("Schikt het je?") or `uitkomen` ("Komt het je uit?"); `passen` in this temporal sense is colloquial. Also, `je` here is the unstressed object pronoun, which is grammatically valid ("Past zaterdag je?"), but a learner could misread it as the subject "you".
   **Suggested fix:** Optionally swap `passen` for `schikken`/`uitkomen` for the most exam-safe register, or add a one-line context note that `je` here is the object pronoun, not the subject.
   **Why not applied:** `Past het je?`/`Past zaterdag je?` is genuinely current colloquial Dutch and the lesson is explicitly A2 casual (`exam_targeted: false`), so the choice is defensible and the context already frames it as "the short, friendly version". Swapping the verb would change the author's deliberate casual register, and the `je`-as-object reading is correct as written. Pedagogical-meaning call, flagging for user review.

## Focus-area verification (no fix needed)

- **`zin hebben om ... te + infinitive`** (phrase 1, grammar_notes[0]): correct. `te` present, infinitive at end, gloss provided.
- **`Zullen we ...?`** (phrases 2, 9, grammar_notes[1]): correct soft-suggestion modal; main verb as infinitive at clause end.
- **`gaan + infinitive`** (phrase 3, grammar_notes[2]): correct; `gaan` conjugates, infinitive at end. Conjugation list (ik ga, jij gaat, hij gaat, we gaan) accurate.
- **`afspreken` separable** (phrases 8, 9, grammar_notes[3]): split form "spreken we af" correct; te-infinitive "om af te spreken" correct; infinitive-stays-together now clarified (fix 2).
- **`je` vs `jou`** (phrases 4, 5, grammar_notes[4]): stressed `jou` in "Komt het jou uit?" correct; unstressed `je` valid; preposition rule corrected (fix 3).
- **Pronunciation**: `g`/`gaan` rendered "ch"/"chaan" (guttural), `oe`="oo"=/u/, `eu`="er", `ui`="ow", `j`="y" all internally consistent across the file. Only the `ACHt` casing was off (fix 1).
- **culture_notes (agenda culture)**: all four accurate, Dutch phrases correct ("Ieder betaalt voor zichzelf", "ik trakteer", "We moeten een keer koffiedrinken"). No fix.
- **references**: all three on the vetted allowlist (Naar Nederland, TaalCompleet, Bart de Pau / learndutch.org).
