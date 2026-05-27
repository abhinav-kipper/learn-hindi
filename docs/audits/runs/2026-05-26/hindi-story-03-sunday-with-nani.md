# Audit: hindi-story-03-sunday-with-nani

**File:** content/stories/03-sunday-with-nani.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 1

## Fixes applied

None.

## Items not applied (1)

1. **Where:** `panels[1].hindi` (and pronunciation)
   **Issue:** Spelling `Arrey` (double-r) vs the codebase's more common `arey` (single-r). The codebase has ~7 uses of `arey` (lessons 01, 02, 06, 07) and only 2 uses of `arrey` (lesson 08 shopping + this story). The pronunciation field already renders it as `a-REY` (single-r), so there's an internal mismatch between the hindi form and the pronunciation form within this panel.
   **Suggested fix:** Either normalize `Arrey` → `Arey` in `hindi` to match the dominant codebase convention and the panel's own pronunciation, or accept this as a deliberate stylistic doubling for haggling/exclamation emphasis (the pattern seen in lesson 08).
   **Why not applied:** Debated romanization (rubric §2.4 / §3) — both forms exist in the codebase as legitimate choices, and the doubled-r may be a deliberate authorial cue for an extra-emphatic exclamation (Nani is mock-scolding her grandchild). Flagging for user review.

## Notes (informational, not flagged as issues)

- **Mixed register `tu` (Nani) / `aap` (Cutting) is correct.** Cutting greets Nani with formal `aapse milne aaya hoon` (respect for elder); Nani uses intimate `tu` to her grandchild throughout (`aa gaya tu`, `tu toh bahut patla ho gaya hai`, `le ja`, `khaayega`). Register stays consistent *within* each speaker — only crossing speakers, which the rubric (§1.1 last bullet) explicitly scopes to within a phrase/paragraph.
- **`khaayega` and `khaa liya` preserve the long verb root `khaa-`** to match the codebase's established style (foundation 04-future-tense conjugates as `khaaunga`/`khaayega`/`khaaoge`; conjugations lib mirrors). Not a single-vowel-ending case — those rules govern endings (`karta` not `kartaa`), not root vowels.
- **Gender agreement clean.** Cutting (masculine): `aaya hoon`, `patla ho gaya hai`, `khaa liya`, `pet bhar gaya` — all masculine. Nani's imperatives `utaar de` / `dho le` / `le ja` are gender-neutral (tu form). No agreement bugs.
- **`joote yahin utaar de` matches the parallel phrase in lesson 07-home-visit** (`joote yahin utaar dun?`) — same romanization, same idiom.
- **Pronunciation CAPS is prosodic, not lexical** (per CONTENT.md Audit Notes 2026-05-26). The pattern `KHAA-ye-ga KAL` and `PET BHAR ga-ya` reflects sentence-beat stress and is consistent with the rest of the corpus. No normalization needed.
- **Schema valid:** all 5 panels have `scene`, `hindi`, `english` plus optional `speaker`, `speaker_position`, `pronunciation`. JSON parses.
