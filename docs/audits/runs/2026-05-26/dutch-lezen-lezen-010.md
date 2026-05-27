# Audit: dutch-lezen-lezen-010

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 2
**Items not applied:** 0

## Fixes applied

### Accuracy (2 items)

1. **Where:** `texts[lezen-010].body_nl` (paragraph 3, last sentence)
   **Was:** `Met die code activeert u uw DigiD account.`
   **Now:** `Met die code activeert u uw DigiD-account.`
   **Why:** Dutch orthography requires a hyphen when joining an abbreviation/proper-name to a common noun. The same text already uses the correct hyphenated form for `DigiD-inloggegevens` and `DigiD-gegevens` in the next paragraph — this normalises the lone unhyphenated case for internal consistency.

2. **Where:** `texts[lezen-010].questions[3].explanation_en` (the `gevolg` question about consequences of not having a BSN)
   **Was:** `The text states 'Zonder BSN kunt u deze diensten niet gebruiken' — without a BSN you cannot use these services, referring to health insurance, tax declarations and banking.`
   **Now:** `The text states 'Zonder BSN kunt u deze essentiële diensten niet gebruiken' — without a BSN you cannot use these essential services, referring to health insurance, tax declarations and banking.`
   **Why:** The Dutch quotation in the explanation was a misquote — it dropped the word `essentiële`, which is actually present in `body_nl`. Quotation accuracy is a rubric 1.4 (pedagogical accuracy) and 1.5 (factual) concern, so the missing word is restored and the English gloss is updated to match.

## Items not applied (0)

None — the rest of the text checks out:

- Dutch grammar: V2, subordinate-clause verb-final, separable verbs (`vragen aan`, `inschrijven`, `inloggen`, `meenemen`, `melden`, `wijzigen`), modal + infinitive, perfect tense with `hebben` all correct.
- `u heeft` vs `u hebt`: both are accepted in formal Dutch; the text uses `u heeft` consistently — acceptable B1 register, no change.
- Compound nouns spelled correctly (`burgerservicenummer`, `zorgverzekering`, `belastingaangifte`, `bankrekening`, `gemeentehuis`, `identiteitsbewijs`, `werkdagen`, `patiëntenportaal`, `gebruikersnaam`, `wachtwoord`, `woonadres`, `huurtoeslag`, `zorgtoeslag`).
- English translation is faithful and idiomatic; mixed-language terms (`gemeente`, `gemeenten`, `BSN`, `DigiD`, `BRP`, `Belastingdienst`, `UWV`, `huurtoeslag`, `zorgtoeslag`) are appropriately preserved per rubric 1.5 (official Dutch terms).
- All four questions are well-formed with one correct answer each; distractors are plausible; bilingual options align 1-for-1.
- `correct_index` values point to the correct options:
  - Q1 (detail, activation code timing) → index 2 "Doorgaans binnen vijf werkdagen": matches `doorgaans binnen vijf werkdagen` in body.
  - Q2 (hoofdgedachte) → index 1: accurately captures the two-prong subject.
  - Q3 (woordbetekenis, activatiecode) → index 1: matches `per post verstuurd` description.
  - Q4 (gevolg, no BSN) → index 1: matches `Zonder BSN kunt u deze essentiële diensten niet gebruiken` (now correctly quoted).
- `word_count: 309` is a plausible count for the Dutch body (rough split-and-count agrees within tolerance).
- `references[]` populated (4 entries, including authoritative `rijksoverheid.nl/bsn` and `digid.nl`).
- JSON parses; total of 10 texts preserved; `lezen-010` still has 4 questions.
