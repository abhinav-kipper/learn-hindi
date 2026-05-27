# Audit: dutch-lezen-lezen-004

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Scope:** text `lezen-004` ("Wat ik eet") + its 4 questions only
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

The `lezen-004` text and its four questions pass every rubric axis on this pass:

- **Dutch grammar (rubric §1.2):** V2 respected throughout ("'s Ochtends eet ik...", "Tussen de middag eet ik...", "Op zondag eten we..."). De/het and adjective endings correct — notably "een groot ontbijt" (no `-e` because `ontbijt` is a het-word preceded by `een`) and "Nederlands eten" (no `-e` because `eten` is a bare het-noun). Standard A1 collocations used correctly: "tussen de middag", "warm eten", "hagelslag", "stroopwafel als tussendoortje".
- **Schema / structural (rubric §1.6):** JSON parses. All required fields present (id, tier, topic, title_nl/en, body_nl/en, word_count, questions, references). Stated `word_count: 68` matches the actual NL body word count exactly. Four questions present with correct types (detail / detail / hoofdgedachte / hoofdgedachte), each with parallel `options_nl`/`options_en` arrays of length 4, valid `correct_index`, and an `explanation_en`.
- **Pedagogical accuracy (rubric §1.4):** Every `correct_index` matches the textual evidence:
  - Q1 (evening meal) → index 2 "Aardappels met groente en vlees of vis" — text: "Ik eet aardappels met groente en vlees of vis."
  - Q2 (big breakfast day) → index 3 "Op zondag" — text: "Op zondag eten we soms een groot ontbijt."
  - Q3 (main idea) → index 1 "Wat de schrijver elke dag eet" — accurately captures the text's daily-meal overview frame.
  - Q4 (typical Dutch snack) → index 1 "Een stroopwafel" — text: "Soms eet ik een stroopwafel als tussendoortje."
- **English translation:** Faithful and natural. "Eet ik warm" rendered idiomatically as "I eat a hot meal" (rather than literal "I eat warm"), which is the correct A1 reading.
- **Cultural / factual (rubric §1.5):** Hagelslag, stroopwafel, "warm eten 's avonds", and Sunday brunch with eggs and bacon are all accurate Dutch food-culture references for an A1 reader. The `references` array correctly cites "Naar Nederland A1" and "Voedingscentrum.nl".
- **Style (rubric §2):** No AI-cliché openers, no throat-clearing, no padding. Prose is tight and concrete. Question stems are directive and unambiguous; distractors in all four MCQs are plausibly textual (drawn from other meal slots in the same body), not transparently wrong — good A1 reading-comprehension design.

No fixes applied; no items flagged for review.
