# Audit: hindi-lesson-10-phone-with-parents

**File:** content/lessons/10-phone-with-parents.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 4

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `skill_breakdown[0].more_examples[0].hindi`
   **Was:** `aap khaana khaaye?` (gloss: "did you eat?")
   **Now:** `aap ne khaana khaaya?`
   **Why:** `khaana` is transitive and the verb is in the past, so the `ne` rule applies — subject takes `ne`, verb agrees with the object (`khaana` masc → `khaaya`). The original form `aap khaaye` is not standard past tense; at best it could be misread as a polite imperative ("please eat"). The lesson's own `practice_prompt` already uses the correct `khaana khaaya` opener, so this matches house style and `09-doctor-visit` usage.

### Style (0 items)

### Structural (0 items)

### Other (1 item)

1. **Where:** field `grammar_notes[1]`
   **Was:** `"Feminine future tense for first person: '-ungi/-ungi' (main aaungi = I will come). Masculine is '-unga'. ..."`
   **Now:** `"Feminine future tense for first person: '-ungi' (main aaungi = I will come). Masculine is '-unga'. ..."`
   **Why:** Typo — the slash-separated pair `-ungi/-ungi` repeated the same form. Single suffix is what the next sentence's `'-unga'` comparison implies.

## Items not applied (4)

1. **Where:** field `phrases[4].pronunciation` — `sam-BHAAL LOON-gi` (hindi: `sambhal lungi`)
   **Issue:** Hindi text uses single-vowel romanization (`sambhal`, `lungi`) but pronunciation stretches to `BHAAL`/`LOON`.
   **Suggested fix:** Could normalize to `sam-BHAL LUN-gi`.
   **Why not applied:** Per CONTENT.md Audit Notes (2026-05-26), the Hindi pronunciation field is intentionally prosodic — it captures sentence-level stretched vowels, not the lexical romanization. The double-AA spread is the convention used consistently across all 19 Hindi files (compare `LOON-gi` in `08-shopping-clothes`, `AAUN-gi` in `09-doctor-visit`). Author's deliberate style.

2. **Where:** fields `phrases[5].pronunciation` (`AAUN-gi`), `phrases[7].pronunciation` (`ba-TAA-ni`, `ka-ROON-gi`)
   **Issue:** Same pattern — pronunciation stretches vowels that the hindi text writes as single.
   **Suggested fix:** Could trim to `AA-un-gi`, `ba-TA-ni`, `ka-RUN-gi`.
   **Why not applied:** Same intentional-prosody convention. Consistent across the file and across the corpus.

3. **Where:** field `phrases[6].context` — `"'banaai thi' (had made, feminine perfect — agrees with sabzi)"`
   **Issue:** Grammatically `banaai thi` is pluperfect ("had made") rather than perfect; the English gloss "I made sabzi yesterday" is simple past. The context calls it both "had made" and "feminine perfect".
   **Suggested fix:** Either retitle the form ("pluperfect" or "remote past") or update the English gloss to "I had made sabzi yesterday — using papa's recipe".
   **Why not applied:** Pedagogical-meaning change at <80% confidence. Colloquial Hindi routinely uses `X kiya tha` for simple past actions where English would use simple past, so the existing pairing is acceptable usage even if the grammar label is loose. Flag for author review.

4. **Where:** field `grammar_notes[4]` — `"'ki recipe se' / 'ke saath' / 'ke baare mein' — postpositions follow nouns and agree with gender: 'ki' for feminine, 'ka' for masculine, 'ke' for masculine plural"`
   **Issue:** `ke` is not only "masculine plural" — it is also the oblique form used before compound postpositions (`ke saath`, `ke baare mein`, `ke liye`), which is why the two examples cited use `ke`. The current explanation under-explains why `saath`/`baare mein` take `ke`.
   **Suggested fix:** Reframe as "`ka/ki/ke` is the genitive marker (X's). It agrees with the *following* noun: `ki` (feminine), `ka` (masculine singular), `ke` (masculine plural OR before compound postpositions like `saath`, `baare mein`, `liye`)".
   **Why not applied:** Pedagogical-meaning change; rewriting a foundation explanation. Flag for author review — better handled in the dedicated `05-postpositions` foundation than buried here.
