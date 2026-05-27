# Audit: dutch-lezen-lezen-003

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 1

## Fixes applied

None. The text and its four questions are accurate (grammar, V2 word order, separable verb `meenemen`, fronting of time adverbials), structurally clean (JSON parses, all required fields present, word_count 70 verifies), and within style guidelines.

Spot-checks confirmed:
- "Vandaag is het typisch Nederlands weer." — V2 satisfied, adjective collocation correct.
- "'s Ochtends is er zon." / "In de middag komt er regen." / "'s Avonds is het droog." — all V2-correct with fronted time adverbials.
- "Ik neem mijn paraplu mee." — `meenemen` separable, prefix `mee` correctly detached at clause end.
- Q1 correct_index 1 = `Tien graden` matches "De temperatuur is tien graden". ✓
- Q3 correct_index 1 = `Een typische dag met Nederlands weer` matches the through-line of the text. ✓
- Q4 correct_index 2 = `Het is niet erg` / "It is not a problem" matches "Maar ik vind het niet erg". ✓

## Items not applied (1)

1. **Where:** `questions[1]` (Q2 — "Wat neemt de schrijver mee naar buiten?")
   **Issue:** The Dutch question uses `neemt mee` (takes with), which in the text applies only to the paraplu — `Ik neem mijn paraplu mee. Ik draag ook een jas en een sjaal.` The coat and scarf are `draagt` (wears), not `neemt mee`. The correct option `Een paraplu en een jas` therefore conflates `meenemen` with `dragen`, and the answer key explanation extends it further to include the scarf. The other three options are clearly wrong, so the question still has a single best answer at A1 level, but the question/options/explanation aren't strictly consistent with the lexical distinction the text introduces.
   **Suggested fix (one of):**
   - Reword the question to `Wat draagt de schrijver bij regen?` / "What does the writer wear in the rain?" and update the correct option to `Een jas en een sjaal` (and adjust distractors).
   - Or keep the question but tighten the correct option + explanation to only the umbrella, e.g. `Een paraplu` / "An umbrella", and update distractors.
   **Why not applied:** Pedagogical-meaning change — touches what the question is testing (separable-verb `meenemen` vs `dragen` distinction). Flagging for user review per rubric §1.4 / §3.
