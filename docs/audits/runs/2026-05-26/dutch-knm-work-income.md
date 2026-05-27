# Audit: dutch-knm-work-income

**File:** content/dutch/knm.json
**Audit date:** 2026-05-26
**Scope:** category `werk` (Work) only — 17 questions (knm-002, 008, 014, 020, 026, 032, 038, 044, 050, 056, 062, 068, 074, 080, 086, 092, 098)
**Total fixes applied:** 1
**Items not applied:** 2

## Fixes applied

### Accuracy (1 item)

1. **Where:** `questions[knm-092].options_nl[1]`
   **Was:** `"Minstens 16 weken betaald verlof rondom de bevalling, inclusief 4-6 weken voor de bevalldatum"`
   **Now:** `"Minstens 16 weken betaald verlof rondom de bevalling, inclusief 4-6 weken voor de bevaldatum"`
   **Why:** Typo — `bevalldatum` (double "ll") is not a Dutch word. The compound noun is `bevaldatum` (single "l", from stem `beval-` + `datum`) or `bevallingsdatum`. Since this option is the correct answer the user is expected to recognise, the misspelling reduces clarity.

### Style (0 items)

None applied — Dutch options and explanations across the 17 werk questions read tightly. No AI clichés, no throat-clearing, no tautologies.

## Items not applied (2)

1. **Where:** `questions[knm-086].explanation_en`
   **Issue:** Claims AOW age is "currently 67 years". As of 2026 the AOW age is 67 (and small monthly increments are scheduled in some upcoming years), so "currently 67" is technically correct but liable to drift over time.
   **Suggested fix:** Replace with "67 in 2026, indexed to life-expectancy" or similar future-proof phrasing.
   **Why not applied:** Factual claim is correct as of the audit date; rewriting it requires deciding on a long-lived phrasing the user may want to handle as a global pattern, not a one-off.

2. **Where:** `questions[knm-080].question_nl`
   **Issue:** Spelling `Hoelang` vs `Hoe lang`. Both are recorded by Van Dale; Genootschap Onze Taal prefers `Hoe lang` for the temporal sense ("for how long").
   **Suggested fix:** Change to `Hoe lang betaalt de werkgever ...` for the more widely-recommended written form.
   **Why not applied:** Debated romanization/spelling — both forms are in current use and not unambiguously wrong. Per rubric §3, debated spellings are skipped.

## Notes (non-issues confirmed)

- knm-002 — Dutch question has `meestal` (usually) which the English question omits. Acceptable softening of the English; pedagogical meaning preserved.
- knm-026 — Vakantiegeld answer says `8% van het jaarloon`. Industry shorthand for bruto jaarloon; understood in context. No fix.
- knm-032 — Ketenregeling (max 3 fixed-term contracts over 3 years) is correctly summarised.
- knm-068 — "5 werkdagen + 5 weken aanvullend geboorteverlof" matches the WIEG-act regime (since July 2020).
- knm-074 — `TWV` (Tewerkstellingsvergunning) and the GVVA reference in the explanation are both current.
- knm-080 — 104 weeks of `loondoorbetaling bij ziekte` at ≥70% is correct.
- knm-098 — Long compound question reads cleanly; College voor de Rechten van de Mens is the current name (replaced Commissie Gelijke Behandeling in 2012).
