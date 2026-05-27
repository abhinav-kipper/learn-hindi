# Audit: dutch-lesson-10-job-interview

**File:** content/dutch/lessons/10-job-interview.json
**Audit date:** 2026-05-26
**Total fixes applied:** 3
**Items not applied:** 3

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[1].pronunciation`
   **Was:** `ik hep VYIF YAAR che-WERKT als pro-YEKT-ko-or-di-NA-tor bay uhn IT-be-DRAYF`
   **Now:** `ik hep VAYF YAAR che-WERKT als pro-YEKT-ko-or-di-NA-tor bay uhn IT-be-DRAYF`
   **Why:** "vijf" should render the IJ digraph as `AY` to match the file's own convention (mayn, bay, ZAYN, ZEET, DRAYF, TAYT). `VYIF` is inconsistent and misleading for English readers.

2. **Where:** field `phrases[5].pronunciation`
   **Was:** `bay mayn VOR-ri-che WERK-che-ver hep ik che-LAYRD hoo ik met DEAD-lains om MOET chaan`
   **Now:** `bay mayn VOR-ri-che WERK-che-ver hep ik che-LAYRT hoo ik met DEAD-lains om MOET chaan`
   **Why:** Dutch final-devoicing: "geleerd" ends in a -d that is pronounced as -t. Rendering it `che-LAYRD` teaches the wrong sound. The file already devoices elsewhere (`TAYT` for "tijd", `be-DANKT` for "bedankt").

3. **Where:** field `phrases[7].pronunciation`
   **Was:** `als ik WORDT AAN-che-NO-men, WAN-neer zow ik dan KUN-nen be-CHIN-nen`
   **Now:** `als ik WORT AAN-che-NO-men, WAN-neer zow ik dan KUN-nen be-CHIN-nen`
   **Why:** Two issues fixed in one token: (a) the Dutch text is "word" (1sg stem, no -t with "ik"), so the pronunciation should not show "WORDT"; (b) word-final -d is devoiced to -t. `WORT` reflects both the spelling and the actual pronunciation.

## Items not applied (3)

1. **Where:** field `phrases[1].hindi` (the Dutch sentence)
   **Issue:** Past-participle placement: "Ik heb vijf jaar gewerkt als projectcoördinator bij een IT-bedrijf." A strict V2 reading would push `gewerkt` to the clause end ("...bij een IT-bedrijf gewerkt").
   **Suggested fix:** Move `gewerkt` to the end of the clause.
   **Why not applied:** Post-PP extraposition of `als + functietitel` phrases is widely accepted in spoken/professional Dutch and natural in an interview register. Pedagogical-meaning call — flagging for author judgment.

2. **Where:** field `phrases[8].pronunciation`
   **Issue:** `TYP-ee-se` for "typische" uses Y to suggest a long-i sound; Dutch "y" in "typisch" is closer to a short Dutch i (/ɪ/), so `TIP-ee-se` would be more faithful for an English reader.
   **Suggested fix:** `TIP-ee-se`.
   **Why not applied:** Falls into the debated-romanization bucket — the file uses both styles across Dutch words. Skipped per rubric §3.

3. **Where:** field `phrases[2].pronunciation`
   **Issue:** `zow` for "zou" approximates the Dutch /ʌu/ diphthong with an English `ow` (as in "how"). Some Dutch resources prefer `zaw`.
   **Suggested fix:** Possibly `zaw`, but both are defensible.
   **Why not applied:** Debated romanization (no codebase-wide convention either way); not a clear-confidence fix.
