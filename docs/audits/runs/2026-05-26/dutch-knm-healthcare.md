# Audit: dutch-knm-healthcare

**File:** content/dutch/knm.json
**Audit date:** 2026-05-27
**Scope:** Category `gezondheid` (Healthcare) — 16 questions
**Question IDs audited:** knm-005, knm-011, knm-017, knm-023, knm-029, knm-035, knm-041, knm-047, knm-053, knm-059, knm-065, knm-071, knm-077, knm-083, knm-089, knm-095
**Total fixes applied:** 3
**Items not applied:** 1

## Fixes applied

### Accuracy (3 items)

1. **Where:** `knm-095.options_nl[2]`
   **Was:** `"Een korting op de eigen risico voor chronisch zieken"`
   **Now:** `"Een korting op het eigen risico voor chronisch zieken"`
   **Why:** `risico` is a het-word, so the fixed expression "het eigen risico" is required. `de eigen risico` is ungrammatical Dutch and the same het-word form appears correctly elsewhere in the file (e.g. knm-023).

2. **Where:** `knm-077.explanation_en`
   **Was:** "...A mandatory 5-day waiting period exists after the initial consultation. The procedure must be performed in a licensed clinic or hospital."
   **Now:** "...The previously mandatory 5-day waiting period (beraadtermijn) was abolished on 1 January 2023; the reflection period is now determined together with the doctor based on the patient's situation. The procedure must be performed in a licensed clinic or hospital."
   **Why:** Factual update. The verplichte beraadtermijn van 5 dagen was abolished by the Wet afschaffing verplichte minimum-beraadtermijn voor afbreking zwangerschap, in force 1 January 2023. The explanation as written is outdated and conflicts with current Dutch law that learners will encounter.

3. **Where:** `knm-023.explanation_en`
   **Was:** "...In 2024, the mandatory eigen risico is approximately €385. After reaching this amount, your insurer covers eligible costs."
   **Now:** "...The mandatory eigen risico is €385 per year. After reaching this amount, your insurer covers eligible costs."
   **Why:** Two small fixes in one. (a) The eigen risico has been exactly €385 (not "approximately") since 2016 and remains €385 for 2024 and 2025. (b) Pinning the figure to "2024" already reads as stale in the current calendar year; dropping the year reference avoids creating a recurring maintenance burden each January while remaining factually accurate at the time of writing.

## Items not applied (1)

1. **Where:** `knm-053.question_nl`
   **Issue:** The Dutch question reads `"Wat is euthanasie in Nederland?"` which literally asks for a definition, but the answer options describe legal status (verboden / toegestaan onder voorwaarden / etc.). The English mirror correctly reads "What is the status of euthanasia in the Netherlands?". A tighter Dutch phrasing would be `"Hoe is euthanasie geregeld in Nederland?"` or `"Wat is de status van euthanasie in Nederland?"`.
   **Suggested fix:** Replace `question_nl` with `"Hoe is euthanasie geregeld in Nederland?"` to match the options and the English version.
   **Why not applied:** Native-Dutch speakers do read `"Wat is X in Nederland?"` colloquially as covering definition + status, and the current phrasing is intelligible. Pedagogical-meaning change at <80% confidence — flagging for user review.

## Clean (notes)

All other Healthcare questions passed accuracy review:

- Dutch grammar (V2 verb position, article gender, adjective agreement, modal + infinitive at clause end) checked across each `question_nl` and `options_nl` block — no errors beyond the one in knm-095 above.
- `correct_index` verified against the four `options_nl` strings for every question — every index points at the correct option (including the unusual `0` index on knm-059 opt-out organ donation and knm-083 apotheek).
- Specialist Dutch terms spelled correctly (zorgverzekering, basisverzekering, aanvullende verzekering, eigen risico, zorgtoeslag, huisarts, huisartsenpost, verloskundige, kraamzorg, kraamverzorgende, GGD, GGZ, apotheek, beraadtermijn, ADR, Actief DonorRegistratiesysteem).
- Factual claims (112 emergency number, dental care excluded from basisverzekering for adults but covered to age 18, opt-out organ donation since 2020, abortion legal to 24 weeks, midwives can attend home births, GGZ requires huisarts referral) — all consistent with current Dutch civic-integration source material after the three fixes above.

## Parse verification

`node -e "JSON.parse(require('fs').readFileSync('content/dutch/knm.json','utf8')); console.log('OK')"` → `OK`
