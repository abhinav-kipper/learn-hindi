# Audit: dutch-lezen-lezen-007

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 0
**Items not applied:** 1

## Clean re-audit

This text was previously audited on 2026-05-26 (5 capitalisation + collocation fixes applied — see git history of this report). On re-audit today, the current state of `lezen-007` is clean against the rubric. No new accuracy or style fixes were required.

### Verification pass

**Dutch grammar (1.2):**
- V2 respected in every main clause (`reist iedereen...`, `kun je`, `heeft jouw naam`, `moet je inchecken`, `wordt er een boete...afgeschreven`).
- Subordinate clauses with `als` / `voordat` correctly verb-final (`Als je de persoonlijke kaart verliest`, `Voordat je in de trein...stapt`, `Als je vergeet uit te checken`).
- de/het articles correct throughout: `het openbaar vervoer`, `het saldo`, `de kaart`, `de lezer`, `de trein/bus/tram/metro`, `een boete` (de-word).
- Impersonal passive `wordt er een boete...afgeschreven` is idiomatic.
- Separable verb `afschrijven` correctly split (`wordt...afgeschreven`); `inchecken` and `uitchecken` correctly inflected.
- Adjective endings: `een anonieme OV-chipkaart`, `een persoonlijke OV-chipkaart`, `de persoonlijke kaart` — `-e` ending on `de`-words and after `een` + de-word, correct.
- `het zogeheten saldo` — correct neuter past-participle adjective form.

**Cultural / factual (1.5):**
- `OV-chipkaart`, `NS-station`, `servicebalie`, `servicepunt`, `saldo`, `inchecken`/`uitchecken` are the official terms used by NS / Translink and `ov-chipkaart.nl`.
- Currency reference is implicit (saldo in euros) — no Dutch/Hindi cross-contamination.

**Schema / structural (1.6):**
- JSON parses cleanly (verified — 10 texts, lezen-007 present).
- All required fields present (id, tier, topic, title_nl, title_en, body_nl, body_en, word_count, questions, references).
- 4 questions, each with type / question_nl / question_en / 4 options_nl / 4 options_en / correct_index / explanation_en.

**Pedagogical accuracy (1.4):**
All four MCQ `correct_index` values verified against the body text:
- Q1 (detail, index 1 — `Je kunt het saldo terugkrijgen als je de kaart verliest`): body says `Als je de persoonlijke kaart verliest, kun je het saldo terugkrijgen`. Match.
- Q2 (hoofdgedachte, index 1 — `Hoe de OV-chipkaart werkt in Nederland`): body is a complete how-it-works overview. Match.
- Q3 (woordbetekenis 'saldo', index 1 — `Het geldbedrag op de kaart`): body defines it as `opladen met geld, het zogeheten saldo`. Match.
- Q4 (woordbetekenis 'inchecken', index 2 — `Je kaart tegen de lezer houden bij het instappen`): body says `moet je inchecken door de kaart tegen de lezer te houden`. Match.

**Style (section 2):**
- No AI clichés ("Let's dive in", "It's important to note", "Get ready to...") present.
- Prose is tight; no throat-clearing or comma-spliced run-ons.
- Voice is neutral instructional, appropriate for an A2 Lezen text.

## Items not applied (1)

1. **Where:** `texts[6].body_nl` (whole text) and `references[]`
   **Issue:** The OV-chipkaart is being phased out in the Netherlands. Anonymous OV-chipkaarten were withdrawn from sale in 2023 and the personal OV-chipkaart is being retired in favour of OVpay (contactless bank/credit card or mobile-wallet check-in) and a new personal OV-pas, with full migration completing through 2025. By 2026 the text describes a system that is officially deprecated, although many travellers still hold valid cards during the transition.
   **Suggested fix:** Either (a) rewrite to centre OVpay and add a one-line note that legacy OV-chipkaarten are being phased out, or (b) explicitly mark the text as "Stand 2023" content so learners know it reflects the older system referenced in Naar Nederland A2.
   **Why not applied:** Pedagogical-meaning change of the whole text; the "Naar Nederland A2" reference is the official inburgering A2 source and still uses this material. Flagging for the maintainer to decide whether to refresh the topic for B1 inburgering 2026 or keep it aligned with the textbook.

JSON re-parsed cleanly after no edits (verified — 10 texts, lezen-007 present, valid JSON).
