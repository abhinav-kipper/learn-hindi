# Audit: hindi-lesson-04-expressing-opinions

**File:** content/lessons/04-expressing-opinions.json
**Audit date:** 2026-05-27
**Total fixes applied:** 5
**Items not applied:** 3

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `practice_prompt`
   **Was:** `gaane achhe the`
   **Now:** `gaane acche the`
   **Why:** The rest of the file consistently uses `accha`/`acchi` for अच्छा (double-c form). `achhe` (chh) was a one-off inconsistency. Normalized plural form to match the file's `accha`/`acchi` convention → `acche`.

2. **Where:** field `practice_prompt`
   **Was:** `'mujhe accha laga / nahin laga'` ... `'nahin yaar'`, `'bilkul nahin'`
   **Now:** `'mujhe accha laga / nahi laga'` ... `'nahi yaar'`, `'bilkul nahi'`
   **Why:** The rest of the lesson (phrase 4 `mujhe nahi lagta`, skill_breakdown[2] examples `nahi yaar`, `main agree nahi karta`, and explanatory text "Never say a flat 'nahi'") all use `nahi`. Three instances of `nahin` in practice_prompt were the only divergences; normalized to file convention.

### Style (2 items)

3. **Where:** field `culture_notes[1]`, `culture_notes[2]`, `culture_notes[3]`
   **Was:** Items 2-4 had no terminal period; item 1 did.
   **Now:** Periods added to all four items for consistency.
   **Why:** Terminal-punctuation consistency within an array.

4. **Where:** field `phrases[8].english`
   **Was:** `"Forget that, what happened after interval?"`
   **Now:** `"Forget that, what happened after the interval?"`
   **Why:** Missing definite article. Natural English requires "the interval" here.

### Accuracy / Pedagogical clarity (1 item)

5. **Where:** field `grammar_notes[1]`
   **Was:** `"'Mujhe lagi' = I felt (past, fem noun)."`
   **Now:** `"'Mujhe lagi' = I felt (past, fem subject)."` (also updated the masc parallel for symmetry)
   **Why:** "fem noun" was ambiguous — the noun in question is the grammatical subject (what is being liked/felt), not just any noun in the sentence. "Fem subject" is the correct grammatical term and parallels the lesson's standing description in `skill_breakdown[0].explanation` ("Matches the SUBJECT gender").

## Items not applied (3)

1. **Where:** field `phrases[5].english`
   **Issue:** `"You tell, how did you honestly find it?"` is a literal/Hinglish-flavored translation of `tum batao`. More idiomatic English would be `"Tell me, how did you honestly find it?"`.
   **Suggested fix:** Replace with "Tell me, how did you honestly find it?" or "What about you — how'd you find it honestly?".
   **Why not applied:** Likely a deliberate authorial choice to mirror the Hinglish/peer voice of the lesson (Indians do say "you tell" in English-mode conversation). Stylistic, not an error.

2. **Where:** field `grammar_notes[2]`
   **Issue:** `"It's not translatable, it's a vibe."` — borders on AI-cliché phrasing.
   **Suggested fix:** `"It's a tone marker rather than a literal word — flavor, not meaning."`
   **Why not applied:** Voice match — Cutting's voice is explicitly "friendly, conversational, never starchy, knowledgeable friend at a tea stall" per CONTENT_RUBRIC §2.3. "Vibe" is in-character; not the stiff AI throat-clearing the rubric targets.

3. **Where:** field `phrases` — `mujhe` syllable-stress pronunciation
   **Issue:** Several pronunciation fields render `mujhe` as `muj-HE` (stress on the second syllable) — non-standard lexical stress for the word.
   **Suggested fix:** Consider `MUJ-he` for lexically-stressed contexts.
   **Why not applied:** Per CONTENT.md Audit Notes (2026-05-26) and CONTENT_RUBRIC §1.3 / §2.4 skip list: pronunciation CAPS marks *prosodic* (sentence-beat) stress, not canonical lexical stress, and is intentional across all 19 Hindi files. No normalization pass needed.
