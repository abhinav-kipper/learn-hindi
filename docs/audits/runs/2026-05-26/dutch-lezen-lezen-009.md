# Audit: dutch-lezen-lezen-009

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-26
**Total fixes applied:** 3
**Items not applied:** 0

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `texts[lezen-009].questions[2]` (woordbetekenis "verlengen") — `options_nl[2]`, `options_en[2]`, and `explanation_en`
   **Was:**
   - nl: `"De uitleentermijn met extra tijd verlengen"`
   - en: `"To extend the loan period with extra time"`
   - explanation: `"'Verlengen' means to extend — the text says you can extend the loan period (uitleentermijn verlengen) if you need more time."`
   **Now:**
   - nl: `"De uitleenperiode officieel langer maken"`
   - en: `"To officially make the loan period longer"`
   - explanation: `"'Verlengen' means to make longer — the text says you can extend the loan period (uitleentermijn verlengen) if you need more time."`
   **Why:** The correct answer for a `woordbetekenis` (word-meaning) question was tautological — it defined `verlengen` using `verlengen` itself ("To extend... with extra time"). Replaced with a real paraphrastic definition ("to make longer") so the option tests comprehension instead of word-recognition.

2. **Where:** field `texts[lezen-009].questions[3]` (woordbetekenis "boete") — `options_nl[3]` and `options_en[3]`
   **Was:**
   - nl: `"Een herinnering dat je boek bijna op tijd moet zijn"`
   - en: `"A reminder that your book is almost due"`
   **Now:**
   - nl: `"Een herinnering dat je boek bijna ingeleverd moet worden"`
   - en: `"A reminder that your book is almost due to be returned"`
   **Why:** Dutch phrasing `bijna op tijd moet zijn` is awkward / unidiomatic ("must almost be on time"). Replaced with grammatical `bijna ingeleverd moet worden` ("must almost be returned"), keeping the distractor function intact. English distractor expanded to match.

### Style (1 item)

1. **Where:** field `texts[lezen-009].body_en`
   **Was:** `"You do this at the balie with a valid identity document."`
   **Now:** `"You do this at the service desk with a valid identity document."`
   **Why:** `balie` was left untranslated in the English body. Per rubric 1.5, official Dutch terms reserved for un-translation are gemeente / BSN / DigiD / OV-chipkaart / huisarts / basisschool / kofschip — `balie` is not on that list, just a common noun. The Dutch `body_nl` keeps `balie` for in-target exposure; the English gloss now uses "service desk".

## Items not applied (0)

None — Dutch grammar (V2, separable `aanbieden`, modal+infinitive at clause end, de/het, adjective endings, subclause word order with `als`/`om...te`/`dat`) all check out. Hoofdgedachte and detail questions are correct. References intact.
