# Audit: dutch-lezen-lezen-008

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 1

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `texts[lezen-008].questions[3].options_nl[1]` (the woordbetekenis distractor that is also the correct answer for "Wat is een 'balie'?")
   **Was:** `Een loket of receptie waar je iemand te woord staat`
   **Now:** `Een loket of receptie waar je geholpen wordt`
   **Why:** Dutch grammar/role-reversal bug. `je iemand te woord staat` parses as "you address/attend to someone" — subject `je` does the attending, which inverts the intended meaning. The accompanying `options_en` already reads "A counter or reception desk where you are helped" (passive — the visitor is helped). The corrected Dutch matches that passive sense and the actual function of a balie in the text ("Je kunt niet zomaar binnenlopen bij de balie"). Reads cleanly at A2.

### Style (0 items)

None applied.

### Structural (0 items)

None applied. JSON parses; `word_count` field claims 137 — verified actual count is 137. All required fields present (`id`, `tier`, `topic`, `title_nl`, `title_en`, `body_nl`, `body_en`, `word_count`, `questions`, `references`). All 4 questions have valid `type`, both-language question + 4-option arrays, `correct_index` within range, and `explanation_en`.

## Items not applied (1)

1. **Where:** field `texts[lezen-008].body_nl` — sentence "Als je de afspraak niet afzegt, kan het zijn dat je een boete moet betalen of dat je vooraan in de wachtrij je plek verliest."
   **Issue:** The phrase "vooraan in de wachtrij je plek verliest" ("lose your place at the front of the waiting list") is semantically odd in an appointment-no-show context. A no-show usually means being moved to the back of the queue or losing priority — "vooraan" (at the front) implies the visitor already had a privileged spot, which the rest of the text doesn't establish. The English mirror sentence has the same oddness ("you may lose your place at the front of the waiting list").
   **Suggested fix:** Reword to "of dat je achteraan de wachtrij wordt gezet" (NL) / "or that you are put at the back of the queue" (EN), OR drop the "vooraan" qualifier: "of dat je je plek in de wachtrij verliest" / "or that you lose your place in the queue."
   **Why not applied:** Pedagogical-meaning change — the original may be referring to a specific gemeente/huisarts triage practice where existing patients hold priority slots and forfeit them on no-show. <80% confident the rewrite is more accurate to civic reality. Flagging for author review.

## Quick checks

- Word count claim (137) matches actual whitespace-split count (137).
- Dutch V2 rule respected throughout body_nl. Subordinate clauses after `als` and `dat` correctly send the verb to the end (`afzegt`, `verliest`, `kunt komen`, `nakomen`).
- Modal + separable verb stack correct: `kunt nakomen`, `moet betalen`, `kunt verlengen`, `moet afzeggen`.
- Article gender correct: `de huisarts`, `de tandarts`, `de praktijk`, `de website`, `de balie`, `de wachtrij`, `de afspraak`, `de gemeente` (all `de`-words).
- All 4 questions have `correct_index === 1` (option B). This is the existing pattern; not flagged because each correct option is genuinely the right answer per the text, but worth noting if future audits want to spot-check distractor variety.
- BRP, balie, gemeente, huisarts, tandarts spellings + lowercase usage all correct per CONTENT_RUBRIC 1.5.
