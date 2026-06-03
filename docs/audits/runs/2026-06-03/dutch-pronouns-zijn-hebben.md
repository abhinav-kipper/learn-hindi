# Audit: dutch-pronouns-zijn-hebben

**File:** content/dutch/foundations/08-pronouns-zijn-hebben.json
**Audit date:** 2026-06-03
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

Verified rigorously against the unit-specific accuracy focus; no accuracy or clear-style fixes required.

Checks performed (all passed):

- **zijn conjugation** — ik ben / jij bent / u bent / hij-zij-het is / wij-jullie-zij zijn. Correct in grammar_notes[2], the `zijn` table (rows ik=ben, jij/u=bent, hij/zij/het=is, all plurals=zijn), skill_breakdown, and all examples.
- **hebben conjugation** — ik heb / jij hebt / u hebt-OR-heeft / hij-zij-het heeft / wij-jullie-zij hebben. The `hebben` table correctly lists `u: hebt / heeft`; grammar_notes[3] states both `u hebt` and `u heeft` are correct and common. `heeft` (not `hebt`) for hij/zij/het is consistent everywhere.
- **jij vs je / u register** — jij = stressed, je = unstressed everyday (grammar_notes[1], section 1 body, table notes). No register mixing within any example or phrase; `u` correctly takes the singular `jij`-form verb (`u bent`, `u hebt`).
- **Theory tables** — every row in both the `zijn` and `hebben` tables is correct; the 9-pronoun table is accurate (including `zij` doing double duty for she/they, and `het` noted as also meaning 'the' for het-words).
- **quick_check correct_index** — all five point to the right option: (1) `zij zijn moe` = they [idx 1]; (2) `jij` -> bent [idx 1]; (3) she has a car = `zij heeft een auto` [idx 1]; (4) new doctor -> `u` [idx 1]; (5) are you hungry informal = `Heb je honger?` [idx 1].
- **examples[].breakdown** — all accurate (identity/origin/state/possession/body-state labels correct; dropped-`-t` in inverted questions described correctly; no-article-before-nationality/profession rule correct).
- **Dropped -t rule** — correctly limited to `jij`/`je` after the verb in inversion (`heb je?`, `ben je?`), never with `u`/`hij`/`zij`. Stated in grammar_notes[4] and reinforced in sections 4 and 5.
- **Cultural/factual** — `je`/`u` social guidance accurate; `zijn` also = possessive 'his', `het` also = 'the' for het-words (culture_notes[2]) correct. `gemeente` spelled correctly.
- **Pronunciation fields** — syllable-stress format (hyphens + CAPS on stress); realistic and internally consistent Dutch approximations (hij="hay", zij/jij="zay/yay", mijn="mayn", heb/hond final-devoiced to "hep/hont", heeft="hayft", vijf="fayf", dertig="der-tich").
- **Structural** — JSON parses; required fields present; `references[]` non-empty and all from vetted sources (dutchgrammar.com, TaalCompleet A1, Naar Nederland); every theory section has heading/body/cutting_intro/quick_check plus a table and/or examples and/or callout.
- **Style** — no em-dashes, no arrow glyphs, no AI-cliché openers. Grammar jargon is glossed in plain words ("the base or dictionary form of the verb"). Mascot `cutting_intro` "Let's..." phrasings are the established Dutch-track mascot voice (Mr. Stroopwafel), not user-facing practice-prompt voice, so left as-is.

Both `node scripts/lint-content.mjs` and `node scripts/lint-quality.mjs` report zero violations for this file.
