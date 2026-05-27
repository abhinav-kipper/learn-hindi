# Audit: hindi-story-01-chai-stall

**File:** content/stories/01-chai-stall.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 2

## Fixes applied

None. File is clean against the auto-apply rules.

## Items not applied (2)

1. **Where:** `panels[1].hindi` ("Do chai dena, bhaiya. Ek meri aur ek aapki.") + `panels[3].hindi` ("Tumhara naam kya hai?")
   **Issue:** Register inconsistency by the same speaker (customer) toward the same addressee (Cutting). Panel 2 uses `aap` (`aapki`); Panel 4 shifts to `tum` (`Tumhara`). Per rubric §1.1 ("register consistency") this would normally be a fix.
   **Suggested fix:** Make both panels consistent — either `Ek meri aur ek tumhari` (panel 2) or `Aapka naam kya hai?` (panel 4).
   **Why not applied:** Plausibly a deliberate authorial choice — the customer warms up from polite `aap` to friendly `tum` after Cutting calls them `dost!` in panel 3. This is a realistic, very Hindi-naturalistic register softening within one conversation. Per §3 skip list ("stylistic choice the author may have made deliberately"), flagging for author review rather than auto-applying.

2. **Where:** `panels[0].pronunciation` — `GRAH-ak` for the word `grahak` (ग्राहक)
   **Issue:** The standard syllabification of `grahak` is `graa-hak` (long initial `aa`, then `hak`). The current `GRAH-ak` closes the first syllable with `H` rather than marking the long vowel, which reads as awkward against the rest of the file's convention of preserving long `aa` (cf. `in-te-ZAAR`, `tum-HAA-ra`, `BHAI-ya`, `na-HI`, `ka-HAAN` in story 02).
   **Suggested fix:** `GRAA-hak`.
   **Why not applied:** Romanization of the long-`aa` marker in pronunciation fields is inconsistently applied across the file (cf. `PA-ta` vs `tum-HAA-ra`, `NA-ni` in story 03 vs `MA-ya` in story 02), so the "correct" form is debated within the codebase's own conventions. Per §2.4 skip list, debated romanization defers to author review.

## Notes (informational, not action items)

- Prosodic CAPS in pronunciation (e.g., lowercase `chai` in `DO chai DE-na`) is intentional per CONTENT.md Audit Notes (2026-05-26). Not flagged.
- Pronunciation fields omit terminal punctuation but preserve mid-sentence commas/`?`/`!`. Consistent across all 3 stories — intentional style.
- `Arrey` (panel 3) vs `arey` (used in lessons 01, 02, 06) — story files prefer the double-`r` form for the interjection. Stylistic, not flagged.
- `Half-chai` / `full-friendship` — deliberate English-Hindi tagline for Cutting's character. Not flagged.
- Hindi grammar checks: verb agreement (`bechta hoon`, `deta hoon`, `kar raha hai`), oblique cases (`din ke pehle grahak ka intezaar`, `mere liye`), gender agreement on possessives (`meri`/`aapki` with feminine `chai`, `tumhara` with masculine `naam`) all correct.
- JSON parses cleanly. Schema fields (`id`, `title`, `panels[].scene/hindi/english/speaker`) all present.
