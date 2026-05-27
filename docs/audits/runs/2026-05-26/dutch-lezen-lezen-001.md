# Audit: dutch-lezen-lezen-001

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 2

## Fixes applied

### Accuracy (1 item)

1. **Where:** `texts[0].questions[3].type`
   **Was:** `"hoofdgedachte"`
   **Now:** `"detail"`
   **Why:** Question 4 ("Wat doet de schrijver 's avonds?") asks about a specific factual detail in the text, not the main idea. The text directly states "Ik kook eten en kijk soms televisie" and the correct option simply restates that fact. Tagging it as `hoofdgedachte` misclassifies the cognitive task — the first `hoofdgedachte` question in this text (Q3) is the genuine main-idea question. Per rubric §1.6 schema correctness, question-type metadata must match the question's actual function so the user gets accurate practice across all four Lezen sub-skills.

### Style (0 items)

No style fixes needed. No AI-clichés, throat-clearing, or padding.

## Items not applied (2)

1. **Where:** `texts[0].word_count`
   **Issue:** Field reads `78`. Manual count of `body_nl` yields ~73-74 words depending on whether `'s` (genitive contraction in `'s Avonds`) is counted as a separate token. The discrepancy is small (4-5 words off, ~6%).
   **Suggested fix:** Recalculate using a consistent tokenizer rule across all 10 texts and update each entry; or document the counting convention in CONTENT.md.
   **Why not applied:** Pedagogical-meaning-adjacent (the field is shown to the user as an estimate). Worth aligning across the whole file in one pass rather than spot-fixing one entry. Flagging for batch follow-up.

2. **Where:** `texts[0].body_en` — sentence "At eight o'clock I go to my work."
   **Issue:** Literal translation of "naar mijn werk". Natural English would be "I go to work" (no article/possessive).
   **Suggested fix:** Change to "I go to work" — or, if the goal is to preserve the Dutch syntactic mapping for the learner, leave as is.
   **Why not applied:** Stylistic choice the author may have made deliberately to mirror the Dutch surface structure word-for-word, which is a common A1 reading-aid convention. Below the 80% confidence threshold per rubric §3.

## Notes (verified clean)

- **Dutch grammar in body:** V2 respected throughout. Separable verb `opstaan` correctly split in `Ik sta ... op`. Adjective endings, articles (`een douche`, `het werk` implied via `mijn werk`, `de kantine`, `de middag`), and time-expression word order all correct. Idiom `tussen de middag` used correctly.
- **Question Dutch grammar:** All four questions and 16 options grammatically clean. No de/het slips.
- **`correct_index` verification (all four):**
  - Q1 idx 1 → "Om zeven uur" — matches body "om zeven uur op". CORRECT.
  - Q2 idx 2 → "Op een kantoor" — matches body "op een kantoor in Utrecht". CORRECT.
  - Q3 idx 1 → "Een dag in het leven van de schrijver" — accurate main-idea capture. CORRECT.
  - Q4 idx 2 → "Kookt en kijkt televisie" — matches body "Ik kook eten en kijk soms televisie". CORRECT.
- **Tier A1 appropriateness:** Simple present tense throughout, common A1 vocabulary (douche, ontbijt, koffie, brood, kaas, kantoor, broodje, kantine, televisie, bed), short main clauses, no subordinate-clause word order. Topic (daily routine) is core A1 territory. Tier label is appropriate.
- **English translation accuracy:** Faithful to the Dutch. One stylistic literalism flagged above; semantically all correct.
- **AI-cliché:** None. Body is plain narrative voice; explanations are direct quote-and-gloss format.
