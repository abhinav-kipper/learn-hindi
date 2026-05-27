# Audit: dutch-lesson-08-bank

**File:** content/dutch/lessons/08-bank.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 3

## Fixes applied

### Accuracy (2 items)

1. **Where:** field `grammar_notes[0]`
   **Was:** `"Separable verbs split in main clauses: 'openen' → 'Ik open een rekening'; 'blokkeren' → 'Kunt u die blokkeren?'; 'uitleggen' → 'Kunt u dit uitleggen?'. The prefix attaches only in infinitive form"`
   **Now:** `"Separable verbs split in main clauses: 'uitleggen' → 'Ik leg het uit'; 'instellen' → 'Ik stel de app in'; 'afschrijven' → 'De bank schrijft het bedrag af'. The prefix detaches and goes to the end of the clause, but stays attached after a modal ('Kunt u dit uitleggen?') and in te-infinitives ('om dit uit te leggen')"`
   **Why:** Two of the three original examples were not separable verbs at all. `openen` has no detachable prefix — `open` is just the present-tense stem of `openen`. `blokkeren` is a single-stem loan-verb (the Romance `-eren` ending), also non-separable. Only `uitleggen` was a genuine separable verb in the original list. Replaced with three verbs that actually appear in this lesson and are real separables (`uitleggen`, `instellen`, `afschrijven`), and corrected the rule: in a main clause the prefix DETACHES and moves to the end — the original "prefix attaches only in infinitive form" inverts the rule. Added the modal-clause and te-infinitive carve-outs that the rubric §1.2 lists.

2. **Where:** field `skill_breakdown[0].more_examples[3]`
   **Was:** `{ "hindi": "Is er een maandelijkse kosten voor deze rekening?", "english": "Is there a monthly fee for this account?" }`
   **Now:** `{ "hindi": "Zijn er maandelijkse kosten voor deze rekening?", "english": "Are there monthly fees for this account?" }`
   **Why:** `kosten` is a plural-only noun in Dutch (a plurale tantum — "costs/fees"). It cannot take the singular indefinite article `een`, and the verb must agree plural (`zijn`, not `is`). The English gloss is updated to plural to match. If the author wanted a strictly singular phrasing the rephrase would be "Zit er een maandelijks bedrag aan deze rekening vast?" or "Heb ik maandelijkse kosten?" — but the plural form is the natural and idiomatic question at a bank loket.

### Style (0 items)

### Structural (0 items)

## Items not applied (3)

1. **Where:** field `grammar_notes[4]` — `"Possessives: 'mijn' (my) vs 'uw' (your, formal). In bank contexts always use formal 'uw' when referring to the customer's items: 'Uw rekening', 'Uw pinpas'"`
   **Issue:** Slightly misleading framing. The customer (the learner — the speaker in this lesson) refers to their own items with `mijn`; `uw` is only used when the bank addresses the customer, or when the customer refers to the bank's items. The phrases throughout the lesson correctly use `mijn paspoort`, `mijn BSN`, `mijn pinpas`, `mijn saldo` — so the rule as stated contradicts the lesson's own examples.
   **Suggested fix:** Reframe as "The bank staff use formal 'uw' when addressing you ('uw rekening', 'uw pinpas'). You use 'mijn' for your own items and 'uw' only when referring to something belonging to the bank or the officer (rare in this context)."
   **Why not applied:** Pedagogical-meaning change; the original may be a deliberate shorthand for "expect to hear 'uw' a lot — match the formal register". Flagging for author review rather than rewriting.

2. **Where:** field `phrases[5].pronunciation` — `"KUNT u may UYT-ley-chen wat dit be-DRACH IN-howt"`
   **Issue:** `uitleggen` rendered as `UYT-ley-chen`. The `ey` middle syllable is a stretch — Dutch `leg` (short e) is closer to `leg` than `ley`. Similarly `inhoudt` as `IN-howt` loses the `d` voicing cue.
   **Suggested fix:** Could be `OWT-leg-gen` and `IN-howdt`.
   **Why not applied:** Dutch pronunciation in this corpus uses a loose phonetic transcription aimed at English readers, not IPA. The `ow`/`uy`/`ey` choices vary by file (e.g. `06-gemeente` uses `OWT-schray-ven` for `uitschrijven`). Author-style variation, not a clear error. Flag only.

3. **Where:** field `phrases[6].hindi` — `"Ik wil hier bezwaar tegen maken — dit bedrag ken ik niet."`
   **Issue:** The phrasing splits the pronominal adverb `hiertegen` ("against this") into `hier ... tegen`. Both forms exist in Dutch but the split form (`er`-split) is more colloquial and slightly less natural in a formal-bank register where `Ik wil hiertegen bezwaar maken` is the textbook form.
   **Suggested fix:** Either accept the split (matches spoken Dutch — many natives split) or rewrite as `Ik wil hiertegen bezwaar maken`.
   **Why not applied:** Both forms are correct. The split is actually MORE common in spoken Dutch and matches the conversational tone of a bank teller interaction. Deliberate authorial choice per rubric §3 skip criterion. Flag for review only.
