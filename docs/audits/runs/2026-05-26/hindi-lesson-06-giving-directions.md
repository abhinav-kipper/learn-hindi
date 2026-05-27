# Audit: hindi-lesson-06-giving-directions

**File:** content/lessons/06-giving-directions.json
**Audit date:** 2026-05-27
**Total fixes applied:** 4
**Items not applied:** 5

## Fixes applied

### Accuracy (4 items)

1. **Where:** field `phrases[7].hindi`
   **Was:** `arey, bahut dur hai yahan se — auto le lo`
   **Now:** `arey, bahut door hai yahan se — auto le lo`
   **Why:** Internal-consistency fix. The phrase's own `pronunciation` field already renders the word as `DOOR`, and the skill_breakdown "location vocabulary" entry lists `door (far)`. The Hindi line was the only place using the short-vowel variant `dur`. Single source-of-truth spelling within the file.

2. **Where:** field `practice_prompt` (opening line)
   **Was:** `'excuse me ji, aap mujhe bata sakte hain — Lajpat Nagar metro station kahaan hai?'`
   **Now:** `'excuse me ji, aap mujhe bata sakte hain — Lajpat Nagar metro station kahan hai?'`
   **Why:** Internal-consistency fix. Phrase 1 context references the form as `kahan` ("More casual and common than 'kahan' for asking directions"). Style guide §1.3 also prefers `aa` only when ambiguity matters — `kahan` has no ambiguity to flag.

3. **Where:** field `practice_prompt` (signal-weak line)
   **Was:** `'main mobile nahin chala raha abhi'`
   **Now:** `'main mobile nahi chala raha abhi'`
   **Why:** Internal-consistency fix. Every other occurrence of नहीं in this file romanizes as `nahi` (phrases 5, 6, and pronunciation fields). `nahin` was the only outlier.

4. **Where:** field `skill_breakdown[1].more_examples[0].hindi`
   **Was:** `thoda aage jaao`
   **Now:** `thoda aage jao`
   **Why:** Style-guide §1.3 single-vowel-ending rule (`karta` not `kartaa`). Same skill_breakdown's sequential-instructions section uses `jao` consistently (`pehle seedha jao`, `neeche aa jao`). The double-a form was an outlier.

## Items not applied (5)

1. **Where:** root level — missing `references` field
   **Issue:** Rubric §1.6 says `references[]` should be non-empty for lessons. This lesson has no `references` field at all.
   **Suggested fix:** Add `references: ["Snell & Weightman Ch. X", "Afroz Taj Lesson Y"]` matching the actual sources the author used (likely the postpositions / location chapters).
   **Why not applied:** Fabricating source citations is worse than missing them. Lesson predates the 2026-05-21 references-field convention. Flagging for author to backfill.

2. **Where:** field `grammar_notes[1]`
   **Issue:** Says "The noun before 'ke' changes form: 'ghar' stays same, but 'mera' becomes 'mere'." This mislabels `mera` as a noun — it's a possessive adjective. The oblique-case shift applies to both, but conflating them risks the learner mis-modeling the rule (e.g. thinking `ghar` should also shift even though it's not an `-aa` noun).
   **Suggested fix:** Reword as `"The word before 'ke' may change form: 'ghar' stays the same (consonant-ending noun), but the possessive 'mera' becomes 'mere' (oblique form). '-aa' nouns also shift: 'ladka' → 'ladke'."`
   **Why not applied:** Pedagogical-meaning change beyond 80% confidence — author may have collapsed terminology deliberately for an A2-level audience. Flagging for review.

3. **Where:** field `grammar_notes[3]`
   **Issue:** Note lists three registers — `jaiye` (polite), `jao` (friendly), `ja` (very casual) — but in fact only TWO of these are reflected in this lesson's phrases. `jaiye` (aap polite) appears in phrase 2 while the rest of the imperatives use `tum` forms (`le lo`, `pooch lena`, `lagao na`). The opening "polite stranger asking" framing in the situation contrasts with the casual `tum` imperatives the local then gives back.
   **Suggested fix:** Either align the phrases to use a single register, OR add a sentence to grammar_notes explaining that locals will often shift to `tum` when giving directions to a perceived peer, while keeping `jaiye` for the first response.
   **Why not applied:** Pedagogical-meaning change — author may intentionally be showing the realistic register-mixing that happens in Indian direction-giving. Flagging.

4. **Where:** field `phrases[4].hindi` — `uss building`
   **Issue:** Standard romanization of उस is `us` (single s). `uss` is also seen colloquially but is less common in pedagogical material.
   **Suggested fix:** Consider `us building ke saamne hai, miss nahi hoga`.
   **Why not applied:** Debated romanization (rubric §2.4 skip — both forms appear across the codebase). The author may be using `uss` to flag emphasis ("THAT building"), which the English gloss supports.

5. **Where:** field `phrases[1].pronunciation` — `jaa-I-ye`
   **Issue:** The middle-syllable capital `I` is unusual versus the file's other unstressed `i`/`u`/`a` vowels (`ki-DHAR`, `mi-NUTE`, `bil-KUL`). Could be a typo where uppercase letter was used as the literal English letter "I".
   **Suggested fix:** None — possibly `jaa-i-ye` if unstressed, or `JAA-i-ye` if the stress is on the first syllable.
   **Why not applied:** Rubric explicitly marks prosodic-stress CAPS as INTENTIONAL (sentence-level beat). Cannot verify without hearing the author's intended prosody; defaulting to "do not touch."
