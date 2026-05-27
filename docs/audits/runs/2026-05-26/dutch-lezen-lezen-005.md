# Audit: dutch-lezen-lezen-005

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 1

## Fixes applied

None. The text, translation, word count, and all four MCQs audit clean against the rubric (Dutch grammar, schema, factual content, style). JSON parses; `correct_index` values all match the cited textual evidence; stated `word_count` of 69 matches an actual count of the body.

## Items not applied (1)

1. **Where:** field `questions[3].type`
   **Issue:** Q4 ("Wanneer is de hele familie samen?" / "When is the whole family together?") is tagged `type: "hoofdgedachte"` (main-idea), but it is really a `detail` question — it pulls out a single specific clause ("We eten elke zondag samen") rather than asking the reader to synthesize the overall topic. Q3 in the same text is the genuine main-idea question. Having two `hoofdgedachte` questions on a four-Q A1 text also crowds out the more diagnostic detail/woordbetekenis/gevolg coverage.
   **Suggested fix:** Re-tag `questions[3].type` from `"hoofdgedachte"` to `"detail"`.
   **Why not applied:** Question-type taxonomy is a pedagogical-classification call. The Lezen exam practice flow may weight question types when scoring or sampling drills, so changing the tag affects more than wording. Flagging for author review.
