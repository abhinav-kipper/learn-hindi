# Audit: dutch-knm-politics-constitution

**File:** content/dutch/knm.json
**Audit date:** 2026-05-26
**Scope:** category `"politiek"` only (17 questions: knm-001, -007, -013, -019, -025, -031, -037, -043, -049, -055, -061, -067, -073, -079, -085, -091, -097)
**Total fixes applied:** 1
**Items not applied:** 2

## Fixes applied

### Accuracy (1 item)

1. **Where:** `questions[].explanation_en` for `knm-085` (Wat betekent gelijke behandeling als grondrecht?)
   **Was:** "...The Commissie Gelijke Behandeling enforces this right."
   **Now:** "...The College voor de Rechten van de Mens (Netherlands Institute for Human Rights, which replaced the former Commissie Gelijke Behandeling in 2012) enforces this right."
   **Why:** Factual update. The Commissie Gelijke Behandeling (CGB) was merged into the College voor de Rechten van de Mens on 2 October 2012. The codebase already uses the current name in `knm-098` (workplace discrimination), so the politics-category explanation was the outlier. Keeps the old name as a parenthetical so learners who encounter older study materials still recognise the reference.

## Items not applied (2)

1. **Where:** `knm-079` (Welk grondrecht beschermt de vrijheid van meningsuiting in Nederland?)
   **Issue:** The question is slightly tautological — it asks "which fundamental right protects freedom of expression?" and the correct answer is "the right to freedom of expression." Reads as "X = X."
   **Suggested fix:** Reframe question (e.g. "Welk artikel van de Grondwet beschermt de vrijheid van meningsuiting?" with options being article numbers, OR keep the current framing but make the question "Welke vrijheid wordt beschermd door artikel 7 van de Grondwet?").
   **Why not applied:** Reframing changes the pedagogical target (concept-recall vs. constitutional-article recall) — confidence in the right direction <80%. The Naar Nederland workbook style does often use surface-level identification questions of this shape, so the existing framing is defensible.

2. **Where:** `knm-049` (Welk orgaan maakt nationale wetten in Nederland?)
   **Issue:** Strictly, Dutch laws (wetten in formele zin) are made jointly by the regering (government) and the Staten-Generaal — Article 81 Grondwet says "De wetten worden vastgesteld door de regering en de Staten-Generaal gezamenlijk." Option 1 ("De Staten-Generaal") omits the regering. The explanation softens this ("government proposes, parliament must approve"), but technically incomplete.
   **Suggested fix:** Either rephrase option 1 to "De regering en de Staten-Generaal samen", or rephrase the question to "Welk orgaan moet wetten goedkeuren?" (which body must approve laws?).
   **Why not applied:** Naar Nederland and Inburgering study materials routinely simplify this to "het parlement / de Staten-Generaal maakt de wetten" because the regering's role is the proposal/co-signing step, not the legislative-body identity. Changing it could confuse learners against the textbook framing. Pedagogical-meaning change with <80% confidence.

## Notes (not findings — recorded for context)

- All 17 politiek questions have grammatically correct Dutch in question + options + explanation. No V2 violations, no de/het slips, no agreement errors.
- `correct_index` was spot-checked against verifiable civic facts (King = head of state, 150 Tweede Kamer seats, 75 Eerste Kamer seats, voting age 18, NL is constitutional monarchy + EU founder, separation of church and state, gemeenteraad as elected local body, burgemeester appointed by Crown, wethouder portfolio holder, commissaris van de Koning chairs PS + GS, Provinciale Staten elect Eerste Kamer). All correct.
- Style: explanations are tight, no AI-cliché openers, no "Let's dive in," no tautologies. No edits warranted under §2.
- `knm-091` describes the Netherlands as "one of the founders of the EU" — strictly NL co-founded the predecessor EEG (1957) and signed the Treaty of Maastricht (1992) that created the EU. Standard simplification in civic-integration materials; left as-is.
