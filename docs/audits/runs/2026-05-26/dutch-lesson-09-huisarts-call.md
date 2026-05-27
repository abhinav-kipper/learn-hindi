# Audit: dutch-lesson-09-huisarts-call

**File:** content/dutch/lessons/09-huisarts-call.json
**Audit date:** 2026-05-26
**Total fixes applied:** 3
**Items not applied:** 2

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[0].pronunciation`
   **Was:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-TSHENT-num-mer VEER-duy-zend-acht-HON-derd-two-en-zev-en-tich`
   **Now:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-TSHENT-num-mer VEER-duy-zend-ACHT-hon-derd-TWAY-en-ZAY-ven-tich`
   **Why:** English word "two" embedded in a Dutch pronunciation string for `tweeën` (72). Replaced with Dutch romanization `TWAY-en`. Also normalized stress for `acht-honderd` (compound number → primary stress on `ACHT`) and corrected `zev-en-tich` to `ZAY-ven-tich` (Dutch "zeventig" has long /eː/ and stress on first syllable).

2. **Where:** field `phrases[5].pronunciation`
   **Was:** `zow ik uhn ver-WAY-zing KUN-nen KRAYCH-en naar uhn nay-ro-LOOCH`
   **Now:** `zow ik uhn ver-WAY-zing KUN-nen KRAYCH-en naar uhn nuh-ro-LOOCH`
   **Why:** Dutch `eu` is /øː/, not /ɛi/. `nay-` represents the `ei/ij` diphthong, which is incorrect for "neu-" in "neuroloog". Aligned with the codebase's existing convention for unstressed `eu` (cf. `mon-TUR` in lessons 06/07, `HEUR-der` in lesson 07).

3. **Where:** field `phrases[6].pronunciation`
   **Was:** `soms WORDT ik ook MIS-se-lik en che-VOO-lich voor LICHT`
   **Now:** `soms WORD ik ook MIS-se-lik en che-VOO-lich voor LICHT`
   **Why:** The phrase text is `Soms word ik...` — in 1sg inversion, Dutch drops the `-t` from `word`. Pronunciation field had `WORDT`, contradicting the (correct) phrase text. Fixed pronunciation to match.

## Items not applied (2)

1. **Where:** field `phrases[4].pronunciation` — `che-pro-BAYRD` for "geprobeerd"
   **Issue:** Dutch terminal devoicing renders final `-d` as /t/ ("geprobeerd" → /xəproˈbeːrt/). Could be `che-pro-BAYRT`.
   **Suggested fix:** Change `BAYRD` → `BAYRT` for phonetic accuracy.
   **Why not applied:** Codebase uses both spellings (`-d` and `-t`) for written-d-pronounced-t finals; treating this as a debated romanization choice per rubric §2.4 skip list.

2. **Where:** field `phrases[0].pronunciation` — `pa-TSHENT-num-mer` for "patiëntnummer"
   **Issue:** Dutch "patiënt" is /paːˈʃɛnt/ — closer to `pa-SHENT`. The `TSH` consonant cluster is unusual.
   **Suggested fix:** Change to `pa-SHENT-num-mer` or `pa-tsi-ENT-num-mer`.
   **Why not applied:** Debated romanization of the affricate-like onset; author may have chosen `TSH` deliberately to flag the unusual "ti" → "sh/tsh" mapping for learners. Flagged for review.
