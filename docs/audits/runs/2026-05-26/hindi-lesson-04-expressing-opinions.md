# Audit: hindi-lesson-04-expressing-opinions

**File:** content/lessons/04-expressing-opinions.json
**Audit date:** 2026-05-27
**Total fixes applied:** 1
**Items not applied:** 4

Note: This file was audited in a prior 2026-05-26 pass (5 fixes applied: `achhe` → `acche`, `nahin` → `nahi` x3, terminal periods on `culture_notes`, `interval` → `the interval`, `fem noun` → `fem subject`). All prior fixes verified still in place. This re-audit found one additional minor consistency fix.

## Fixes applied

### Style (1 item)

1. **Where:** field `grammar_notes[3]`
   **Was:** `"...I think THAT this is good"`
   **Now:** `"...I think THAT this is good."`
   **Why:** Terminal-period consistency within the `grammar_notes` array — items 0, 1, 2, 4 end with periods; item 3 was the only one missing one.

## Items not applied (4)

1. **Where:** top-level — `references[]` field missing
   **Issue:** Per rubric §1.6, `references[]` must be non-empty for lessons. This lesson predates the requirement (lessons 01-06 lack the field; only 07-10 carry it). The Zod schema enforced by `scripts/generate-lesson.mjs` now requires it for new lessons.
   **Suggested fix:** Cite the canonical sources — likely Snell & Weightman (Teach Yourself Hindi) chapter(s) on the past habitual / past tense and `lagna` constructions, and Afroz Taj sections on opinion-giving.
   **Why not applied:** Cannot fabricate references without verifying the actual source chapter/lesson numbers. Requires author input to cite accurately.

2. **Where:** field `phrases[5].english`
   **Issue:** `"You tell, how did you honestly find it?"` is Hinglish-flavored, not idiomatic English. More natural would be `"Tell me, how did you honestly find it?"` or `"What about you — how'd you find it honestly?"`.
   **Why not applied:** Likely a deliberate authorial choice mirroring how Indians render `tum batao` in English-mode speech ("you tell"). Stylistic, not an error. Flagged in prior audit; carrying forward.

3. **Where:** field `phrases[5].hindi` — gender agreement on `kaisa laga`
   **Issue:** Asking about a movie (`film` is feminine in Hindi), agreement would canonically be `tumhe kaisi lagi?`. The phrase uses masculine `kaisa laga`, which is grammatically the default for "how did it (the experience) feel" but mismatches the lesson's stated topic (the just-watched movie).
   **Suggested fix:** Either `tum batao, tumhi kaisi lagi honestly?` (matching film=fem) or add a context note explaining the masc-default for "how did it go"/experience-referent usage.
   **Why not applied:** Pedagogical-meaning change at <80% confidence — `kaisa laga` for asking about an experience-as-whole is extremely common in colloquial Hindi even when the topic is grammatically feminine. Authorial choice may be deliberate to model real speech.

4. **Where:** field `skill_breakdown[1].explanation`
   **Issue:** "Structure: mujhe + [adjective] + lagta/lagti + hai" oversimplifies. The adjective itself agrees with the implicit subject (`mujhe accha lagta hai` vs `mujhe acchi lagti hai`), and `lagta/lagti` agrees with that same subject. The current phrasing treats them as independent variables, which could confuse learners.
   **Suggested fix:** "Structure: mujhe + [adjective agreeing with subject] + lagta/lagti (agreeing with same subject) + hai. The adjective and verb both flex with the thing being judged."
   **Why not applied:** Pedagogical-meaning change at <80% confidence — the current simplification may be intentional A1-level scaffolding. Flagging for author review.
