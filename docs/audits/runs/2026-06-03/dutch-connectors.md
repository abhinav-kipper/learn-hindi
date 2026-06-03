# Audit: dutch-connectors

**File:** content/dutch/foundations/12-connectors.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

Verified every Dutch example's word order against the want-vs-omdat contrast and the coordinating joiners. All correct.

### Word-order verification (the focus axis)

**Phrases (8):**
1. `Ik drink koffie en ik lees de krant.` — `en`, V2 in both halves. ✓
2. `Ik wil komen, maar ik heb geen tijd.` — `maar`, V2, comma. ✓
3. `Wil je thee of wil je koffie?` — `of`, question (V1) in both halves, unchanged. ✓
4. `Ik blijf thuis, want ik ben ziek.` — `want` coordinating, verb `ben` second. ✓
5. `Ik blijf thuis omdat ik ziek ben.` — `omdat` subordinating, verb `ben` at the end. ✓
6. `Hij eet niet, omdat hij geen honger heeft.` — `omdat`, verb `heeft` at the end. ✓ (comma before `omdat` is optional/permitted)
7. `Het regent, dus ik neem de paraplu mee.` — `dus`, V2, separable `neem...mee` split correctly. ✓
8. `Ik leer Nederlands, want ik woon hier en ik wil het examen halen.` — `want` V2, `en` V2, stacked correctly. ✓

**skill_breakdown more_examples:**
- Coordinating set: `Ik kook en jij doet de afwas.` ✓ / `Het is duur, maar het is mooi.` ✓ / `We gaan met de trein of we nemen de auto.` ✓ / `Ik ben blij, want morgen is het weekend.` (want keeps the clause's own V2 — fronted `morgen` triggers inversion `morgen is het`, finite verb still second) ✓
- omdat set: `Ik bel je omdat ik een vraag heb.` ✓ / `Zij komt niet omdat ze ziek is.` ✓ / `We blijven binnen omdat het hard regent.` ✓ / `Ik leer Nederlands omdat ik hier wil blijven.` (both verbs `wil blijven` at the end) ✓

**Theory examples:**
- want section: `ik heb honger` / `ze wil iets vragen` / `het regent` — all V2. ✓
- omdat section: `ik een vraag heb` / `hij moe is` — verb last. ✓
- want-vs-omdat section: `het is dichtbij` (want) / `het dichtbij is` (omdat). ✓
- dus section: `ik blijf thuis` / `we gaan naar huis` — V2. ✓

### quick_check correct_index verification (5)

1. Contrast joiner → options [en, maar, of], `correct_index: 1` = `maar`. ✓
2. Correct want order → [`want ik ziek ben`, `want ik ben ziek`, `want ben ik ziek`], `correct_index: 1` = V2 form. ✓
3. Finish omdat clause → [`omdat ik ben ziek`, `omdat ik ziek ben`, `omdat ben ik ziek`], `correct_index: 1` = verb-final. ✓
4. Correct pair → [..., `want ik ben moe / omdat ik moe ben`, ...], `correct_index: 1`. ✓
5. Result joiner → [want, omdat, dus], `correct_index: 2` = `dus`. ✓

### Other checks
- grammar_notes, culture_notes, practice_prompt: all grammatically and factually accurate; want/omdat behaviour described correctly.
- References vetted (dutchgrammar.com / TaalCompleet A2 / Nederlands in gang — standard NT2 sources).
- Schema complete: all 5 theory sections have heading + body + cutting_intro + quick_check + at least one of (table | examples | callout).
- Jargon glossed ("subordinating word (it sends the verb to the end)"), no em-dashes/arrows.
- `node scripts/lint-content.mjs` and `node scripts/lint-quality.mjs` both pass with no violations.
