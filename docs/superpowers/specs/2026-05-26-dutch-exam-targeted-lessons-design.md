# Dutch Exam-Targeted Lessons — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Add a dedicated **Exam scenarios** section to the Dutch home page with 6 new lessons covering scenarios the Inburgeringsexamen B1 directly tests. The existing 5 conversational lessons (supermarket / introductions / cafe / doctor / transport) stay as casual A1 content; the 6 new lessons fill the A2/B1 gap with formal scenarios (gemeente, housing, bank, formal huisarts call, job interview, parent-school).

After this ships, the Dutch home surfaces three vertical strata: (1) exam-skill modules (KNM / Lezen / etc.) — the test format, (2) **exam-targeted scenario lessons** — the vocab + register for the test, (3) casual lessons & grammar — supplementary.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Section flavor | Content lessons (scenarios), NOT meta-strategy / test tactics |
| Batch size | 6 lessons |
| CEFR levels | 3 A2 + 3 B1 (no A1 — already covered by existing casual lessons) |
| Architecture | Extend existing Lesson schema with optional `level` + `exam_targeted` fields; new lessons live in `content/dutch/lessons/`; Dutch home splits bottom section into "Exam scenarios" + "Lessons & Grammar" |
| Routes | Re-use existing `/lessons/[id]` + `/practice/[id]` — they already work cross-language |
| Bilingual support | Each phrase already has `dutch` + `english` in the existing schema. No new translation infrastructure. |

## 3. The 6 lessons

| ID | Title (EN) | Title (NL) | Tier | Why it matters |
|---|---|---|---|---|
| `06-gemeente` | At the gemeente | Bij de gemeente | A2 | Registering address, asking about paperwork, scheduling appointment. Common Spreken + Schrijven scenario. |
| `07-housing-problem` | A problem with the house | Probleem met de woning | A2 | Calling landlord about leak/heating/neighbour. Phone register + formal email vocab. |
| `08-bank` | At the bank | Bij de bank | A2 | Opening account, complaint about a charge, understanding loonstrook (payslip). Routine but formal. |
| `09-huisarts-call` | Calling the huisarts | De huisarts bellen | B1 | Formal phone register, explaining ongoing condition, asking for referral. B1 version of the existing A1 `04-doctor`. |
| `10-job-interview` | Job interview | Sollicitatiegesprek | B1 | "Vertel iets over uzelf" / "Waarom wilt u hier werken" + workplace vocab. |
| `11-primary-school` | At primary school | Op de basisschool | B1 | Parent-teacher meeting, asking about a child's progress, school registration. |

Each lesson follows the existing Dutch Lesson schema: 8-10 bilingual phrases (each with `dutch`, `english`, `context`, `pronunciation`) + 3-5 grammar_notes + 2-4 culture_notes + 2-3 skill_breakdowns + practice_prompt (drives `/practice/<id>`) + references.

### Per-lesson detail (authoring guidance)

**`06-gemeente` (A2):** scenario = newcomer registering address (BRP-inschrijving). Phrases cover: greeting officer with `u`, stating purpose ("Ik kom mij inschrijven"), providing BSN / passport / huurcontract, scheduling follow-up. Grammar focus: formal `u` register, polite imperatives ("Mag ik even uw paspoort zien?"), forms vocab ("formulier", "bewijs", "bijlage"). Culture: appointments via online portal, bring ID + proof of address, processing time.

**`07-housing-problem` (A2):** scenario = renter calling landlord/housing-corp about a problem (heating broken, leak, noise complaint). Phrases cover: explaining the issue ("Het verwarmt niet meer"), urgency ("Het is dringend"), asking for action ("Kunt u iemand sturen?"), follow-up ("Wanneer komt er een monteur?"). Grammar: present perfect ("Het is kapot gegaan"), urgency softeners ("zo snel mogelijk"). Culture: tenants' rights, when to escalate to the Huurcommissie.

**`08-bank` (A2):** scenario = at the bank: opening an account, asking about a transaction, complaining about a fee. Phrases: "Ik wil graag een rekening openen", "Ik zie hier een afschrijving die ik niet herken", "Kunt u mij dit uitleggen?". Grammar: present + simple past for describing past transactions, modal `kunnen/zou` for polite requests. Culture: pinpas vs creditcard, automatic incasso, what a loonstrook is.

**`09-huisarts-call` (B1):** formal phone-register scenario. Distinct from existing A1 `04-doctor` (which is at the desk). User calls to schedule, explains symptoms in formal register, asks about a referral to a specialist (verwijzing). Grammar: subordinate clauses with omdat / als, modal `moeten/zou`, indirect speech ("De huisarts zei dat ik..."). Culture: doctor only refers when needed; how huisartsen-praktijk phone lines work; what to do if the line is closed (waarneemarts).

**`10-job-interview` (B1):** formal interview. Phrases: introducing yourself professionally, describing experience, explaining motivation, asking thoughtful questions. Grammar: perfect tense for describing past experience ("Ik heb 5 jaar gewerkt bij..."), conditional ("Als ik aangenomen word..."). Culture: punctuality, direct but polite tone, salary discussion timing.

**`11-primary-school` (B1):** parent-teacher meeting. Phrases: introducing yourself as parent, asking about child's progress, raising concerns, discussing homework. Grammar: indirect questions ("Ik vroeg me af of..."), comparatives ("hij is beter geworden in..."), reflexives ("zich gedragen"). Culture: rapport (report card) schedule, oudergesprek norms, when to ask for an oudergesprek vs trust the teacher.

## 4. Schema additions

### `types/lesson.ts` (or wherever Lesson type lives)

Add two optional fields:

```ts
export interface Lesson {
  id: string
  title: string
  // ... existing fields
  level?: 'A1' | 'A2' | 'B1'
  exam_targeted?: boolean
}
```

Both optional — existing lessons that don't set them default to `undefined`, which the home page treats as "not exam-targeted, A1 default".

### Existing 5 Dutch conversational lessons

Add `"level": "A1"` and `"exam_targeted": false` to each. Tiny patch, no behavioral change other than letting the new home filter work.

### New 6 lesson JSONs

Each gets `"level": "A2"` or `"B1"`, `"exam_targeted": true`.

## 5. File changes

### Modified

| Path | Change |
|---|---|
| `types/lesson.ts` (or equivalent) | Add optional `level` + `exam_targeted` fields to Lesson |
| `content/dutch/lessons/01-supermarket.json` | Add `level: "A1"`, `exam_targeted: false` |
| `content/dutch/lessons/02-introductions.json` | Same |
| `content/dutch/lessons/03-cafe.json` | Same |
| `content/dutch/lessons/04-doctor.json` | Same (`level: "A1"`) |
| `content/dutch/lessons/05-transport.json` | Same |
| `lib/dutch/lessons.ts` | Register 6 new imports |
| `lib/dutch/level-map.ts` | Add the 6 new IDs with their tiers |
| `app/page.tsx` | Dutch branch — split bottom section into "Exam scenarios" (filter `exam_targeted=true`) + "Lessons & Grammar" (the remainder) |
| `CONTENT.md` | New Dutch section: "Exam-Targeted Scenarios" with the 6-row inventory table |

### New

| Path |
|---|
| `content/dutch/lessons/06-gemeente.json` |
| `content/dutch/lessons/07-housing-problem.json` |
| `content/dutch/lessons/08-bank.json` |
| `content/dutch/lessons/09-huisarts-call.json` |
| `content/dutch/lessons/10-job-interview.json` |
| `content/dutch/lessons/11-primary-school.json` |

### Deleted

None.

## 6. Dutch home page layout (after this ships)

```
🇳🇱 Goal: Inburgeringsexamen B1 + KNM
[Your path: A1 / A2 / B1 progress bars]

EXAM SKILLS
[KNM live]  [Reading live]  [Listening soon]
[Writing soon]  [Speaking soon]

EXAM SCENARIOS                              ← NEW
[06-gemeente A2]      [07-housing A2]
[08-bank A2]          [09-huisarts B1]
[10-job-interview B1] [11-primary-school B1]

LESSONS & GRAMMAR
[01-supermarket]  [02-introductions]  [03-cafe]
[04-doctor]       [05-transport]
[01-numbers]      [02-pronunciation]  ... (foundations)
```

The new "Exam scenarios" section is rendered with `LessonStickerCard` (same component as casual lessons), `routeBase="lessons"`. Each card displays its level badge prominently (similar to the Lezen tier section headers).

## 7. Practice mode behavior

Each new exam-targeted lesson's `practice_prompt` drives the Gemini AI chat at `/practice/<id>` with B1 formal register. For example:

**`06-gemeente` practice_prompt:**
```
You are a Dutch gemeente officer. The user comes in to register a new address (BRP-inschrijving). Use formal `u` register throughout. Ask for their BSN, passport, and proof of address. Correct gently if the user slips into informal `je`. If the user makes a grammar mistake at A2-B1 level (e.g. wrong word order, missing article), point it out kindly. Open with: "Goedemorgen, waar kan ik u mee helpen?"
```

The existing tutor at `/practice/<id>` already handles register correction via the `system-prompt.ts` injection — no changes needed there. Just author the prompts well.

## 8. Out of scope

- **Exam tactics / meta-strategy lessons** — separate spec if desired ("how to skim Lezen", "B1 email template", "KNM elimination strategies"). Not part of this batch.
- **Re-recording audio** — Browser TTS handles all of these via `lib/speech.ts`.
- **More than 6 lessons** — later content cycle.
- **Renaming or removing existing 5 casual Dutch lessons** — they stay as A1 vocabulary content.
- **A new route like `/dutch/exam-lessons/[id]`** — re-use existing `/lessons/[id]`. Saves a routing layer.
- **Mock-exam mode that combines lessons** — Phase 6 (later spec).
- **Inline TTS controls inside the lesson view** — already works for all Dutch lessons via existing infrastructure.

## 9. Validation

After this ships:
- All existing tests pass (`npx vitest run`).
- `npx tsc --noEmit` clean — `level` and `exam_targeted` fields are optional so backwards-compat.
- `node scripts/lint-design.mjs` clean.
- Dutch home renders a new "Exam scenarios" section with 6 cards, each labelled with its A2/B1 tier, above the existing "Lessons & Grammar" section.
- Tap any new card → existing `/lessons/<id>` view renders the lesson normally (phrases / grammar / culture / skill-breakdowns).
- Tap "Practice" from any lesson → `/practice/<id>` renders AI chat with the new lesson's practice_prompt; tutor responds in Dutch with B1 register.
- Hindi home unchanged (none of these changes leak into the Hindi branch).

## 10. Risks / open considerations

- **No level-progression gating** — all 6 new lessons appear at once regardless of A1 progress. Intentional (matches current spec — no hard locks). User decides which to study first; tier badges show difficulty.
- **`practice_prompt` quality** — the AI tutor depends on a well-written prompt for register correctness. The authoring agent must write prompts that explicitly say "use `u` formal register" and give a realistic opening line.
- **6 new lessons is a chunk of content authoring** — drafting ~50-60 bilingual phrases + grammar + culture notes per lesson means significant content effort in this single ship cycle. Quality-bar reminder: each phrase must match its tier and be conversationally realistic.

## 11. Open questions

None — all settled in brainstorming.
