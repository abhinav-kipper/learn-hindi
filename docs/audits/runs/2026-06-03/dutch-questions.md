# Audit: dutch-questions

**File:** content/dutch/foundations/09-questions.json
**Audit date:** 2026-06-03
**Total fixes applied:** 2
**Items not applied:** 0

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `phrases[1].pronunciation` ("Heb je een fiets?")
   **Was:** `HEP ye ayn FEETS?`
   **Now:** `HEP ye un FEETS?`
   **Why:** `een` here is the indefinite article, pronounced as an unstressed schwa /ən/ ("un"), not the stressed numeral `één` /eːn/ ("ayn"). The transcription `ayn` would cue the wrong (numeral) pronunciation. Schwa is correct for the article.

2. **Where:** field `skill_breakdown[2].more_examples[1].english` ("Wanneer kom je?")
   **Was:** `When are you coming? (je after the verb, so doe/kom loses the -t)`
   **Now:** `When are you coming? (je after the verb, so kom loses the -t)`
   **Why:** The example verb is `kom`; `doe` is unrelated to this sentence and was a stray reference (likely copied from a `doen` example). Removing it makes the gloss describe the actual verb shown.

## Verification notes (no change needed)

All unit-specific accuracy targets check out:

- **Inversion + dropped -t (je/jij):** Every inverted example obeys the rule. `Woon jij...?`, `Heb je...?`, `Hoe heet je?`, `Wat doe je?`, `Werk jij?`, `Spreek je...?` all correctly drop the -t. The statement-vs-question pairs in the body and table are accurate (`jij woont` → `woon jij`, `je heet` → `heet je`).
- **-t kept with u / hij / zij / het:** `Waar woont u?`, `Werkt u?`, `Komt hij vanavond?`, `Werkt hij?`, `Wanneer begint de les?` (subject = `de les`), `Wie helpt mij?` (wie is subject) all correctly retain the -t. The warning callout and the explicit `Werk jij?` vs `Werkt u?` contrast are correct.
- **Irregular verbs:** `Heb je...?` (hebben), `Is het ver?` / `Is hij ziek?` (zijn), `Bent u de dokter?` (u bent → bent u) all correct.
- **Question words:** wie/wat/waar/wanneer/waarom/hoe/welke/hoeveel — all correct meaning + spelling. Table examples accurate. The `welke` (de) vs `welk` (het) note and the `hoe` compounds (`hoeveel`, `hoe laat`, `hoe lang`) are correct.
- **Word order in wh-questions:** question word + finite verb + subject is stated and demonstrated consistently; V2 framing is correct.
- **ja / nee / jawel:** `jawel` correctly restricted to contradicting a negative; plain positive questions take `ja`. The "which yes-word" table (incl. `Nee, klopt` for confirming a negative) is accurate.
- **quick_check correct_index (all 5):** index 1 (`Kom jij vanavond?`), index 1 (`Woon jij in Den Haag?`), index 2 (`waarom`), index 0 (`Waar werk je?`), index 2 (`Jawel`) — all verified correct.
- **Pronunciation format:** syllable-stress CAPS format consistent; remaining transcriptions are accurate Dutch (`WAAR WOHNT oo`, `vaar-OM LAYR ye`, `hoo-VAYL KOST het`, etc.).
- **Prose/style:** Cutting intros and theory voice are clean; no AI clichés, em-dashes, or arrows. References are vetted (Shetter & Ham, TaalCompleet A1, Bart de Pau). Jargon glossed (inversion explained in plain terms).

## Items not applied (0)

None. No pedagogical-meaning items required flagging.
