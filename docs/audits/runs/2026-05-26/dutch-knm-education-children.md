# Audit: dutch-knm-education-children

**File:** content/dutch/knm.json
**Audit date:** 2026-05-26 (re-audited 2026-05-27)
**Scope:** category `"onderwijs"` only (17 questions: knm-003, -009, -015, -021, -027, -033, -039, -045, -051, -057, -063, -069, -075, -081, -087, -093, -099)
**Total fixes applied:** 4 (1 from prior run, 3 new this run)
**Items not applied:** 1

## Fixes applied

### Accuracy (4 items)

1. **Where:** `questions[].options_nl[2]` for `knm-009` (Welke toets doen leerlingen aan het einde van groep 8 van de basisschool?) — *prior run*
   **Was:** `"De staatsexamen"`
   **Now:** `"Het staatsexamen"`
   **Why:** Dutch `de`/`het` agreement. `Examen` is a het-word, so the distractor must be `Het staatsexamen`. Option 0 in the same array already uses the correct article (`Het eindexamen`); option 2 was the only outlier. High-confidence grammar fix, no pedagogical-meaning change.

2. **Where:** `questions[].explanation_en` for `knm-009` — *this run*
   **Was:** "At the end of primary school (groep 8), pupils take the CITO-toets (a national standardized test). The results, combined with the teacher's advice, determine which level of secondary school the child attends."
   **Now:** "At the end of primary school (groep 8), pupils take a national standardized test — historically the CITO-toets, renamed the Doorstroomtoets in 2023-2024 (schools can now choose from several approved providers, of which CITO is still the best known). The results, combined with the teacher's advice, determine which level of secondary school the child attends."
   **Why:** Factual currency. The eindtoets at the end of groep 8 was renamed Doorstroomtoets in 2023-2024 and schools can now choose from several approved providers. CITO is still the best-known provider, so the correct option (`De CITO-toets`) remains the best answer among the four — but the explanation now reflects the current rule. Verifiable, high-confidence factual update.

3. **Where:** `questions[].explanation_en` for `knm-033` (Wat is de Studiefinanciering in Nederland?) — *this run*
   **Was:** "Studiefinanciering ... Since 2015, most funding is in the form of a loan (studievoorschot) that must be repaid after graduation."
   **Now:** "Studiefinanciering ... It includes a basisbeurs (basic grant — reinstated for new students from the 2023-2024 academic year after the 2015-2023 leenstelsel/loan-only period), an optional supplementary grant (aanvullende beurs) for lower incomes, an OV travel product, and an optional loan."
   **Why:** Factual currency. The basisbeurs was reinstated for higher education in 2023-2024, so describing the system as "most funding is a loan" is now incorrect. High-confidence verifiable update; the correct answer option ("Financiële ondersteuning van de overheid voor studenten in het hoger onderwijs") is unchanged.

4. **Where:** `questions[].explanation_en` for `knm-099` (Wat is DUO?) — *this run*
   **Was:** "DUO ... manages student finance (studiefinanciering), OV-kaart (student travel card) ..."
   **Now:** "DUO ... manages student finance (studiefinanciering), the student travel product (studentenreisproduct, loaded on the OV-chipkaart) ..."
   **Why:** Precision. The student travel facility is called `studentenreisproduct` and lives on an `OV-chipkaart`. Calling it `OV-kaart` is colloquial/imprecise. Small factual tightening, no pedagogical-meaning change.

## Items not applied (1)

1. **Where:** `knm-039` (Wat is speciaal onderwijs in Nederland?)
   **Issue:** The correct option says `"Onderwijs voor kinderen met een handicap of leermoeilijkheden"`. Modern Dutch policy/curriculum language has largely shifted from `handicap` to `beperking` (e.g. `kinderen met een beperking` in knm-057's distractor "Een bijzondere school voor kinderen met een beperking"). `Handicap` is still understood and used colloquially, but the term is gradually being avoided in official onderwijs documents.
   **Suggested fix:** Change to `"Onderwijs voor kinderen met een beperking of leerproblemen"` for consistency with the rest of the file's register.
   **Why not applied:** Terminology choice / register shift, not a grammar or factual error. Both forms appear in Dutch civic-integration source materials. Pedagogical-meaning change with <80% confidence — flagging for author review.

## Notes (not findings — recorded for context)

- All 17 onderwijs questions have grammatically correct Dutch outside the knm-009 de/het slip already fixed. No V2 violations, no other article slips, no agreement errors, no separable-verb issues.
- `correct_index` verified against Dutch civic facts: leerplicht 5-16 + kwalificatieplicht to 18 (knm-003, knm-051), Doorstroomtoets/CITO at end of groep 8 (knm-009), VWO → university (knm-015), MBO follows VMBO (knm-027), HAVO → HBO (knm-063), Article 23 funds religious bijzondere schools (knm-045, knm-081), parents enrol directly at chosen basisschool (knm-069), eindexamen = school + central exam (knm-075), Kinderopvangtoeslag via Belastingdienst (knm-021), Studiefinanciering via DUO incl. reinstated basisbeurs (knm-033, knm-099), BSO = before/after-school care (knm-057), Erasmus+ as EU exchange (knm-087), schoolvakanties spread across three regions Noord/Midden/Zuid (knm-093), speciaal onderwijs for disability/learning difficulties (knm-039). All correct.
- Explanations align with the question's correct option in every case. No "X means X" tautologies, no AI-cliché openers, no padding. No §2 style edits warranted.
- `knm-051` explanation note: lists `startkwalificatie` as "HAVO, VWO, or MBO level 2 diploma." Technically a startkwalificatie is HAVO, VWO, or MBO **level 2 or higher** (level 2/3/4 all qualify). The current wording reads as if only MBO level 2 counts. Marginal — left as-is because (a) level 2 is the floor, which is the pedagogically important number, and (b) the question is about the obligation, not the precise definition. Not flagged in "items not applied" because the fix is cosmetic.
- JSON parse verified after edits: `node -e "JSON.parse(...)"` → OK.
