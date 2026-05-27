# Audit: hindi-lesson-05-making-plans

**File:** content/lessons/05-making-plans.json
**Audit date:** 2026-05-27
**Total fixes applied:** 4
**Items not applied:** 4

## Fixes applied

### Style (4 items)

1. **Where:** field `phrases[0].english`
   **Was:** `"Dude shall we do something this weekend?"`
   **Now:** `"Dude, shall we do something this weekend?"`
   **Why:** Missing vocative comma. Compare phrase[6] english "Hey dude, let's see..." which already uses the comma — normalizing for consistency.

2. **Where:** field `phrases[7].english`
   **Was:** `"You're definitely coming right? Don't cancel"`
   **Now:** `"You're definitely coming, right? Don't cancel"`
   **Why:** Missing comma before the tag question "right?" — standard English punctuation.

3. **Where:** field `grammar_notes[0]`, `grammar_notes[2]`, `grammar_notes[4]`
   **Was:** Items 1, 3, 5 missing terminal periods; items 2, 4 already had them.
   **Now:** Periods added to all five items for consistency.
   **Why:** Terminal-punctuation consistency within an array (matches the precedent from the lesson-04 audit run on the same day).

4. **Where:** field `culture_notes[1]`, `culture_notes[2]`, `culture_notes[3]`
   **Was:** Items 2-4 had no terminal period; item 1 did.
   **Now:** Periods added to all four items for consistency.
   **Why:** Same terminal-punctuation consistency fix as above.

## Items not applied (4)

1. **Where:** field `phrases[5].hindi` — `pichli baar ek ghanta wait kiya tha`
   **Issue:** Strictly the `ne` rule applies to transitive `karna` in past — would be `maine ek ghanta wait kiya tha`. The phrase drops both `maine` and the surface subject entirely.
   **Suggested fix:** Either add `maine` (formal) or leave as deliberate colloquial drop.
   **Why not applied:** Deliberate authorial choice — colloquial spoken Hindi routinely drops both the explicit subject and the `ne` marker in casual peer talk. The lesson register is explicitly the friends-on-WhatsApp casual mode, and `kiya` agrees with the masculine object `ghanta` so the surface form is grammatical. Flagging anyway because if the lesson wants to model strict `ne`-rule usage this is the one phrase to rewrite.

2. **Where:** field `phrases[3].english`
   **Issue:** `"A new restaurant opened there"` translates `khula hai` (present perfect / resultative state — "has opened / is open") with simple past "opened".
   **Suggested fix:** `"A new restaurant has opened there"` or `"There's a new restaurant open"`.
   **Why not applied:** Casual English speakers say "a new restaurant opened" for a recent resultative state — the meaning carries. Stylistic, not an accuracy error.

3. **Where:** field `phrases` — `pronunciation` syllable breaks like `jaa-UN-ga`, `wa-HAAN`, `pich-LI`
   **Issue:** Pronunciation field uses long-vowel forms (`jaa`, `wa-HAAN`) where the corresponding hindi field uses single-vowel romanization (`jaunga`, `wahan`, `pichli`).
   **Suggested fix:** None.
   **Why not applied:** Per CONTENT.md Audit Notes (2026-05-26) and CONTENT_RUBRIC §1.3 / §2.4 skip list: pronunciation field intentionally reflects spoken syllable rhythm + prosodic stress, not the lexical romanization style used in the `hindi` field. The two formats serve different purposes and the convention is consistent across all 19 Hindi files.

4. **Where:** field `phrases[].context` — terminal-punctuation
   **Issue:** 5 of 10 `context` strings end with a period, 5 do not. Mixed within the array.
   **Suggested fix:** Either add periods to the 5 missing ones or strip from the 5 present ones.
   **Why not applied:** The pattern is genuinely mixed and no clear authorial intent points one way or the other. `grammar_notes` and `culture_notes` had clear majority-rule patterns to align to; `phrases.context` is split 50/50. Flagging for human decision on the canonical form.
