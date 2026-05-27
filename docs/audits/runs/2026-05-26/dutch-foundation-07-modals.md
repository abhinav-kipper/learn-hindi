# Audit: dutch-foundation-07-modals

**File:** content/dutch/foundations/07-modals.json
**Audit date:** 2026-05-26
**Total fixes applied:** 2
**Items not applied:** 0

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `grammar_notes[2]`
   **Was:** `"Modal conjugations are often the same across persons: 'moeten': ik/jij/hij must all say 'moet'. Only 'willen' and 'kunnen' vary"`
   **Now:** `"Modal conjugations are often the same across persons: 'moeten' and 'mogen' have ik/jij/hij all the same ('moet', 'mag'). 'Willen', 'kunnen', and 'zullen' vary in the jij-form (wilt, kunt, zult — though wil/kun/zal are all heard too)"`
   **Why:** The original claim "only willen and kunnen vary" is factually wrong — `zullen` also varies in the jij-form (`zult` or `zal`). The theory table elsewhere in the same file already lists `zullen` as `zal / zult (or zal) / zal`, so the grammar note contradicted the table. Fix aligns the note with the table and explicitly lists which two modals are invariant in the singular (moeten, mogen) vs which three vary (willen, kunnen, zullen).

2. **Where:** field `skill_breakdown[0].explanation`
   **Was:** `"... zullen (zal/zal/zal/zullen), zouden (zou/zou/zou/zouden)."`
   **Now:** `"... zullen (zal/zult/zal/zullen), zouden (zou/zou/zou/zouden)."`
   **Why:** The jij-form of `zullen` is `zult` (or colloquially `zal`), not `zal/zal/zal`. The theory table in the same file already lists this correctly as `zal / zult (or zal) / zal`. The skill-breakdown line had a typo/oversight that contradicted the canonical table. `zouden` (conditional) genuinely is invariant — left as is.

## Items not applied

None. All identified accuracy issues were clear-confidence and auto-applied.

## Verification

- JSON parses: `node -e "JSON.parse(require('fs').readFileSync('content/dutch/foundations/07-modals.json','utf8')); console.log('OK')"` → `OK`
- Spot-checked the rest of the file against the audit axes:
  - **Modal + infinitive-at-end:** every phrase example and every theory example correctly places the infinitive at the clause end (`Ik wil Nederlands leren`, `Ik kan Nederlands spreken`, `Je moet hier wachten`, `We willen morgen naar Amsterdam gaan`, `Kun jij me helpen?`, `Zou u mij kunnen vertellen waar het station is?`, etc.). The deliberate counter-example `Ik kan spreken Nederlands` is explicitly flagged as WRONG in a warning callout — kept as a pedagogical contrast.
  - **Irregular singulars (kan/kun, wil/wilt, zal/zult):** singular tables are accurate across both grammar_notes and the theory table after fixes. Inverted-question -t drop (`kun jij?`, `wil jij?`) is taught correctly.
  - **niet vs geen placement:** the negation section's examples are all correctly placed (`Ik kan dit boek niet lezen`, `Hij wil niet gaan`, `Je mag dat hier niet doen`, `Ik wil geen koffie`, `We hebben geen tijd om te gaan`). `niet`-before-infinitive and `geen` for indefinite negation are both taught accurately.
  - **Pronunciation field:** uses Chai-Galli prosodic CAPS-stress convention. Approximations of Dutch `g` as `ch` and `ou` as `ow` are consistent across the file and align with how the rest of the Dutch corpus romanizes these sounds. No normalization needed.
  - **Practice prompt:** uses `u` register, lists the right error patterns to flag, and instructs B1-appropriate mixing. No issues.
