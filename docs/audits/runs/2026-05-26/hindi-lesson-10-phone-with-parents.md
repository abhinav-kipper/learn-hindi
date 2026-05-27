# Audit: hindi-lesson-10-phone-with-parents

**File:** content/lessons/10-phone-with-parents.json
**Audit date:** 2026-05-27
**Total fixes applied:** 3 (1 new + 2 carried from prior 2026-05-27 pass)
**Items not applied:** 5

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `practice_prompt` (parental warm-tum sample line)
   **Was:** `'zyada kaam nahin karte na?'`
   **Now:** `'zyada kaam nahin karti na?'`
   **Why:** With `tum` addressing the user (the daughter, established as feminine throughout the lesson via `aaungi`, `karungi`, `rakhti hoon`, etc.), the verb participle must agree feminine — `karti`, not `karte`. The neighbouring lines in the same prompt (`kab aa rahi ho?`, `Diwali pe aa rahi ho?`, `acchi`) already use feminine agreement; this one was a stray masculine. The prompt itself flags `'aaunga' → 'aaungi'` as a feminine-agreement watch-out — fixing this brings the prompt's own example into compliance.

2. **Where:** field `skill_breakdown[0].more_examples[0].hindi` *(applied in the prior 2026-05-27 pass; preserved here for record)*
   **Was:** `aap khaana khaaye?` (gloss: "did you eat?")
   **Now:** `aap ne khaana khaaya?`
   **Why:** `khaana` is transitive and the verb is in the past, so the `ne` rule applies — subject takes `ne`, verb agrees with the object (`khaana` masc → `khaaya`). The original form `aap khaaye` is not standard past tense; at best it could be misread as a polite imperative ("please eat"). The lesson's own `practice_prompt` already uses the correct `khaana khaaya` opener, so this matches house style and `09-doctor-visit` usage.

### Style (0 items)

### Structural (0 items)

### Other (1 item, prior pass)

1. **Where:** field `grammar_notes[1]` *(applied in the prior 2026-05-27 pass; preserved here for record)*
   **Was:** `"Feminine future tense for first person: '-ungi/-ungi' (main aaungi = I will come). Masculine is '-unga'. ..."`
   **Now:** `"Feminine future tense for first person: '-ungi' (main aaungi = I will come). Masculine is '-unga'. ..."`
   **Why:** Typo — the slash-separated pair `-ungi/-ungi` repeated the same form. Single suffix is what the next sentence's `'-unga'` comparison implies.

## Items not applied (5)

1. **Where:** field `phrases[4].pronunciation` — `sam-BHAAL LOON-gi` (hindi: `sambhal lungi`)
   **Issue:** Hindi text uses single-vowel romanization (`sambhal`, `lungi`) but pronunciation stretches to `BHAAL`/`LOON`.
   **Suggested fix:** Could normalize to `sam-BHAL LUN-gi`.
   **Why not applied:** Per CONTENT.md Audit Notes (2026-05-26), the Hindi pronunciation field is intentionally prosodic — it captures sentence-level stretched vowels, not the lexical romanization. The double-AA spread is the convention used consistently across all 19 Hindi files (compare `LOON-gi` in `08-shopping-clothes`, `AAUN-gi` in `09-doctor-visit`). Author's deliberate style; rubric §2.4 lists case-sensitive prosodic stress as a skip item.

2. **Where:** fields `phrases[5].pronunciation` (`AAUN-gi`), `phrases[7].pronunciation` (`ba-TAA-ni`, `ka-ROON-gi`)
   **Issue:** Same pattern — pronunciation stretches vowels that the hindi text writes as single.
   **Suggested fix:** Could trim to `AA-un-gi`, `ba-TA-ni`, `ka-RUN-gi`.
   **Why not applied:** Same intentional-prosody convention. Consistent across the file and across the corpus.

3. **Where:** field `phrases[6].context` — `"'banaai thi' (had made, feminine perfect — agrees with sabzi)"`
   **Issue:** Grammatically `banaai thi` is pluperfect ("had made") rather than perfect; the English gloss "I made sabzi yesterday" is simple past. The context calls it both "had made" and "feminine perfect", and the subject-`ne` is omitted (`main ne sabzi banaai thi`).
   **Suggested fix:** Either retitle the form ("pluperfect" or "remote past"), update the English gloss to "I had made sabzi yesterday", or note that the `ne` is dropped colloquially.
   **Why not applied:** Pedagogical-meaning change at <80% confidence. Colloquial Hindi routinely uses `X kiya tha` for simple past actions where English would use simple past, and first-person `ne` is commonly dropped in speech. Acceptable usage even if the grammar label is loose. Flag for author review.

4. **Where:** field `grammar_notes[4]` — `"'ki recipe se' / 'ke saath' / 'ke baare mein' — postpositions follow nouns and agree with gender: 'ki' for feminine, 'ka' for masculine, 'ke' for masculine plural"`
   **Issue:** `ke` is not only "masculine plural" — it is also the oblique form used before compound postpositions (`ke saath`, `ke baare mein`, `ke liye`), which is why the two examples cited use `ke`. The current explanation under-explains why `saath`/`baare mein` take `ke`. Reader could conclude `saath` is masculine plural, which it isn't.
   **Suggested fix:** Reframe as "`ka/ki/ke` is the genitive marker (X's). It agrees with the *following* noun: `ki` (feminine), `ka` (masculine singular), `ke` (masculine plural OR before compound postpositions like `saath`, `baare mein`, `liye`)".
   **Why not applied:** Pedagogical-meaning change; rewriting a foundation explanation. Flag for author review — better handled in the dedicated `05-postpositions` foundation than buried here.

5. **Where:** fields `phrases[9].hindi` (`khayaal`), `practice_prompt` (`khayal` x2)
   **Issue:** Same word romanized two ways within one file — `khayaal` in the phrase, `khayal` in the practice prompt.
   **Suggested fix:** Pick one form and align both occurrences (style guide §1.3 favours single-vowel `khayal`; pronunciation field already shows `kha-YAAL` to convey the long vowel).
   **Why not applied:** Debated romanization (analogous to the `chahiye`/`chaahiye` example called out in rubric §2.4 skip list); both forms are seen across the corpus. Author may have made a deliberate choice — flag for review rather than auto-normalize.
