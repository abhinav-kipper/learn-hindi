# Audit: hindi-story-02-lost-in-bazaar

**File:** content/stories/02-lost-in-bazaar.json
**Audit date:** 2026-05-26
**Total fixes applied:** 1
**Items not applied:** 3

## Fixes applied

### Accuracy (1 item)

1. **Where:** `panels[0].hindi` + `panels[0].pronunciation`
   **Was:** `"Maya hotel Surya dhoond rahi hai. Usse koi pata nahi hai kahaan hai."` / `"… US-se KOI PA-ta na-HI hai ka-HAAN hai"`
   **Now:** `"Maya hotel Surya dhoond rahi hai. Use kuchh pata nahi hai ki kahaan hai."` / `"… U-se KUCHH PA-ta na-HI hai ki ka-HAAN hai"`
   **Why:** Postposition / case error per rubric §1.1. `usse` (उससे = ablative "from her") is the wrong case for "she has no idea." The dative pronoun is `use` (उसे = "to her"). Also corrected the awkward `koi pata nahi hai kahaan hai` (which lacks a complementizer) to `kuchh pata nahi hai ki kahaan hai` — natural Hindi structure with `ki` connector. Pronunciation updated to match the new syllable count (`U-se` instead of `US-se`, added `KUCHH` and `ki`).

## Items not applied (3)

1. **Where:** `panels[0].hindi` — `"hotel Surya dhoond rahi hai"`
   **Issue:** Specific/named direct objects in Hindi typically take the `ko` postposition — `"Hotel Surya ko dhoondh rahi hai"`. Without `ko`, "Hotel Surya" reads as an indefinite/generic object, which is mildly odd for a proper noun.
   **Suggested fix:** `"Hotel Surya ko dhoond rahi hai"` (and matching pronunciation insert).
   **Why not applied:** Colloquial Hindi often drops `ko` even with named objects, especially in headline/narrator register. Could be a deliberate authorial register choice. <80% confidence.

2. **Where:** `panels[0].hindi` (and other panels) — romanization `dhoond` vs `dhoondh`
   **Issue:** The verb is ढूँढना. The stem is ढूँढ, which most accurately romanizes as `dhoondh` (retroflex aspirated). `dhoond` drops the aspirate.
   **Suggested fix:** `dhoond` → `dhoondh` throughout.
   **Why not applied:** Debated romanization (rubric §2.4 skip list spirit — `chahiye/chaahiye`, `paanch/panch`). Both forms are seen in the codebase.

3. **Where:** `panels[1].hindi` — `"Seedha jaao, phir left."`
   **Issue:** Strictly, the adverbial form of `seedha` is `seedhe` (`seedhe jaao` = "go straight"). `seedha` is the adjectival form. Also the mixed-English `phir left` / `Right le lo` (panel 2) is unusual for a learning-target Hindi sentence.
   **Suggested fix:** `Seedhe jaao, phir baayein` and `Daayein le lo` for the next panel.
   **Why not applied:** (a) Colloquial spoken Hindi very often uses `seedha jaao` — deliberate register choice for a street-bazaar voice. (b) Code-mixing `left`/`right` with Hindi is the *actual* way directions are given in urban India, and the story is leaning on that authentic register; replacing them with `baayein`/`daayein` would change the pedagogical/authorial intent. Deliberate authorial choice.
