# Audit: dutch-lesson-07-housing-problem

**File:** content/dutch/lessons/07-housing-problem.json
**Audit date:** 2026-05-26
**Total fixes applied:** 2
**Items not applied:** 3

## Fixes applied

### Accuracy (1 item)

1. **Where:** field `phrases[0].pronunciation`
   **Was:** `"CHOO-den-DACH, u SPR-aykt met AY-sha pa-TEL, HEUR-der op de BUH-ken-laan TWAALF"`
   **Now:** `"CHOO-den-DACH, u SPRAYKT met AY-sha pa-TEL, HEUR-der op de BUH-ken-laan TWAALF"`
   **Why:** `spreekt` is a single syllable /sprekt/. Splitting it as `SPR-aykt` invents a false syllable break that contradicts the rubric's "hyphens between syllables" rule (§1.3). Collapsed to one stressed token.

### Style / clarity (1 item)

1. **Where:** field `grammar_notes[4]`
   **Was:** `"Conditional 'als': 'Als de monteur niet komt...' (if the technician doesn't come...) — verb is second position after 'als' clause. 'Als' + present tense = real future condition"`
   **Now:** `"Conditional 'als': 'Als de monteur niet komt, moet ik...' — the 'als' clause sends its verb ('komt') to the end (subordinate clause rule); the main clause that follows keeps V2 with the verb ('moet') right after the comma. 'Als' + present tense = real future condition"`
   **Why:** Original wording was ambiguous — "verb is second position after 'als' clause" could be misread as the verb inside the `als` clause itself, contradicting the subordinate-clause-verb-final rule the lesson assumes. Clarified that the V2 statement refers to the main clause's verb after a fronted subordinate clause, and named both verbs explicitly so the rule is unambiguous.

## Items not applied (3)

1. **Where:** field `grammar_notes[0]`
   **Issue:** `kapot gaan` is described as a separable verb. Strictly, `kapot` is more a predicative complement than a true separable prefix, and some grammars treat `kapotgaan` as a fixed expression rather than a separable verb. Dictionaries (Van Dale) do list it as separable, however.
   **Suggested fix:** Could rephrase as "Verb-particle construction 'kapot gaan'..." for stricter accuracy.
   **Why not applied:** Pedagogical-meaning change; the dictionary treatment supports the lesson's framing, and the simplification is useful at A2. Confidence <80% that "separable" is wrong.

2. **Where:** field `skill_breakdown[0].more_examples[4]`
   **Issue:** Dutch `"Er loopt water onder de keuken door."` literally means "water is running underneath the kitchen (through)." The English gloss `"Water is leaking under the kitchen floor."` adds the word `floor` that isn't in the Dutch. The intended meaning is likely correct contextually (water under the kitchen flooring) but the gloss is loose.
   **Suggested fix:** Either tighten to `"Water is leaking underneath the kitchen."` or adjust Dutch to `"Er loopt water onder de keukenvloer door."` to match.
   **Why not applied:** Pedagogical-meaning judgement call; the looser English better conveys the situation to an English-reading learner. Author's intent ambiguous.

3. **Where:** `phrases[*].pronunciation` (e.g. `CHOO-den-DACH`, `che-CHAAN`, `flat BAY`)
   **Issue:** Anglicized approximations of Dutch /ɣ/ (`ch`/`CH`), /e:/ (`AY`), letter names (`BAY` for B), etc.
   **Suggested fix:** Could use IPA-style or stricter Dutch-native syllabification.
   **Why not applied:** Deliberate authorial choice — the Hindi-lesson pronunciation field uses the same English-reader-friendly approximation style (§1.3 audit note on prosodic stress format applies here too). Consistent across the Dutch corpus.

## Notes from the pass

- All 10 phrases use formal `u`/`uw` register consistently — no `je`/`u` cross-contamination.
- V2 respected throughout main clauses; subordinate-clause-verb-final rule respected in `Als de monteur niet komt, moet ik...` and `Kunt u zo snel mogelijk iemand sturen om dit te repareren?` (the `om...te + infinitive` clause puts `repareren` at the end correctly).
- Perfect-tense auxiliary `zijn` correctly used with `gaan` (`Het is kapot gegaan`) — motion / change-of-state verb takes `zijn` per §1.2.
- Article gender correct: `de verwarming` (de-word), `het raam` (het-word), `de monteur`, `de boiler`, `de cv-ketel`, `de Huurcommissie`.
- Adjective endings correct: `kleine kinderen` (de-word plural, `-e` ending), `warm water` (het-word, no `-e` on indefinite — `er is geen warm water` ✓), `vreemd geluid` (het-word, no `-e` — `een vreemd geluid` ✓).
- Cultural / factual claims accurate: 24-hour urgent-repair window, Huurcommissie / Huurteam / Juridisch Loket roles, woningcorporatie storingsdienst, NL technician morning (8–12) / afternoon (12–17) windows.
- All structural fields present: `id`, `title`, `situation`, `skills`, `phrases`, `grammar_notes`, `culture_notes`, `skill_breakdown` (3 entries matching declared skills), `practice_prompt`, `references` (2 entries, non-empty), `level` (A2), `exam_targeted` (true).
- JSON parses successfully after edits.
- Practice prompt is in directive system-prompt voice with formal `u` instruction and a concrete opener line.
