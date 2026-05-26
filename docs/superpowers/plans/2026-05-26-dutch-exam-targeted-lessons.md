# Dutch Exam-Targeted Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 exam-targeted Dutch lessons (3 A2 + 3 B1) covering scenarios the Inburgeringsexamen tests directly (gemeente, housing, bank, formal huisarts, job interview, primary school). Surface them on the Dutch home in a new "Exam scenarios" section above the existing casual lessons.

**Architecture:** Extend the existing `Lesson` type with optional `level` + `exam_targeted` fields. Add 6 new JSON files to `content/dutch/lessons/` (same schema as existing 5, just exam-targeted scenarios). Tag existing 5 conversational lessons with `level: "A1"`, `exam_targeted: false`. Register new lessons in `lib/dutch/lessons.ts`. Fix `lib/dutch/level-map.ts` to use the correct `dutch-`-prefixed IDs (existing entries are using bare IDs which never matched). On the Dutch home, filter `getDutchLessons()` by `exam_targeted` to render two sections.

**Tech Stack:** Next.js 16, TypeScript, JSON lesson content, existing `LessonStickerCard` + `/lessons/[id]` + `/practice/[id]` routes (no new routes).

**Spec:** `docs/superpowers/specs/2026-05-26-dutch-exam-targeted-lessons-design.md`
**Repo:** `abhinav-kipper/learn-hindi`, branch: `main` (user authorized).

---

## Critical context for the implementer

**Dutch lesson ID convention:** Existing Dutch JSON files have `"id": "dutch-supermarket"` etc. — the `dutch-` prefix is part of the canonical ID even though file names use `NN-name.json`. Match this for new lessons:
- File: `content/dutch/lessons/06-gemeente.json` → JSON `id: "dutch-gemeente"`
- File: `content/dutch/lessons/07-housing-problem.json` → JSON `id: "dutch-housing-problem"`
- File: `content/dutch/lessons/08-bank.json` → JSON `id: "dutch-bank"`
- File: `content/dutch/lessons/09-huisarts-call.json` → JSON `id: "dutch-huisarts-call"`
- File: `content/dutch/lessons/10-job-interview.json` → JSON `id: "dutch-job-interview"`
- File: `content/dutch/lessons/11-primary-school.json` → JSON `id: "dutch-primary-school"`

**Phrase schema oddity:** Dutch lessons use the same `Phrase` interface as Hindi — `{ hindi, english, context, pronunciation }`. For Dutch, the **`hindi` field actually contains the Dutch text**. Do not rename; the schema is shared. Pronunciation field uses syllable-stress format (e.g. `"WAAR VINT ik de toh-MAA-ten?"`).

**Existing `level-map.ts` bug to fix in Task 3:** It currently maps bare IDs (`'supermarket'`) but the lesson JSON IDs are `dutch-supermarket`. The 3-stage progress bars on the Dutch home consequently always show 0 done. Fix by updating ALL keys to the `dutch-` prefixed form.

**Token reminders** (from prior Dutch work): `COLORS.lav` (not lavender), `COLORS.peach`, `COLORS.butter`, `COLORS.orange`, `COLORS.mint`, `COLORS.ink`. `BORDER.sticker`. White literal pattern: `const W = '#fff' // @design-allow: white literal`.

---

## Task 1: Extend `Lesson` type with `level` + `exam_targeted`

**Files:**
- Modify: `types/lesson.ts`

- [ ] **Step 1: Read current Lesson interface**

```bash
grep -n 'export interface Lesson\|references' types/lesson.ts
```

The interface currently has fields ending with `references?: string[]`.

- [ ] **Step 2: Add the two new optional fields**

In `types/lesson.ts`, locate the `export interface Lesson` block. Add two fields right after `references?: string[]`:

```ts
export interface Lesson {
  id: string
  title: string
  situation: string
  skills: string[]
  phrases: Phrase[]
  grammar_notes: string[]
  culture_notes: string[]
  skill_breakdown: SkillBreakdown[]
  practice_prompt: string
  references?: string[]
  level?: 'A1' | 'A2' | 'B1'
  exam_targeted?: boolean
}
```

Both optional — existing lessons without these fields default to `undefined`, treated as "A1, not exam-targeted" by consumers.

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: clean (no consumers break since fields are optional).

- [ ] **Step 4: Commit**

```bash
git add types/lesson.ts
git commit -m "feat(lesson): add optional level + exam_targeted fields"
```

---

## Task 2: Tag existing 5 Dutch lessons

**Files:**
- Modify: `content/dutch/lessons/01-supermarket.json`
- Modify: `content/dutch/lessons/02-introductions.json`
- Modify: `content/dutch/lessons/03-cafe.json`
- Modify: `content/dutch/lessons/04-doctor.json`
- Modify: `content/dutch/lessons/05-transport.json`

- [ ] **Step 1: Add `level: "A1"` and `exam_targeted: false` to each file**

For each of the 5 existing Dutch lesson JSONs, add these two fields. Place them at the top level of the JSON object, immediately after `references` (or at the end of the file if there's no `references` field — order doesn't matter for JSON but readability matters).

Example diff for `01-supermarket.json`:

```diff
   "practice_prompt": "...",
-  "references": ["..."]
+  "references": ["..."],
+  "level": "A1",
+  "exam_targeted": false
 }
```

If a file doesn't have `references`, just add the two new fields at the end of the JSON object (before the closing brace). Mind the comma.

Apply to all 5 files.

- [ ] **Step 2: Validate JSON parses + fields present**

```bash
for f in content/dutch/lessons/0{1,2,3,4,5}-*.json; do
  node -e "const d = JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('$f:', d.id, 'level=' + d.level, 'exam=' + d.exam_targeted);"
done
```

Expected output:
```
content/dutch/lessons/01-supermarket.json: dutch-supermarket level=A1 exam=false
content/dutch/lessons/02-introductions.json: dutch-introductions level=A1 exam=false
content/dutch/lessons/03-cafe.json: dutch-cafe level=A1 exam=false
content/dutch/lessons/04-doctor.json: dutch-doctor level=A1 exam=false
content/dutch/lessons/05-transport.json: dutch-transport level=A1 exam=false
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
```

All clean.

- [ ] **Step 4: Commit**

```bash
git add content/dutch/lessons/01-supermarket.json content/dutch/lessons/02-introductions.json content/dutch/lessons/03-cafe.json content/dutch/lessons/04-doctor.json content/dutch/lessons/05-transport.json
git commit -m "content(dutch): tag existing 5 lessons as A1 + exam_targeted=false"
```

---

## Task 3: Fix `lib/dutch/level-map.ts` to use `dutch-` prefixed IDs

**Files:**
- Modify: `lib/dutch/level-map.ts`
- Modify: `lib/dutch/level-map.test.ts`

There's a pre-existing bug: keys are bare names but lesson IDs are `dutch-`-prefixed.

- [ ] **Step 1: Update the test for the corrected keys + new lessons**

In `lib/dutch/level-map.test.ts`, find the existing tests that check known IDs. Update + extend:

```ts
import { describe, it, expect } from 'vitest'
import { getLevel, getItemsByLevel, ALL_LEVELS } from './level-map'

describe('dutch level-map', () => {
  it('returns the level for known dutch- prefixed lesson IDs', () => {
    expect(getLevel('dutch-supermarket')).toBe('A1')
    expect(getLevel('dutch-introductions')).toBe('A1')
    expect(getLevel('dutch-doctor')).toBe('A1')
  })

  it('returns the level for the new exam-targeted lessons', () => {
    expect(getLevel('dutch-gemeente')).toBe('A2')
    expect(getLevel('dutch-housing-problem')).toBe('A2')
    expect(getLevel('dutch-bank')).toBe('A2')
    expect(getLevel('dutch-huisarts-call')).toBe('B1')
    expect(getLevel('dutch-job-interview')).toBe('B1')
    expect(getLevel('dutch-primary-school')).toBe('B1')
  })

  it('returns the level for known foundation IDs', () => {
    expect(getLevel('numbers')).toBe('A1')
    expect(getLevel('past-tense')).toBe('A2')
  })

  it('returns "A1" as safe default for unknown ids', () => {
    expect(getLevel('nonexistent-thing')).toBe('A1')
  })

  it('getItemsByLevel groups all known items by level', () => {
    const a1 = getItemsByLevel('A1')
    const a2 = getItemsByLevel('A2')
    const b1 = getItemsByLevel('B1')
    expect(a1.length).toBeGreaterThan(0)
    expect(a2.length).toBeGreaterThan(0)
    expect(b1.length).toBe(3)  // exactly 3 B1 lessons
    expect(a1).toContain('dutch-supermarket')
    expect(b1).toContain('dutch-huisarts-call')
  })

  it('ALL_LEVELS is the canonical [A1, A2, B1] order', () => {
    expect(ALL_LEVELS).toEqual(['A1', 'A2', 'B1'])
  })
})
```

Run tests:
```bash
npx vitest run lib/dutch/level-map.test.ts
```

Expected: tests fail because the existing keys are bare names (`'supermarket'`, not `'dutch-supermarket'`).

- [ ] **Step 2: Fix `lib/dutch/level-map.ts`**

Replace the existing `LEVEL_MAP` with:

```ts
export type Level = 'A1' | 'A2' | 'B1'

export const ALL_LEVELS: Level[] = ['A1', 'A2', 'B1']

const LEVEL_MAP: Record<string, Level> = {
  // Existing Dutch conversational lessons (ID = JSON `id` field, dutch- prefixed)
  'dutch-supermarket':    'A1',
  'dutch-introductions':  'A1',
  'dutch-cafe':           'A1',
  'dutch-doctor':         'A1',
  'dutch-transport':      'A1',

  // New exam-targeted lessons (A2)
  'dutch-gemeente':         'A2',
  'dutch-housing-problem':  'A2',
  'dutch-bank':             'A2',

  // New exam-targeted lessons (B1)
  'dutch-huisarts-call':   'B1',
  'dutch-job-interview':   'B1',
  'dutch-primary-school':  'B1',

  // Foundations (IDs here are bare — foundation JSONs use raw IDs)
  'numbers':        'A1',
  'pronunciation':  'A1',
  'present-tense':  'A1',
  'de-het':         'A1',
  'word-order':     'A2',
  'past-tense':     'A2',
  'modals':         'A2',
}

export function getLevel(id: string): Level {
  return LEVEL_MAP[id] ?? 'A1'
}

export function getItemsByLevel(level: Level): string[] {
  return Object.entries(LEVEL_MAP)
    .filter(([, lvl]) => lvl === level)
    .map(([id]) => id)
}
```

- [ ] **Step 3: Tests pass + tsc clean**

```bash
npx vitest run lib/dutch/level-map.test.ts
npx tsc --noEmit
```

All green.

- [ ] **Step 4: Commit**

```bash
git add lib/dutch/level-map.ts lib/dutch/level-map.test.ts
git commit -m "fix(dutch): level-map uses dutch- prefixed IDs; add 6 new exam-targeted entries"
```

---

## Task 4: Author 6 new Lesson JSONs

**Files:**
- Create: `content/dutch/lessons/06-gemeente.json`
- Create: `content/dutch/lessons/07-housing-problem.json`
- Create: `content/dutch/lessons/08-bank.json`
- Create: `content/dutch/lessons/09-huisarts-call.json`
- Create: `content/dutch/lessons/10-job-interview.json`
- Create: `content/dutch/lessons/11-primary-school.json`

This is the heaviest content task. 6 full bilingual lessons, each with 8-10 phrases + grammar_notes (3-5) + culture_notes (2-4) + skill_breakdown (2-3 entries with 3-5 examples each) + practice_prompt + references + level + exam_targeted.

### Quality bar (fully drafted exemplar)

Use this as the quality bar for `06-gemeente.json`. Write the file verbatim with this content:

```json
{
  "id": "dutch-gemeente",
  "title": "At the Gemeente",
  "situation": "You've recently moved to a new city in the Netherlands and need to register your address (BRP-inschrijving) at the gemeente. You arrive at the loket with your paspoort, huurcontract, and a printout of your appointment confirmation.",
  "skills": ["formal 'u' register", "scheduling and rescheduling appointments", "official-document vocabulary", "explaining your reason for visiting"],
  "phrases": [
    { "hindi": "Goedemorgen, ik heb een afspraak om half tien.", "english": "Good morning, I have an appointment at half past nine.", "context": "Standard opening at any gemeente loket. 'half tien' = 9:30 (Dutch time is one step backwards: half nine = halfway TO ten). Always state your appointment time so the officer can find your slot.", "pronunciation": "HOO-de-MOR-en, ik hep uhn AF-spraak om HALF teen" },
    { "hindi": "Ik kom mij inschrijven op een nieuw adres.", "english": "I'm here to register at a new address.", "context": "Most common reason newcomers visit the gemeente. 'inschrijven' = to register (yourself, reflexive: 'mij inschrijven'). The BRP (Basisregistratie Personen) is where your official address lives.", "pronunciation": "ik kom may IN-skray-ven op uhn NYOOW a-DRES" },
    { "hindi": "Hier zijn mijn paspoort en mijn huurcontract.", "english": "Here are my passport and my rental contract.", "context": "You'll need both. The gemeente wants proof of identity AND proof you actually live at the address. 'huurcontract' = rental contract. If you own, bring 'koopakte'.", "pronunciation": "heer zayn mayn PAS-poort en mayn HEUR-kon-trakt" },
    { "hindi": "Kunt u mij vertellen wat ik nog meer nodig heb?", "english": "Could you tell me what else I need?", "context": "Polite way to ask about additional documents. 'wat ik nog meer nodig heb' = literally 'what I still more need have' — Dutch word order in subordinate clauses puts the verb at the end. Useful B1 grammar.", "pronunciation": "KUNT u may VER-tel-len wat ik noch meer NO-dich hep" },
    { "hindi": "Mijn BSN heb ik nog niet gekregen — kan ik die hier aanvragen?", "english": "I haven't received my BSN yet — can I apply for one here?", "context": "Common situation. BSN (burgerservicenummer) is issued AFTER inschrijving for non-EU residents. The gemeente issues it on the spot once you're registered. 'aanvragen' = to apply for.", "pronunciation": "mayn bay-es-EN hep ik noch neet che-KRAY-chen — kan ik dee heer AAN-vraa-chen" },
    { "hindi": "Hoeveel weken duurt het voordat ik mijn pasje krijg?", "english": "How many weeks until I receive my card?", "context": "Many gemeente services issue cards by post: BSN-brief, DigiD-activatiecode, rijbewijs. 'voordat' = before/until. Useful to know processing time so you can plan.", "pronunciation": "HOO-feel WAY-ken DEURT het VOOR-dat ik mayn PASH-ye KRAYCH" },
    { "hindi": "Sorry, ik begrijp u niet helemaal. Kunt u dat herhalen?", "english": "Sorry, I don't quite understand. Could you repeat that?", "context": "Essential phrase for any formal Dutch interaction. 'Ik begrijp u niet helemaal' = I don't fully understand you. 'herhalen' = to repeat. Never pretend to understand — gemeente officers will rephrase happily.", "pronunciation": "SOR-ry, ik be-CHRAYP u neet HAY-le-maal. KUNT u dat her-HAA-len" },
    { "hindi": "Wat kost het om mijn adres door te geven?", "english": "What does it cost to update my address?", "context": "Address changes are typically free at the gemeente; some other services have fees. 'doorgeven' = to pass on / forward. Asking the price up front is normal.", "pronunciation": "wat KOST het om mayn a-DRES DOOR te CHAY-ven" },
    { "hindi": "Ik wil mijn afspraak verzetten naar volgende week.", "english": "I'd like to reschedule my appointment to next week.", "context": "'verzetten' = to move/reschedule. You can do this at the desk, by phone, or online. 'volgende week' = next week. The gemeente is flexible if you give advance notice.", "pronunciation": "ik wil mayn AF-spraak ver-ZET-ten naar VOL-chen-de WAYK" },
    { "hindi": "Bedankt voor uw hulp. Een fijne dag verder.", "english": "Thanks for your help. Have a nice rest of the day.", "context": "Standard closing. 'fijne dag verder' = nice rest of your day — the universal Dutch sign-off in any service interaction. Officer typically replies 'u ook' (you too).", "pronunciation": "be-DANKT voor uw HULP. uhn FAY-ne DACH VER-der" }
  ],
  "grammar_notes": [
    "Formal 'u' register is mandatory in all gemeente interactions. 'Kunt u...?' (could you), 'Heeft u...?' (do you have), 'Wilt u...?' (do you want)",
    "Reflexive verbs for self-actions: 'mij inschrijven' (register myself), 'mij aanmelden' (sign myself up). Reflexive pronoun matches subject — 'mij' / 'zich' / 'u zich'",
    "Subordinate-clause word order: in clauses starting with 'dat', 'wat', 'als', 'omdat', the verb moves to the END. 'wat ik nog meer nodig heb' (lit: what I still more need have)",
    "Modal `kunnen` for polite requests: 'Kunt u dat herhalen?' is more polite than 'Herhaal alstublieft' (which is an imperative)",
    "Time-telling oddity: Dutch counts half hours backwards. 'half tien' = 9:30, 'half elf' = 10:30, etc. Always one hour earlier than English instinct"
  ],
  "culture_notes": [
    "Almost all gemeente services require an online appointment booked in advance. Walking in without one usually means being sent away. Use the gemeente website (e.g. amsterdam.nl) to book",
    "Bring originals AND copies of your documents. Some loketten will keep a copy; others just check. Either way, having copies saves trips",
    "Dutch officials are direct and efficient — small talk is brief. Get to the point quickly with 'Ik kom voor...'. They appreciate clarity, not chatty preamble",
    "If your Dutch isn't strong yet, most gemeente officers will switch to English when asked politely. But starting in Dutch wins goodwill"
  ],
  "skill_breakdown": [
    {
      "skill": "formal 'u' register",
      "explanation": "All gemeente interactions use 'u'. The verbs match 'u' (kunt, heeft, wilt — same as 'hij/zij' form). Mixing in 'jij/je' here sounds disrespectful or naive.",
      "more_examples": [
        { "hindi": "Kunt u mij helpen?", "english": "Could you help me?" },
        { "hindi": "Heeft u mijn paspoort gezien?", "english": "Have you seen my passport?" },
        { "hindi": "Wilt u dit formulier invullen?", "english": "Would you fill out this form?" },
        { "hindi": "Mag ik even uw legitimatiebewijs zien?", "english": "May I see your ID for a moment?" }
      ]
    },
    {
      "skill": "scheduling and rescheduling",
      "explanation": "Use 'afspraak maken' (make an appointment), 'verzetten' (reschedule), 'afzeggen' (cancel). The gemeente prefers online booking but will accept rescheduling at the desk.",
      "more_examples": [
        { "hindi": "Ik wil een afspraak maken voor volgende week.", "english": "I'd like to make an appointment for next week." },
        { "hindi": "Kan ik mijn afspraak verzetten?", "english": "Can I reschedule my appointment?" },
        { "hindi": "Ik moet helaas afzeggen.", "english": "Unfortunately I have to cancel." }
      ]
    },
    {
      "skill": "official-document vocabulary",
      "explanation": "Key terms you'll hear repeatedly: paspoort, identiteitskaart (ID), rijbewijs (driver's licence), huurcontract, BSN, DigiD, BRP-uittreksel, verklaring.",
      "more_examples": [
        { "hindi": "Heeft u een geldig legitimatiebewijs bij u?", "english": "Do you have a valid ID with you?" },
        { "hindi": "Ik heb een BRP-uittreksel nodig voor mijn werk.", "english": "I need a BRP-extract for my work." },
        { "hindi": "Kunt u een verklaring afgeven dat ik hier wonen?", "english": "Can you issue a statement that I live here?" }
      ]
    }
  ],
  "practice_prompt": "You are a Dutch gemeente officer at the loket. The user has just walked in for an appointment. Use formal 'u' register throughout. Ask why they're there, then ask for the documents they should have brought (paspoort, huurcontract). Correct gently if the user slips into informal 'je'. If the user makes a B1-level grammar mistake (wrong word order in a subordinate clause, missing article, wrong verb form), point it out kindly with the correction. Open with: 'Goedemorgen, waar kan ik u mee helpen?'",
  "references": ["rijksoverheid.nl style", "Naar Nederland Ch. 3"],
  "level": "A2",
  "exam_targeted": true
}
```

### Authoring guidance for the other 5 lessons

Apply the same shape (8-10 phrases + grammar_notes + culture_notes + skill_breakdown + practice_prompt + references + level + exam_targeted). Use the same field ordering. Each lesson must include `"level"` and `"exam_targeted": true` at the bottom of the JSON object.

#### `07-housing-problem.json` (A2)
- **ID:** `dutch-housing-problem`
- **Title:** "A Problem with the House"
- **Situation:** "The heating in your apartment stopped working two days ago. It's November and freezing. You call your landlord (or housing corporation) to report the problem and ask for urgent repair."
- **Skills:** "describing a problem", "expressing urgency", "asking for action", "scheduling a visit"
- **Phrases (8-10):** Cover — opening "Goedendag, u spreekt met..." + introducing self, explaining the problem ("De verwarming doet het niet meer"), urgency ("Het is dringend", "We hebben kleine kinderen"), asking what to do ("Kunt u iemand sturen?"), scheduling visit ("Wanneer komt de monteur?"), confirming details ("Mijn adres is..."), thanking, asking for confirmation in writing ("Kunt u dit per mail bevestigen?").
- **Grammar focus:** present perfect for problems ("Het is kapot gegaan" — it's broken / has broken down), urgency softeners (zo snel mogelijk, alstublieft), modal `kunnen` for requests, possessive `mijn/uw`
- **Culture notes:** Tenants' rights in NL, when to escalate to Huurcommissie, response-time expectations (urgent = same day; non-urgent = within a week), keeping all communication in writing
- **Skill breakdowns:** "describing a problem" / "expressing urgency" / "asking for action and follow-up"
- **Practice prompt:** "You are a Dutch housing-corporation employee. The user calls to report a heating problem. Use formal 'u' register. Ask diagnostic questions (when did it start, is it cold air or no air at all, etc.). Schedule a monteur visit. Open with: 'Met de servicebalie van de woningcorporatie, met wie spreek ik?'"
- **References:** `["rijksoverheid.nl style", "Naar Nederland Ch. 4"]`

#### `08-bank.json` (A2)
- **ID:** `dutch-bank`
- **Title:** "At the Bank"
- **Situation:** "You walk into an ING branch. You want to open a betaalrekening (current account), get a pinpas, and ask about a charge on your statement you don't recognize."
- **Skills:** "opening an account", "asking about charges", "understanding payslip and statements", "polite complaining"
- **Phrases (8-10):** Cover — "Ik wil graag een betaalrekening openen", proof needed ("Ik heb mijn paspoort en mijn BSN"), pinpas wait time, ING-app setup, "Ik zie hier een afschrijving die ik niet herken", asking for explanation ("Kunt u mij dit uitleggen?"), filing a complaint ("Ik wil hier bezwaar tegen maken"), asking to block card if needed ("Mijn pinpas is kwijt — kunt u die blokkeren?"), closing
- **Grammar focus:** present + simple past for transactions ("Vorige week kreeg ik..."), modal `kunnen/zou` for polite requests, separable verbs (afschrijven, inschrijven, openen + maken)
- **Culture notes:** pinnen is universal in NL (no contant), automatic incasso for utilities, what a loonstrook is, dispute rights for unrecognized charges
- **Skill breakdowns:** "opening an account vocabulary" / "describing money problems" / "polite complaint phrasing"
- **Practice prompt:** "You are a Dutch bank teller at ING. The user wants to open an account and ask about an unrecognized charge. Use formal 'u'. Ask for paspoort + BSN. Explain the betaalrekening + pinpas process. Open with: 'Goedemiddag, waarmee kan ik u helpen?'"
- **References:** `["rijksoverheid.nl style", "Naar Nederland Ch. 5"]`

#### `09-huisarts-call.json` (B1)
- **ID:** `dutch-huisarts-call`
- **Title:** "Calling the Huisarts"
- **Situation:** "You've been having persistent migraines for three weeks. You call your huisarts (general practitioner) to schedule an appointment and ask about a possible referral to a neurologist."
- **Skills:** "formal phone register", "describing chronic conditions", "asking about specialist referral (verwijzing)", "understanding triage questions"
- **Phrases (8-10):** Cover — phone opening ("U spreekt met..."), purpose ("Ik wil graag een afspraak maken"), chronic symptom description ("Ik heb al drie weken last van migraine"), severity ("Het wordt steeds erger"), prior remedies ("Ik heb paracetamol genomen, maar dat helpt niet"), requesting referral ("Zou ik een verwijzing kunnen krijgen naar een neuroloog?"), discussing appointment times, what to bring, sign-off
- **Grammar focus:** subordinate clauses with omdat/als ("omdat het niet beter wordt"), modal `moeten/zou` ("zou ik kunnen..."), perfect tense for ongoing duration ("Ik heb al drie weken last van..."), indirect speech basics ("De huisarts zei dat...")
- **Culture notes:** huisarts as gateway to specialist care (no walk-ins to neuroloog directly), what waarneemarts is (after-hours), how the recept (prescription) system works, when to call NHG-Huisartsenpost
- **Skill breakdowns:** "formal phone-register opening and closing" / "describing chronic symptoms with duration" / "asking for and understanding referrals"
- **Practice prompt:** "You are a Dutch huisarts assistent (medical receptionist) handling phone triage. The user calls about chronic migraines. Use formal 'u' register. Ask triage questions: duration, severity, what they've tried, other symptoms. Decide whether to schedule appointment this week or refer to a specialist directly. Open with: 'Huisartsenpraktijk De Vries, u spreekt met Marja.'"
- **References:** `["Naar Nederland Ch. 7", "Snell & Weightman-style B1"]`

#### `10-job-interview.json` (B1)
- **ID:** `dutch-job-interview`
- **Title:** "Job Interview"
- **Situation:** "You're interviewing for an office position in a Dutch company. The interviewer asks the standard questions: tell me about yourself, why this company, what's your experience, what are your strengths/weaknesses, what salary expectations."
- **Skills:** "introducing yourself professionally", "describing past experience (perfect tense)", "explaining motivation (omdat / want)", "asking thoughtful questions"
- **Phrases (8-10):** Cover — formal opening ("Aangenaam, ik ben..."), self-intro ("Ik heb vijf jaar gewerkt als..."), motivation ("Ik solliciteer omdat..."), strengths ("Ik werk graag in een team"), weaknesses ("Soms wil ik te perfectionistisch zijn"), salary ("Wat zijn de salarisverwachtingen voor deze functie?"), asking questions back ("Hoe ziet een typische werkdag eruit?"), closing ("Bedankt voor uw tijd")
- **Grammar focus:** perfect tense for past experience ("Ik heb gewerkt", "Ik heb geleerd"), modal `willen/zou willen` ("Ik zou graag..."), conditional ("Als ik word aangenomen..."), comparatives ("Ik werk beter in...")
- **Culture notes:** Dutch directness in interviews (it's OK to say "I don't know"), no over-praise, punctuality is critical (be 10 min early), salary discussion typically happens in second interview, dress code can vary widely
- **Skill breakdowns:** "professional self-introduction" / "describing experience and accomplishments" / "asking thoughtful questions"
- **Practice prompt:** "You are a Dutch HR manager interviewing the user for an office role. Use formal 'u' register but warmer than gemeente. Ask the standard interview questions in order: self-intro, motivation, experience, strengths/weaknesses, salary expectations. Open with: 'Welkom, fijn dat u kon komen. Kunt u uzelf even kort voorstellen?'"
- **References:** `["Naar Nederland Ch. 5", "Dutch business culture norms"]`

#### `11-primary-school.json` (B1)
- **ID:** `dutch-primary-school`
- **Title:** "At Primary School"
- **Situation:** "You arrive for an oudergesprek (parent-teacher meeting) about your 8-year-old at a Dutch basisschool. The juf (teacher) discusses your child's progress in reading, math, and social behaviour. You raise a concern about bullying."
- **Skills:** "introducing yourself as parent", "discussing progress (comparatives)", "raising sensitive concerns", "asking about homework and support"
- **Phrases (8-10):** Cover — opening "Goedemiddag, ik ben de moeder/vader van...", asking general progress ("Hoe gaat het met hem op school?"), receiving good news ("Hij is veel beter geworden in rekenen"), areas of concern ("Hij vindt taal nog moeilijk"), raising bullying concern ("Hij heeft me verteld dat er gepest wordt"), asking for school's response ("Wat doet de school hieraan?"), discussing homework expectations ("Hoeveel huiswerk krijgt hij?"), closing
- **Grammar focus:** comparatives + superlatives ("beter", "slechter", "het beste"), indirect questions ("Ik vroeg me af of..."), reflexive verbs ("zich gedragen" = to behave), perfect tense for child's actions ("Hij heeft me verteld...")
- **Culture notes:** Dutch schools are direct but constructive about issues, oudergesprek frequency (2-3x/year typically), Cito-toets pressure in group 8, rapport (report card) reading conventions, role of the schoolmaatschappelijk werker (school social worker)
- **Skill breakdowns:** "parent-teacher meeting opening" / "discussing progress with comparatives" / "raising and following up on concerns"
- **Practice prompt:** "You are a Dutch basisschool juf/meester meeting a parent for an oudergesprek about their 8-year-old child. Use formal 'u' register. Discuss reading + math + social behaviour. Be honest about strengths and areas to improve. If the parent raises a concern (bullying, sluggish progress), take it seriously and outline the school's response. Open with: 'Welkom, fijn dat u er bent. Laten we het over uw zoon hebben.'"
- **References:** `["Naar Nederland Ch. 6", "Dutch school system norms"]`

### Step 1: Author all 6 lessons

Write each JSON file at the specified path. Use the verbatim exemplar for `06-gemeente.json` and apply the same shape with the topic guidance above for the other 5.

### Step 2: Validate

```bash
for f in content/dutch/lessons/{06,07,08,09,10,11}-*.json; do
  node -e "
  const d = JSON.parse(require('fs').readFileSync('$f','utf8'));
  console.log('$f:', d.id, 'level=' + d.level, 'exam=' + d.exam_targeted, 'phrases=' + d.phrases.length, 'breakdowns=' + d.skill_breakdown.length);
  "
done
```

Expected (each line):
```
content/dutch/lessons/06-gemeente.json: dutch-gemeente level=A2 exam=true phrases=10 breakdowns=3
content/dutch/lessons/07-housing-problem.json: dutch-housing-problem level=A2 exam=true phrases=8-10 breakdowns=2-3
...
content/dutch/lessons/11-primary-school.json: dutch-primary-school level=B1 exam=true phrases=8-10 breakdowns=2-3
```

Each file must have 8-10 phrases and 2-3 skill_breakdowns. Adjust if any are off.

### Step 3: Verify

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

### Step 4: Commit

```bash
git add content/dutch/lessons/06-gemeente.json content/dutch/lessons/07-housing-problem.json content/dutch/lessons/08-bank.json content/dutch/lessons/09-huisarts-call.json content/dutch/lessons/10-job-interview.json content/dutch/lessons/11-primary-school.json
git commit -m "content(dutch): add 6 exam-targeted lessons (gemeente, housing, bank, huisarts, interview, school)"
```

---

## Task 5: Register the 6 new lessons in `lib/dutch/lessons.ts`

**Files:**
- Modify: `lib/dutch/lessons.ts`

- [ ] **Step 1: Add imports**

Open `lib/dutch/lessons.ts`. After the existing `import transport ...` line, add 6 new imports:

```ts
import gemeente from '@/content/dutch/lessons/06-gemeente.json'
import housingProblem from '@/content/dutch/lessons/07-housing-problem.json'
import bank from '@/content/dutch/lessons/08-bank.json'
import huisartsCall from '@/content/dutch/lessons/09-huisarts-call.json'
import jobInterview from '@/content/dutch/lessons/10-job-interview.json'
import primarySchool from '@/content/dutch/lessons/11-primary-school.json'
```

- [ ] **Step 2: Add to the `lessons` array**

Update:

```ts
const lessons: Lesson[] = [
  supermarket,
  introductions,
  cafe,
  doctor,
  transport,
  gemeente,
  housingProblem,
  bank,
  huisartsCall,
  jobInterview,
  primarySchool,
] as Lesson[]
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

If tsc complains about a Lesson-shape mismatch, the JSON has a structural issue — go back and fix the JSON.

- [ ] **Step 4: Commit**

```bash
git add lib/dutch/lessons.ts
git commit -m "feat(dutch): register 6 exam-targeted lessons"
```

---

## Task 6: Split Dutch home into "Exam scenarios" + "Lessons & Grammar"

**Files:**
- Modify: `app/page.tsx`

This task adds a new section between the existing "Exam skills" row and the "Lessons & Grammar" list. Filter `getDutchLessons()` by `exam_targeted` to split into the two sections.

- [ ] **Step 1: Find the right insertion point**

```bash
grep -n "Lessons & Grammar\|LESSON STICKER LIST\|Lessen & Grammatica\|exam-prep section\|exam_targeted\|filter" app/page.tsx | head -20
```

Look for:
- The end of the Dutch exam-prep section (currently 5 skill cards + a label like "Lessons & Grammar")
- Where the main lesson list renders (currently iterates over `currentLessons` or `lessons`)

- [ ] **Step 2: Compute the two filtered arrays**

Near the top of the `Home()` component, after the existing `lessons` declaration, add:

```ts
const dutchExamLessons = useMemo(
  () => (language === 'dutch' ? lessons.filter((l) => (l as any).exam_targeted === true) : []),
  [language, lessons],
)
const dutchCasualLessons = useMemo(
  () => (language === 'dutch' ? lessons.filter((l) => (l as any).exam_targeted !== true) : lessons),
  [language, lessons],
)
```

(The `as any` casts to access the new optional `exam_targeted` field — alternatively, import the proper `Lesson` type and use it directly. If the existing `lessons` variable is already typed `Lesson[]` with the updated interface from Task 1, you can drop the `as any`.)

- [ ] **Step 3: Insert the "Exam scenarios" section in the JSX**

Find the JSX block where the lesson list renders. It's currently something like:

```tsx
{language === 'dutch' && (
  <>
    {/* Goal banner */}
    {/* Your path */}
    {/* 5 skill cards */}
    {/* Section label: "Lessons & Grammar / Lessen & Grammatica" */}
  </>
)}
{/* LESSON STICKER LIST that iterates over currentLessons */}
```

Before the "Lessons & Grammar" section label, insert a new "Exam scenarios" section:

```tsx
{language === 'dutch' && dutchExamLessons.length > 0 && (
  <div style={{ padding: '20px 20px 8px', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 2 }}>
    <div style={{
      fontFamily: FONTS.display, fontWeight: 800, fontSize: 14, color: COLORS.ink,
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
    }}>
      Exam scenarios <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: 11, marginLeft: 6, textTransform: 'none' }}>A2 / B1</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {dutchExamLessons.map((lesson, index) => {
        const level = (lesson as any).level ?? 'A2'
        return (
          <div key={lesson.id} style={{ position: 'relative' }}>
            <LessonStickerCard
              lesson={lesson}
              index={index}
              routeBase="lessons"
            />
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: level === 'B1' ? COLORS.peach : COLORS.butter,
              border: BORDER.sticker, padding: '2px 10px', borderRadius: 999,
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 11, color: COLORS.ink,
              zIndex: 3,
            }}>
              {level}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)}
```

This renders the 6 exam-targeted lessons with an A2/B1 badge in the top-right corner of each card.

- [ ] **Step 4: Update the existing lesson list to use `dutchCasualLessons` for Dutch**

Find where the main lesson list iterates (currently over `currentLessons` or `lessons`). For Dutch, swap the source to `dutchCasualLessons`. The existing structure probably looks like:

```tsx
const currentLessons = activeTab === 'situations' ? lessons : foundations
```

Update to:

```tsx
const currentLessons = activeTab === 'situations'
  ? (language === 'dutch' ? dutchCasualLessons : lessons)
  : foundations
```

This way, the Situations tab on Dutch home shows only the 5 casual lessons (not the 6 exam-targeted ones — those are rendered separately above).

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npx vitest run
node scripts/lint-design.mjs
```

If `useMemo` isn't imported in `app/page.tsx`, add it to the React import.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat(dutch): home page splits into Exam scenarios + casual Lessons & Grammar"
```

---

## Task 7: Update CONTENT.md

**Files:**
- Modify: `CONTENT.md`

- [ ] **Step 1: Add a new section under "Dutch — Exam-Prep Track"**

Find the existing Dutch content inventory section. Below the existing Content inventory table, add:

```markdown
### Exam-targeted scenarios (`content/dutch/lessons/06-11`)
| ID | Title | Tier | Topic |
|---|---|---|---|
| `dutch-gemeente` | At the Gemeente | A2 | BRP-inschrijving, formal `u` register, official-document vocabulary |
| `dutch-housing-problem` | A Problem with the House | A2 | Calling landlord, describing problems, urgency softeners |
| `dutch-bank` | At the Bank | A2 | Opening account, complaint about charge, loonstrook |
| `dutch-huisarts-call` | Calling the Huisarts | B1 | Formal phone register, chronic conditions, specialist referral |
| `dutch-job-interview` | Job Interview | B1 | Self-intro, motivation, experience, strengths/weaknesses |
| `dutch-primary-school` | At Primary School | B1 | Parent-teacher meeting, child progress, raising concerns |
```

- [ ] **Step 2: Update the Lezen content inventory note**

The existing "Content inventory" Dutch table has rows for Lezen, KNM, etc. Leave those untouched. Just add the new section above with the 6-row table.

- [ ] **Step 3: Commit**

```bash
git add CONTENT.md
git commit -m "docs(dutch): add Exam-targeted scenarios section to CONTENT.md"
```

---

## Task 8: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
git log --oneline ff8e647..HEAD  # all new commits
```

Expected:
- vitest: 257+ tests pass (existing + any new level-map test changes)
- tsc: clean
- lint-design: clean

- [ ] **Step 2: Smoke test (optional, if dev boots quickly)**

```bash
npm run dev &
sleep 8
# Browser:
# 1. Switch to Dutch.
# 2. Home shows: Goal banner, Your path (now with actual progress %s since level-map is fixed!), Exam skills, NEW Exam scenarios section with 6 cards (A2/B1 badges), then Lessons & Grammar list with only 5 casual lessons + foundations.
# 3. Tap any exam-scenario card → /lessons/<id> renders the full bilingual lesson.
# 4. From any lesson page, hit Practice → /practice/<id> renders chat with the new practice_prompt.
```

Kill dev.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: CI**

Wait for green.

---

## Self-review checklist (for the implementing engineer)

- [ ] `types/lesson.ts` has optional `level` + `exam_targeted` fields
- [ ] 5 existing Dutch lessons have `level: "A1"`, `exam_targeted: false`
- [ ] `lib/dutch/level-map.ts` uses `dutch-` prefixed IDs throughout; all 6 new lessons mapped; tests pass
- [ ] 6 new lesson JSONs created — every one has 8-10 phrases + 2-3 skill_breakdowns + level + exam_targeted
- [ ] `lib/dutch/lessons.ts` imports and registers all 6 new lessons
- [ ] Dutch home renders "Exam scenarios" section with A2/B1 badged cards above existing "Lessons & Grammar"
- [ ] Tap any new card → `/lessons/<id>` renders the lesson; tap Practice → tutor responds with B1 register per the practice_prompt
- [ ] `CONTENT.md` has new Exam-targeted scenarios section
- [ ] All tests green; tsc clean; design-lint clean
- [ ] All 7-8 commits pushed
