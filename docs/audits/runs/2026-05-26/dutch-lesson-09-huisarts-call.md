# Audit: dutch-lesson-09-huisarts-call

**File:** content/dutch/lessons/09-huisarts-call.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2 (this pass) — 5 cumulative across audit runs
**Items not applied:** 1

## Fixes applied (this pass)

### Accuracy (2 items)

1. **Where:** field `phrases[0].pronunciation`
   **Was:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-TSHENT-num-mer VEER-duy-zend-ACHT-hon-derd-TWAY-en-ZAY-ven-tich`
   **Now:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-SHENT-num-mer VEER-duy-zend-ACHT-hon-derd-TWAY-en-ZAY-ven-tich`
   **Why:** Dutch "patiënt" is pronounced /paːˈʃɛnt/ — the "ti" before "ë" maps to /ʃ/, not /tʃ/ or /ts/. The `TSH` onset reads as an English "ch"-like affricate that does not occur here. `pa-SHENT` reflects the actual Dutch pronunciation and is consistent with how other Dutch "-tie" / "-ti-" words would be romanized. Treating this as accuracy (1.3) rather than debated romanization — Dutch unambiguously has /ʃ/, not /tʃ/, in this position.

2. **Where:** field `phrases[5].pronunciation`
   **Was:** `zow ik uhn ver-WAY-zing KUN-nen KRAYCH-en naar uhn nuh-ro-LOOCH`
   **Now:** `zow ik uhn ver-WAY-zing KUN-nen KRAY-chen naar uhn nuh-ro-LOOCH`
   **Why:** Dutch "krijgen" syllabifies as krij-gen — the intervocalic "g" (/ɣ/) belongs to the second syllable, not the first. `KRAYCH-en` puts the consonant in the wrong syllable; `KRAY-chen` matches both the spelling-derived and prosodic break.

## Items not applied (1)

1. **Where:** field `phrases[4].pronunciation` — `che-pro-BAYRD` for "geprobeerd"
   **Issue:** Dutch terminal devoicing renders final `-d` as /t/ ("geprobeerd" → /xəproˈbeːrt/). Could be `che-pro-BAYRT`.
   **Suggested fix:** Change `BAYRD` → `BAYRT` for phonetic accuracy.
   **Why not applied:** Codebase uses both spellings (`-d` and `-t`) for written-d-pronounced-t finals; treating this as a debated romanization choice per rubric §2.4 skip list. Carried forward from the prior pass.

---

## Historical fixes (prior pass, 2026-05-26)

### Accuracy (3 items)

1. **Where:** field `phrases[0].pronunciation`
   **Was:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-TSHENT-num-mer VEER-duy-zend-acht-HON-derd-two-en-zev-en-tich`
   **Now:** `u SPRAYKHT met KAV-ya SHAR-ma, pa-TSHENT-num-mer VEER-duy-zend-ACHT-hon-derd-TWAY-en-ZAY-ven-tich`
   **Why:** English word "two" embedded in a Dutch pronunciation string for `tweeën` (72). Replaced with Dutch romanization `TWAY-en`. Also normalized stress for `acht-honderd` (compound number → primary stress on `ACHT`) and corrected `zev-en-tich` to `ZAY-ven-tich` (Dutch "zeventig" has long /eː/ and stress on first syllable).

2. **Where:** field `phrases[5].pronunciation`
   **Was:** `zow ik uhn ver-WAY-zing KUN-nen KRAYCH-en naar uhn nay-ro-LOOCH`
   **Now:** `zow ik uhn ver-WAY-zing KUN-nen KRAYCH-en naar uhn nuh-ro-LOOCH`
   **Why:** Dutch `eu` is /øː/, not /ɛi/. `nay-` represents the `ei/ij` diphthong, which is incorrect for "neu-" in "neuroloog". Aligned with the codebase's existing convention for unstressed `eu`.

3. **Where:** field `phrases[6].pronunciation`
   **Was:** `soms WORDT ik ook MIS-se-lik en che-VOO-lich voor LICHT`
   **Now:** `soms WORD ik ook MIS-se-lik en che-VOO-lich voor LICHT`
   **Why:** In 1sg inversion, Dutch drops the `-t` from `word`. Pronunciation field had `WORDT`, contradicting the (correct) phrase text. Fixed pronunciation to match.
