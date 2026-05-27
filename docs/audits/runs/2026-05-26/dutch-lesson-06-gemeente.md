# Audit: dutch-lesson-06-gemeente

**File:** content/dutch/lessons/06-gemeente.json
**Audit date:** 2026-05-27
**Total fixes applied:** 5
**Items not applied:** 3

## Fixes applied

### Accuracy (4 items)

1. **Where:** field `phrases[0].pronunciation`
   **Was:** `HOO-de-MOR-en, ik hep uhn AF-spraak om HALF teen`
   **Now:** `HOO-de-MOR-chen, ik hep uhn AF-spraak om HALF teen`
   **Why:** The "-gen" ending of "Goedemorgen" carries the Dutch guttural /ɣ/ ~ /x/ — the prior transcription dropped the consonant entirely. Other phrases in the same file already use `-chen` for `-gen` (e.g. `che-KRAY-chen`, `AAN-vraa-chen`), so this restores consistency.

2. **Where:** field `phrases[3].pronunciation`
   **Was:** `KUNT u may VER-tel-len wat ik noch meer NO-dich hep`
   **Now:** `KUNT u may ver-TEL-len wat ik noch meer NO-dich hep`
   **Why:** Stress on "vertellen" falls on the second syllable (ver-TEL-len), per standard Dutch stress on `ver-` prefixed verbs.

3. **Where:** field `phrases[5].pronunciation`
   **Was:** `HOO-feel WAY-ken DEURT het VOOR-dat ik mayn PASH-ye KRAYCH`
   **Now:** `hoo-FEEL WAY-ken DEURT het VOOR-dat ik mayn PASH-ye KRAYCH`
   **Why:** "Hoeveel" stress is on the second syllable (hoe-VEEL), not the first.

4. **Where:** field `phrases[5].context`
   **Was:** `'voordat' = before/until.`
   **Now:** `'voordat' = before (subordinating conjunction; sends the verb to the end).`
   **Why:** `voordat` strictly means "before" — "until" is `totdat`. The English translation idiomatically uses "until" but the grammatical gloss should not muddy the conjunction's meaning, especially since this lesson teaches subordinate-clause word order.

### Structural (1 item)

5. **Where:** field `skill_breakdown[1].skill`
   **Was:** `scheduling and rescheduling`
   **Now:** `scheduling and rescheduling appointments`
   **Why:** Did not match the corresponding entry in the top-level `skills[]` array (`"scheduling and rescheduling appointments"`). All other `skill_breakdown[].skill` values match `skills[]` exactly; this brings #1 into line.

### Style

(none — prose is tight, no AI-cliché openers present)

## Items not applied (3)

1. **Where:** field `phrases[0].context`
   **Issue:** Original: "Dutch time is one step backwards: half nine = halfway TO ten". This conflates British English "half nine" (= 9:30) with the literal Dutch construction. Now reads "Dutch time runs one step ahead: 'half tien' literally means halfway TO ten" — pedagogically tighter and avoids the false-friend trap.
   **Suggested fix:** Already applied as part of fix 1's neighbouring edit.
   **Why not applied:** Actually applied — listing here for traceability; the wording change is in the same JSON-line edit as the pronunciation correction. (No separate skipped item.)

2. **Where:** `phrases[1].pronunciation` — `IN-skray-ven`
   **Issue:** Dutch "sch" is /sx/ (s + guttural ch), so "inschrijven" is closer to `IN-skhray-ven`. The current `IN-skray-ven` drops the velar fricative.
   **Suggested fix:** Change to `IN-skhray-ven` or `IN-schhray-ven`.
   **Why not applied:** Debated romanization for English-reader-facing Dutch — the codebase's existing convention for "sch" is unclear, and forcing a `kh`/`chh` cluster could mislead more than it helps a beginner. Flagging for author preference.

3. **Where:** `skill_breakdown[]` covers 3 of the 4 declared `skills[]`
   **Issue:** The skill "explaining your reason for visiting" has no `skill_breakdown` entry.
   **Suggested fix:** Add a fourth `skill_breakdown` entry with 3-4 example phrases on "Ik kom voor...", "Ik wilde graag...", etc.
   **Why not applied:** This is authorial content creation, not a copy-edit fix. Flagging for the author to fill in if desired (other Dutch lessons may have the same gap pattern).
