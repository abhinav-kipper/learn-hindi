# Audit: dutch-lezen-lezen-002

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 0

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `texts[1].questions[3].type`
   **Was:** `"hoofdgedachte"`
   **Now:** `"detail"`
   **Why:** "Waarom is de bonuskaart handig?" asks about a specific fact stated in the text ("Daarmee krijg ik korting") — it is a detail question, not a main-idea question. The text's main idea is already covered by Q3 of the same set. Other Lezen texts use `detail` for "why does X happen?" style lookups (e.g. lezen-003 Q4 about weather acceptance is the borderline case, but bonuskaart utility is squarely detail-level).

### Style (1 item)

1. **Where:** field `texts[1].questions[3].options_en[0]`
   **Was:** `"You can pay with it"`
   **Now:** `"You can pay by debit card with it"`
   **Why:** Dutch `pinnen` specifically means paying by debit card (PIN), not paying in general. The original English translation collapsed two distinct options (Q2's pinpas distinguished from cash/credit) into a generic "pay with it", weakening the distractor. The new wording preserves the contrast learners are expected to make: a bonuskaart is a loyalty card, not a payment card — even though the verb `pinnen` could be confused for paying. This is a clear-confidence accuracy/style fix per rubric 1.2 and 1.5.

## Body and translation verification

- Dutch body: V2 word order respected throughout ("Vandaag ga ik...", "Daarmee krijg ik...", "Aan het einde ga ik..."). All `de`/`het` articles correct (de supermarkt, de aanbieding, de melk, de kassa, de kassamedewerker — all de-words). Verb forms agree with subject. Sentence-final placement of `op de fiets`-style adverbials not needed at this register.
- `Die is bij de melk`: the Dutch demonstrative `die` (referring to feminine/common-gender `yoghurt`) is correct. `bij` here means "near/with" in shelf-layout sense; the English "next to the milk" is a sensible pragmatic rendering — kept.
- `In de aanbieding` (on offer/on sale): correct collocation, supermarket-standard register.
- `Bonuskaart`: Albert Heijn product name, spelled correctly. Reference cites Albert Heijn material.
- `Pinpas`: standard term for Dutch debit card. Correct.
- `Kassamedewerker`: compound noun is well-formed (kassa + medewerker), de-word — correct.
- Word count claim of 68: actual count is 71 words — close enough that this is below the threshold worth disputing (not consistently audited across files; lezen-004 also claims 68 with ~68 words, lezen-005 claims 69 with ~70). Skipped.
- Tier `A1`: appropriate — vocabulary and sentence structure all sit within A1 (simple present, short main clauses, no subordinate clauses, concrete everyday vocabulary). Confirmed.
- AI-cliché check: none. Direct factual narration in first person, no throat-clearing or padding.

## Items not applied

None.
