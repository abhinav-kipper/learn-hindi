# Audit: dutch-knm-housing

**File:** content/dutch/knm.json
**Audit date:** 2026-05-27
**Scope:** Category `wonen` (Housing) — 17 questions
**Question IDs audited:** knm-004, knm-010, knm-016, knm-022, knm-028, knm-034, knm-040, knm-046, knm-052, knm-058, knm-064, knm-070, knm-076, knm-082, knm-088, knm-094, knm-100
**Total fixes applied:** 0
**Items not applied:** 2

## Clean

All 17 Housing questions passed accuracy review:

- Dutch grammar (V2, articles, agreement) checked across `question_nl`, `options_nl`, and `explanation_en` — no errors.
- `correct_index` verified against the four `options_nl` strings for each question — every index points at the correct option.
- Factual claims (BRP 5-day registration, OZB scope, social-housing waiting lists, energy-label A=best, water-supplier regional monopoly, liberalized energy market, Huurcommissie role, waarborgsom cap, koopwoning vs huurwoning distinction, afvalstoffenheffing/rioolheffing, particuliere verhuurder, vrije sector huur) — all consistent with current Dutch civic-integration source material.
- Specialist Dutch terms spelled correctly (woningcorporatie, huurtoeslag, waarborgsom, afvalstoffenheffing, rioolheffing, Onroerendezaakbelasting, liberalisatiegrens, courtage, Huurcommissie, particuliere verhuurder).

## Items not applied (2)

1. **Where:** `knm-088.explanation_en`
   **Issue:** Explanation states the Huurcommissie operates "in the social rental sector". Since July 2024 (Wet betaalbare huur), the Huurcommissie's jurisdiction extends to the regulated middenhuur segment too.
   **Suggested fix:** "...in the social rental sector and, since 2024, the regulated middle segment (middenhuur)."
   **Why not applied:** Unverifiable-from-codebase factual update; pedagogical-meaning change at <80% confidence (statutory date / scope wording is a moving target the user may want to confirm against the latest Naar Nederland reference).

2. **Where:** `knm-100.explanation_en`
   **Issue:** Says "Since 2023, landlords may no longer charge tenants agency fees (courtage) in most situations". The prohibition on double-bemiddelingskosten for residential rentals was actually established by the Hoge Raad ruling of 16 October 2015 (HR ECLI:NL:HR:2015:3099) and codified further by the Wet goed verhuurderschap (1 July 2023). "Since 2023" understates the history.
   **Suggested fix:** "Tenants generally cannot be charged agency fees (courtage) when the landlord hires the agent — established by case law in 2015 and reinforced by the Wet goed verhuurderschap (2023)."
   **Why not applied:** Debated framing; the 2023 law is a substantive strengthening and the current copy is defensible. Pedagogical-meaning change at <80% confidence — flagging for user review.

## Parse verification

`node -e "JSON.parse(require('fs').readFileSync('content/dutch/knm.json','utf8')); console.log('OK')"` → `OK`
