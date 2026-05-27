# Audit: hindi-vocabulary

**File:** content/vocabulary.json
**Audit date:** 2026-05-26
**Total fixes applied:** 4
**Items not applied:** 5

## Fixes applied

### Accuracy (4 items)

1. **Where:** `categories[everyday].words[0].pronunciation` (`accha`)
   **Was:** `ach-CHAA`
   **Now:** `ach-CHA`
   **Why:** Single-vowel ending per style guide (rubric 1.3). CAPS stress retained on the second syllable.

2. **Where:** `categories[emotions].words[5]` (`mazaa`)
   **Was:** hindi `mazaa`, pronunciation `ma-ZAA`
   **Now:** hindi `maza`, pronunciation `ma-ZA`
   **Why:** Single-vowel ending per style guide (rubric 1.3 — `karta` not `kartaa`). Word-final `aa` is exactly the form the rubric flags.

3. **Where:** `categories[food].words[1]` (`pani`)
   **Was:** hindi `pani`, example `thoda pani dena — give me some water`
   **Now:** hindi `paani`, example `thoda paani dena — give me some water`
   **Why:** Rubric 1.5 explicitly lists `paani` as the canonical Hindi term. The pronunciation field already had `PAA-ni` (long-aa), so the headword was the outlier. Internal `aa` retained because the long vowel is phonemically meaningful (paani vs pani would be ambiguous → matches the `haan`/`han` test in rubric 1.3).

4. **Where:** `categories[people].words[13].pronunciation` (`budha`)
   **Was:** `BUD-dha`
   **Now:** `BU-dha`
   **Why:** Headword `budha` (बूढ़ा) has no geminate consonant; the previous `BUD-dha` pronunciation implied a double-d gemination that doesn't exist in the word. Now matches the headword's actual phonology.

## Items not applied (5)

1. **Where:** `categories[food].words[4]` (`dal`)
   **Issue:** Headword `dal` could be rendered `daal` to disambiguate from English "dal" / match pronunciation `DAAL`.
   **Suggested fix:** Change hindi to `daal` and example `dal chawal` / `aaj dal bani hai` to `daal chawal` / `aaj daal bani hai`.
   **Why not applied:** Debated romanization. Both `dal` and `daal` are widely used; the codebase doesn't show a clear preference and the rubric (2.4) lists similar `aa` choices in its skip list. Flagging for human call.

2. **Where:** `categories[emotions].words[9]` example (`confused`)
   **Issue:** Example uses `bohot` instead of standard `bahut` (`main bohot confused hoon`).
   **Suggested fix:** `main bahut confused hoon` for consistency with `bahut` used elsewhere in the file (`bahut khush`, `bahut pyaar`, `bahut mazaa`, `bahut thaka`, `bahut mirchi`, `bahut bore`).
   **Why not applied:** `bohot` is a recognised colloquial spelling; could be intentional dialect choice. Style call, not accuracy — flagging.

3. **Where:** `categories[emotions].words[3]` (`dar`) and `words[2]` (`gussa`)
   **Issue:** English glosses list adjectives ("scared / afraid", "angry / mad / furious") for nouns. The headwords are grammatically nouns ("fear", "anger") used in expressions like `dar lag raha hai` / `gussa hai`.
   **Suggested fix:** Tighten glosses to noun forms only ("fear", "anger") or document the noun-with-adjectival-feel pattern.
   **Why not applied:** Pedagogical-meaning change <80% confident; the current gloss is arguably more useful to a learner who'll hear these in adjectival-feeling contexts. Flagging for the author.

4. **Where:** `categories[emotions].words[12]` (`relief`)
   **Issue:** English `relieved / relief` mixes adjective + noun; `type` is `noun`; example uses noun form (`finally relief mila`).
   **Suggested fix:** Drop `relieved` from gloss, keep `relief` only.
   **Why not applied:** Same as above — could be intentional learner-helper redundancy. Pedagogical call.

5. **Where:** Cross-category duplication: `yaar` and `bhai` appear in both `everyday` (type=`filler`) and `people` (type=`noun`).
   **Issue:** Same headword in two categories with different framings.
   **Suggested fix:** Either accept the duplication as intentional (filler-use vs relationship-use) or pick one home and reference from the other.
   **Why not applied:** Looks deliberate — the categories teach different uses of the same word. Calling out for the author to confirm.

## Notes for future audits

- Pronunciation field uses sentence-prosodic CAPS per CONTENT.md audit notes — `BAAD mein`, `YAAR` etc. are not bugs even when the same word appears lowercase elsewhere in lesson files. Did not touch.
- Hindi headwords like `bachcha` (`BACH-cha`) keep the `chcha` cluster because the rubric's `chh`-for-छ rule targets छ specifically, not geminated च. Left alone.
- Internal long-vowel `aa` (mid-word) preserved throughout — `pareshan`/`pa-re-SHAAN`, `hairaan`/`hai-RAAN`, `rishtedaar`/`rish-te-DAAR`, `hazaar`/`ha-ZAAR` etc. — the single-vowel rule applies to word endings.
- Category coherence checked: 6 categories × ~15 words each, ordering and grouping read sensibly for a beginner learner.
