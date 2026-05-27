# Audit: lezen-006

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

No accuracy, style, or structural fixes needed for `lezen-006` ("Naar de huisarts") and its four questions.

Verification notes (not changes):

- **Dutch grammar (1.2).** V2 respected throughout (`Gisteren voelde ik...`, `Toen mocht ik...`, `Bij de apotheek kreeg ik...`, `Na twee dagen voelde ik me al beter`). Subordinate clauses verb-final after `dat`/`hoe`/`of`/`wanneer` (`...dat ik griep had`, `...hoe lang ik al ziek was`, `...of ik medicijnen gebruikte`, `...hoe ik de medicijnen moest gebruiken`, `...wanneer ik ze moest innemen`, `...dat ik snel een afspraak kon krijgen`). Separable verb `uitleggen` correctly detached in main clause (`De apotheker legde uit hoe...`). Modal + infinitive at clause end (`...te bellen`, `te rusten`, `te drinken`).
- **Cultural / factual (1.5).** `huisarts` and `apotheek` preserved as Dutch terms in `body_en` and options — matches the rubric's official-terms list. `recept` definition is accurate (a doctor's prescription redeemable at the apotheek).
- **Schema / structural (1.6).** JSON parses. All required fields present (`id`, `tier`, `topic`, `title_nl`, `title_en`, `body_nl`, `body_en`, `word_count`, `questions`, `references`). Each of the 4 questions has `type`, `question_nl`, `question_en`, 4-item `options_nl`/`options_en`, `correct_index`, `explanation_en`. `references[]` is non-empty.
- **Pedagogical accuracy (1.4).** Each `correct_index` matches the text:
  - Q1 (detail, klachten) → idx 1 "Hoofdpijn en koorts" — text says "Ik had hoofdpijn en koorts".
  - Q2 (hoofdgedachte) → idx 1 "Een bezoek aan de huisarts vanwege ziekte" — text arc is illness → call → visit → pharmacy → recovery, a complete GP visit.
  - Q3 (woordbetekenis, klachten) → idx 1 "Symptomen of gezondheidsklachten" — used in medical sense in the text.
  - Q4 (woordbetekenis, recept) → idx 2 "Een document van de dokter voor medicijnen" — matches "Hij schreef ook een recept voor de apotheek".
- **Word count.** Verified `body_nl` contains exactly 154 words; field is accurate.
- **Style (section 2).** Body is direct narrative voice, no AI-clichés, no throat-clearing. Explanations are tight and grounded in the text.
