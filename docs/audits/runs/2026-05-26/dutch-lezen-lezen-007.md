# Audit: dutch-lezen-lezen-007

**File:** content/dutch/lezen.json
**Audit date:** 2026-05-27
**Total fixes applied:** 5
**Items not applied:** 0

## Fixes applied

### Accuracy (5 items)

1. **Where:** `texts[6].title_nl`
   **Was:** `Een ov-chipkaart kopen`
   **Now:** `Een OV-chipkaart kopen`
   **Why:** Per rubric 1.5, `OV-chipkaart` is the official term and should be capitalised. Aligns with `title_en` and the English body, which already use the capitalised form.

2. **Where:** `texts[6].body_nl` (4 instances of `ov-chipkaart` capitalised)
   **Was:** `...met een ov-chipkaart...anonieme ov-chipkaart...persoonlijke ov-chipkaart...De ov-chipkaart is geldig...`
   **Now:** `...met een OV-chipkaart...anonieme OV-chipkaart...persoonlijke OV-chipkaart...De OV-chipkaart is geldig...`
   **Why:** Same as above — consistent use of the official term throughout the text. The English body already uses `OV-chipkaart` in every reference; the Dutch body is now aligned.

3. **Where:** `texts[6].body_nl` first sentence
   **Was:** `In Nederland reist iedereen met het openbaar vervoer met een ov-chipkaart.`
   **Now:** `In Nederland reist iedereen in het openbaar vervoer met een OV-chipkaart.`
   **Why:** The original chained two `met` prepositional phrases (`reist...met het openbaar vervoer met een ov-chipkaart`), which is awkward in Dutch. Standard collocation is `reizen in het openbaar vervoer` for the mode of travel; `met een OV-chipkaart` then specifies the means of payment. Matches the recast in the English version ("everyone travelling by public transport uses an OV-chipkaart").

4. **Where:** `texts[6].questions[0].question_nl`
   **Was:** `Wat is een voordeel van een persoonlijke ov-chipkaart boven een anonieme?`
   **Now:** `Wat is een voordeel van een persoonlijke OV-chipkaart boven een anonieme?`
   **Why:** Consistent capitalisation of the official term.

5. **Where:** `texts[6].questions[1].options_nl[1]`
   **Was:** `Hoe de ov-chipkaart werkt in Nederland`
   **Now:** `Hoe de OV-chipkaart werkt in Nederland`
   **Why:** Consistent capitalisation of the official term.

## Items not applied (0)

None — no pedagogical-meaning fixes required flagging. All four MCQ `correct_index` values verified against the body text:
- Q1 (detail, index 1): body confirms `Als je de persoonlijke kaart verliest, kun je het saldo terugkrijgen`.
- Q2 (hoofdgedachte, index 1): body is indeed a general explanation of how the OV-chipkaart works.
- Q3 (woordbetekenis 'saldo', index 1): body defines it as `opladen met geld, het zogeheten saldo`.
- Q4 (woordbetekenis 'inchecken', index 2): body defines it as `de kaart tegen de lezer te houden`.

JSON re-parsed cleanly after edits (verified via `require('./content/dutch/lezen.json')`).
