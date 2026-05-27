# Audit: dutch-knm-history-geography

**File:** content/dutch/knm.json
**Audit date:** 2026-05-26
**Scope:** category `"geschiedenis"` only (16 questions: knm-006, -012, -018, -024, -030, -036, -042, -048, -054, -060, -066, -072, -078, -084, -090, -096)
**Total fixes applied:** 0
**Items not applied:** 2

## Fixes applied

None. All 16 history questions passed audit on grammar, `correct_index`, and explanation accuracy.

## Items not applied (2)

1. **Where:** `knm-066` (In welk jaar werd het Koninkrijk der Nederlanden hersteld na de Franse bezetting?)
   **Issue:** Dutch verb `hersteld` ("restored") vs. English question `established` — slight mismatch. Strictly, the Kingdom of the Netherlands (1815) was a new state structure created at the Congress of Vienna, not a restoration of the old Republic. The English explanation uses "formally established in 1815", which aligns with English question but diverges from the Dutch wording.
   **Suggested fix:** Either rewrite Dutch question to "...werd het Koninkrijk der Nederlanden opgericht na de Franse bezetting?" or rewrite the English question/explanation to "was the Kingdom of the Netherlands re-established" to mirror `hersteld`.
   **Why not applied:** Debated translation. `Hersteld` is widely used in Dutch civic-integration framing for the 1813-1815 transition (sovereignty restored to the House of Orange, Dutch self-rule restored after French annexation). Confidence on the intended pedagogical framing <80%.

2. **Where:** `knm-090` (Wanneer werd de euro ingevoerd in Nederland?)
   **Issue:** The Dutch question asks "when was the euro introduced", but the English question adds the qualifier "as cash". The four options carry their own `als contant geld` qualifiers (option 0: "1 januari 1999 als contant geld" is false; option 1: "1 januari 2002 als contant geld" is the intended correct answer), so the question still works — but the Dutch stem is less precise than the English.
   **Suggested fix:** Add "als contant geld" to the Dutch question stem: "Wanneer werd de euro als contant geld ingevoerd in Nederland?" — mirroring the English version.
   **Why not applied:** Pedagogical-meaning change. Adding the qualifier shifts the question from a general euro-introduction recall (which the option labels then disambiguate) to a cash-specific recall. Naar Nederland-style civic questions often rely on options to disambiguate ambiguous stems. Confidence <80% on the intended framing.

## Notes (not findings — recorded for context)

- Dutch grammar checked across all 16 questions and explanations: V2 rule respected, subordinate-clause verb-final placement correct (`Een opstand waarbij België zich losmaakte van...`, `Een Europees verdrag waarbij grenscontroles ... zijn afgeschaft`), de/het articles correct (de bezetting, de revolte, de Watersnoodramp, het Schengenakkoord, het verdrag, de euro, de slavernij), past participles correct (`bevrijd`, `afgeschaft`, `ingevoerd`, `losmaakte`, `overstroomden`). No edits warranted.
- `correct_index` spot-checked against verifiable historical facts:
  - knm-006: NL liberation 5 May 1945 (German capitulation Wageningen) ✓
  - knm-012: Willem van Oranje (1533-1584), Father of the Fatherland ✓
  - knm-018: Slavery abolished 1 July 1863 (Keti Koti) ✓
  - knm-024: VOC = Vereenigde Oostindische Compagnie, founded 1602 ✓
  - knm-030: Women's active suffrage 1919 (men universal 1917) ✓
  - knm-036: Watersnoodramp 1 Feb 1953, ~1,835 deaths ✓
  - knm-042: Deltawerken, completed 1997 with Maeslantkering ✓
  - knm-048: Gouden Eeuw = 17th century ✓
  - knm-054: Tachtigjarige Oorlog 1568-1648, Vrede van Münster ✓
  - knm-060: NL joined EEG 1957 (Treaty of Rome founder) ✓
  - knm-066: Kingdom 1815, Willem I, Congress of Vienna ✓
  - knm-072: Belgian revolt 1830, independence recognised 1839 ✓
  - knm-078: Nazi occupation 1940-1945 (invasion 10 May 1940) ✓
  - knm-084: Anne Frank, hid 1942-1944, died Bergen-Belsen 1945 ✓
  - knm-090: Euro cash introduction 1 January 2002 ✓
  - knm-096: Schengen Agreement signed 1985, implemented 1995 ✓
- Style: explanations are tight, no AI-cliché openers, no "Let's dive in", no tautologies. No edits warranted under §2.
- knm-090 explanation states "Netherlands was one of the 12 founding eurozone members" — accurate at the time of cash introduction (Greece joined the eurozone Jan 2001, before banknotes/coins in Jan 2002, bringing the count to 12).
- knm-024 explanation calls VOC "the world's first publicly traded company" — widely accepted in Dutch civic education materials and Naar Nederland; some scholarly nuance exists but the simplification is appropriate for this audience.
- Category label: questions use category `"geschiedenis"` (Dutch). The UI label on `/dutch/knm` surfaces this as "History" in English per the user-facing copy. No separate "History & Geography" label exists in the data — the 16 questions all fit a History framing. No geography-only questions in this category.
