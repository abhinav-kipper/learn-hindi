# Audit: hindi-lesson-07-home-visit

**File:** content/lessons/07-home-visit.json
**Audit date:** 2026-05-26
**Total fixes applied:** 0
**Items not applied:** 0

## Clean

No accuracy, structural, or style fixes needed. Notes from the pass:

- All 10 phrases use the polite `aap` register consistently with the `-iye`/`-iyega` imperatives the lesson teaches. Register stays uniform throughout (no `tu`/`aap` cross-contamination).
- Romanization follows single-vowel endings per style guide (`hoon`, `laaya`, `kijiye`, `samjhiye`, `dun`). `paani`/`paa-NI` and `khaas`/`KHAAS` use long-vowel forms only where lexically established or where prosody marks the stressed beat — consistent with §1.3 and the 2026-05-26 audit note on prosodic pronunciation.
- `ne` rule correctly applied in `aap ne toh poori dawat kar di` (transitive past, subject takes `ne`, verb `kar di` agrees with feminine object `dawat`).
- Compound verbs (`utaar dun`, `laaya hoon`, `kha lena`, `chadha rahi hoon`) are accurate for the politeness/completion semantics the grammar notes describe.
- All structural fields present: `id`, `title`, `situation`, `skills`, `phrases`, `grammar_notes`, `culture_notes`, `skill_breakdown` (3 entries matching the 3 declared skills), `practice_prompt`, `references` (3 entries, non-empty).
- JSON parses successfully.
- No AI-cliché openers, no throat-clearing, no tautologies. Culture notes are concrete (15-30 minutes of post-`ab chalta hoon` conversation; `charan-sparsh` for senior elders).
- Practice prompt is in correct directive system-prompt voice with `[[CORRECTION:]]` tag format, 6-8 turn cap, and lesson-grammar surfacing instructions.
