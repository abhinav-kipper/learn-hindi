# Audit: hindi-lesson-09-doctor-visit

**File:** content/lessons/09-doctor-visit.json
**Audit date:** 2026-05-27
**Total fixes applied:** 4
**Items not applied:** 3

## Fixes applied

### Accuracy (3 items)

1. **Where:** field `phrases[4].context`
   **Was:** `"'kar sakte hain' is the polite modal for asking ability/permission. Note: speaker uses '-sakte hain' (plural-polite) addressing the doctor as 'aap'."`
   **Now:** `"'de sakte hain' (can give) — 'X sakte hain' is the polite modal for asking ability/permission. Speaker uses '-sakte hain' (plural-polite) addressing the doctor as 'aap'."`
   **Why:** Context referenced the wrong verb (`kar` vs `de`). The phrase teaches `de sakte hain` ("can give"), not `kar sakte hain` ("can do"). Generalized to the `X sakte hain` modal pattern so the example actually demonstrates the rule.

2. **Where:** field `skill_breakdown[0].more_examples[3].hindi`
   **Was:** `"kaan mein halki si dard hai"`
   **Now:** `"kaan mein halka sa dard hai"`
   **Why:** Adjective-noun gender agreement. `dard` (दर्द, pain) is masculine, so the modifier should be `halka sa` (m.), not `halki si` (f.). This is a Hindi grammar accuracy fix (rubric 1.1).

3. **Where:** field `skill_breakdown[1].more_examples[1].hindi`
   **Was:** `"ek hafte se khanssi aa rahi hai"`
   **Now:** `"ek hafte se khaansi aa rahi hai"`
   **Why:** Non-standard romanization. The Hindi word खाँसी is standardly romanized `khaansi` (long `aa`, single `s`). `khanssi` with double-s is incorrect (rubric 1.3, 2.4).

### Style (1 item)

1. **Where:** field `practice_prompt`
   **Was:** `"'dard kaisa hai? jhanjhanaahat ya tezz?', 'kuch khaaya tha kal raat?', 'bhukhar?', 'ulti hui?'"`
   **Now:** `"'dard kaisa hai? jhanjhanaahat ya tez?', 'kuch khaaya tha kal raat?', 'bukhar?', 'ulti hui?'"`
   **Why:** Two romanization style fixes in one cluster:
   - `tezz` → `tez`: standard romanization of तेज़ uses single `z`.
   - `bhukhar` → `bukhar`: wrong aspiration (the word is बुख़ार, no aspirated `bh`). Also restores consistency with phrase 1 in the same file (`bukhar`).

## Items not applied (3)

1. **Where:** field `phrases[5].hindi` / `culture_notes[2]` — `parhej`
   **Issue:** Standard romanization of परहेज़ is debated — `parhej` and `parhez` both appear in published romanized-Hindi materials.
   **Suggested fix:** Possibly normalize to `parhez` for the Urdu-origin `z` ending.
   **Why not applied:** Debated romanization per rubric 2.4 skip list; used consistently within the file.

2. **Where:** field `phrases[8].pronunciation` — `AAUN-gi`
   **Issue:** Treats `aaun` as a single all-caps stressed syllable; a finer split could be `AA-un-gi`.
   **Suggested fix:** Possibly `AA-un-gi` for clearer syllable beats.
   **Why not applied:** Pronunciation field is prosodic per the rubric's audit notes — CAPS marks the spoken beat, not lexical syllabification. Authorial choice.

3. **Where:** field `practice_prompt` — `jaayega`, `dekhein`, `kariye`
   **Issue:** Long internal `aa` and `-ei` endings could be normalized to `jayega` / `dekhen` (rubric single-vowel ending preference).
   **Suggested fix:** Optional normalization to match the strictest reading of rubric 1.3.
   **Why not applied:** These are internal long vowels / standard polite-imperative endings (per Snell & Weightman conventions), not the `karoongaa`-style endings the rubric calls out. Falls into the debated-romanization skip bucket.
