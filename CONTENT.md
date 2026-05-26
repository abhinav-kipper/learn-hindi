# Content Map — Hindi Learning App

Authoritative map of all learning content so future sessions don't re-read 1600 lines of JSON. Update this file when content changes.

## Inventory

### Situations (`content/lessons/*.json`) — 10 lessons
Conversational Hindi taught through scenarios. Each lesson: 9-10 phrases + grammar notes + culture notes + 2-3 skill breakdowns + AI practice prompt.

| ID | Title | Situation | Skills |
|----|-------|-----------|--------|
| `01-greetings` | Greetings & Fillers | First-time meeting at a house party | interjections/fillers, informal pronouns (tu/tum/aap), casual greetings |
| `02-auto-negotiation` | Arguing with an Auto Driver | Negotiating fare outside a metro | present continuous, imperative, negotiation softeners |
| `03-ordering-food` | Ordering Chai & Street Food | Roadside chai stall | quantities/numbers, `wala` constructions, polite requests |
| `04-expressing-opinions` | Expressing Opinions | Post-Bollywood-movie chat | past tense (tha/thi/the), `lagta hai` pattern, agree/disagree |
| `05-making-plans` | Making Plans with Friends | WhatsApp group weekend plans | future tense (ga/ge/gi), conditional (agar...toh), suggestions |
| `06-giving-directions` | Giving & Asking Directions | Stranger asks for metro | postpositions, location vocab, sequential instructions |
| `07-home-visit` | Visiting Someone's Home | First time at a friend's parents' home in Lucknow | polite imperatives (-iye/-iyega), hospitality phrases, respectful address |
| `08-shopping-clothes` | Shopping for Clothes | Clothing shop with bargaining | sizes & colors, polite imperatives (-iye), haggling softeners, preferences |
| `09-doctor-visit` | At the Doctor | Describing symptoms at a clinic | body parts & pain, describing symptoms, polite requests, asking about restrictions |
| `10-phone-with-parents` | Phone Call with Parents | Weekly Sunday call with mummy & papa | sustained aap register, family terms, future plans, feminine future-tense verbs |

### Foundations (`content/foundations/*.json`) — 9 lessons
Grammar core. Same schema as situations. As of 2026-05-26 all 9 foundations have full skill_breakdowns (was previously a gap for 01-06; backfilled and 2 new foundations — compound-verbs + ne-rule — added).

| ID | Title |
|----|-------|
| `01-numbers` | Numbers & Counting |
| `02-present-tense` | Present Tense |
| `03-past-tense` | Past Tense |
| `04-future-tense` | Future Tense |
| `05-postpositions` | Postpositions |
| `06-pronouns-verbs` | Pronouns & Verb Agreement |
| `07-noun-gender` | Noun Gender |
| `08-compound-verbs` | Compound Verbs (le/de/kar dena) |
| `09-ne-rule` | The 'ne' Rule (Ergative Past) |

### Vocabulary (`content/vocabulary.json`)
6 categories × ~15-20 words = **100 words total**: Everyday Words, Emotions & Feelings, Food & Drinks, People & Relationships, Time & Numbers, Actions.

### Stories (`content/stories/*.json`) — 3 motion-comics
Chai Galli aesthetic illustrated 5-panel stories. Pure consumption (no quiz). Each panel: scene background + character + dialogue + tap-to-reveal English + browser TTS. Hindi-only.

| ID | Title | Tier | Vocab maps to |
|---|---|---|---|
| `chai-stall` | The Chai Stall | A1 | 01-greetings + 03-ordering-food |
| `lost-in-bazaar` | Lost in the Bazaar | A2 | 06-giving-directions |
| `sunday-with-nani` | Sunday with Nani | A2 | 07-home-visit + 10-phone-with-parents |

## Schema (Lesson JSON)

```ts
{
  id: string
  title: string
  situation: string
  skills: string[]
  phrases: { hindi, english, context, pronunciation }[]
  grammar_notes: string[]
  culture_notes: string[]
  skill_breakdown: { skill, explanation, more_examples: { hindi, english }[] }[]
  practice_prompt: string         // sent to Gemini as scenario for chat practice
  references: string[]            // REQUIRED: textbooks/sources consulted when authoring
}
```

## Pedagogical references

When sourcing/authoring lessons we consult (without copying) these renowned references:

- **Snell & Weightman, *Teach Yourself Hindi*** — gold standard for spoken-style pedagogy and grammar sequencing
- **R.S. McGregor, *Outline of Hindi Grammar*** — academic-grade grammar reference
- **Afroz Taj, *A Door Into Hindi* (UNC)** — free university course with hospitality / cultural modules
- **NCERT Hindi textbooks** — Indian school curriculum, free PDFs

The actual phrases/examples in our lessons are written originally in our app's voice — we draw on these for sequencing, grammar accuracy, and pedagogical structure only. Lessons store consulted sources in their `references` array.

## Style Guide

### Register policy

- **Default**: `aap` (respectful). Shopkeepers, auto drivers, strangers, elders, anyone you're not close with.
- **Friendly/peer scenarios**: `tum` (chai with a mate, classmates, weekend plans).
- **Intimate only**: `tu` (sibling teasing, very close friend on WhatsApp, anger). Use sparingly.
- **Teaching exceptions**: `01-greetings` and `06-pronouns-verbs` explicitly teach the 3-way contrast; `tu` phrases in those lessons MUST be tagged "(very informal)" or "(intimate)" in the `english` field.
- The practice tutor (`/practice/<id>`) flags register-mismatches as corrections. Authored content must never model those mismatches.

### Conversational, not bookish

- Use natural fillers and softeners: `arrey`, `accha`, `matlab`, `yaar`, `dekho`, `bas`, `haan`, `na`.
- Use contractions and dropped pronouns where Hindi naturally does.
- Avoid textbook connectives in phrases: `iss prakar`, `isliye`, `parantu`, `kintu`. Those belong in `grammar_notes` only.
- 2-3 Hindi sentences per phrase MAX. Often one is best.

### Romanization rules

- ASCII only. NO Devanagari script in JSON content (the practice tutor enforces this on AI output).
- Single-vowel endings: `karta` not `kartaa`, `karunga` not `karoongaa`.
- `chh` for छ (`chhat` not `cchat`).
- `dh` for ध, `th` for थ.
- `aa` only when ambiguity matters (`haan` vs `han`).

### Pronunciation field

- SYLLABLE-stress format. Hyphens between syllables. CAPS on the stressed syllable.
- Example: `BA-zaar ja-NA hai`, `na-mas-TE AUN-ty ji`.
- Consistent across all lessons (some older lessons use a different style — fix as you encounter them).

### Gender-aware examples

- Where verb endings differ by speaker gender, show both: `main jaa raha hoon / jaa rahi hoon`.
- For single-form examples (when only one gender is shown), use **feminine** (`-i`, `-rahi`, `-gayi`) since the app defaults users to female gender.
- The practice tutor uses the stored user gender to give correct agreement; authored examples must not contradict this.

### Structure & length

- 8-10 phrases per lesson.
- Each phrase has `hindi`, `english`, `context`, `pronunciation`.
- `context`: 1-2 sentences. The conversational beat + social signal.
- `grammar_notes`: 3-5 notes. Focus on the new rule the lesson teaches.
- `culture_notes`: 2-4 notes. Practical social-dynamic tips, not generic facts.
- `skill_breakdown`: 2-3 entries. Each: `skill`, `explanation` (1-2 sentences), `more_examples` (3-5 `{hindi, english}` pairs).
- `practice_prompt`: 1-2 sentences setting the scene for the Gemini tutor.
- `references`: REQUIRED, at least one entry like `"Snell & Weightman Ch. 11"` or `"Afroz Taj Lesson 9"`.

## Canonical Sources

All new content must cite at least one of these. McGregor is a grammar reference only — don't lift phrases from it.

### Snell & Weightman — Teach Yourself Hindi
22 chapters, grammar-progressive with dialogues. Free PDF on archive.org. Use for grammar accuracy, scenario inspiration, idiomatic patterns. Dialogues lean slightly formal — soften them for conversational tone.

### Afroz Taj — A Door Into Hindi
24 video lessons with transcripts at `taj.oasis.unc.edu` (UNC Chapel Hill, free). Use for conversational tone, North Indian register, scenario authenticity. Phrases are usually drop-in usable.

### McGregor — Outline of Hindi Grammar
Oxford University Press. Reference ONLY for grammar disambiguation when Snell & Weightman is unclear. Never lift phrases — McGregor is academic-formal.

## Authoring Workflow

Step-by-step for adding a new lesson:

1. Pick a topic from `content/lesson-queue.json` (or add one with `id`, `title`, `scenario`, `skills`, `level`, `references`).
2. Pick the source chapter(s) — at least one from Snell & Weightman or Afroz Taj.
3. Draft the lesson JSON:
   - **AI-assisted**: `GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-lesson.mjs --topic=<id>` — generates a draft using the updated `STYLE_GUIDE`.
   - **Hand-authored**: write `content/lessons/NN-<id>.json` following the schema; use the next available `NN`.
4. Review against the style guide above (register, conversational, pronunciation, gender, references[]).
5. Register in `lib/lessons.ts`:
   - Add the import at the top.
   - Add the named export to the `lessons` array (in order).
6. Update the Inventory table in this file (`CONTENT.md`).
7. Pop the topic from `content/lesson-queue.json`.
8. Validate locally:
   ```bash
   npx vitest run
   npx tsc --noEmit
   node scripts/lint-design.mjs
   ```
9. Commit: `content(hindi): add <topic> lesson — <source citation>`

## Known Issues (as of 2026-05-26)

### Bugs (fixed)
- ~~Typo `chahat pe` → `chhat pe` in `05-postpositions.json`~~ ✓
- ~~Wrong "you" register `tere paas` → `tumhare paas` in `01-greetings.json` phrase 7~~ ✓
- ~~Hindi situation lessons mixed `tum`-default with `aap`-default registers~~ — new lessons (08-10) all use aap-default per the practice tutor's policy; generator's STYLE_GUIDE flipped to enforce.
- ~~`lib/dutch/level-map.ts` used bare IDs that never matched lesson JSONs~~ — fixed to use `dutch-` prefixed keys; 3-stage progress bars on Dutch home now compute correctly.

### Romanization & style inconsistency (not yet addressed)
- Mixed stress system in older Hindi lesson JSONs: sometimes CAPS-on-stressed-syllable (`BHAI-ya`), sometimes just hyphens for syllables (`KIT-ne`). New lessons (08-10 + foundations 08-09) use SYLLABLE-stress consistently. Older lessons need a pass.
- `cc` vs `chh` convention not documented in-content (style guide above defines it).
- Pronunciation field formatting varies file to file.

### Structural gaps
- ~~**Foundations have empty `skill_breakdown: []`**~~ — RESOLVED 2026-05-26. All 9 Hindi foundations now have 3 skill_breakdowns each.
- ~~**No level markers** — no A1/A2/B1 progression~~ — RESOLVED for Dutch (Lesson type has `level?` field; all Dutch lessons tagged via JSON + `lib/dutch/level-map.ts`). Hindi has no CEFR system intentionally.
- **No audio assets** — TTS via `lib/speech.ts` works, but no native recordings. Most relevant for Dutch Phase 3 Luisteren when it ships.
- **Scope is still growing** — Hindi: 10 situations + 9 foundations + 100 vocab. Dutch: 11 lessons + 7 foundations + 100 KNM + 10 Lezen texts. The grow-vs-polish balance is currently leaning grow.

## Loading

Hindi:
- `lib/lessons.ts` — imports all 10 Hindi situation JSONs into an array
- `lib/foundations.ts` — imports all 9 Hindi foundation JSONs
- `lib/vocabulary.ts` — exports categories from vocabulary.json
- `lib/all-content.ts` — universal lookup `getUniversalLessonById(id)` across both Hindi + Dutch
- `lib/personalization.ts` — `reorderLessonsByReason()` reshuffles Hindi situations based on onboarding (family/bollywood/moving/curious)
- `lib/system-prompt.ts` — `buildSystemPrompt(lesson)` injects lesson into Gemini system prompt for `/practice/[id]`
- `lib/stories.ts` — imports the 3 Hindi story JSONs in `content/stories/`
- `lib/stories-progress.ts` — Hindi-stories-read tracking (`learn-hindi:hindi-stories-read`)

Dutch:
- `lib/dutch/lessons.ts` — imports all 11 Dutch lesson JSONs (5 casual + 6 exam-targeted)
- `lib/dutch/foundations.ts` — imports 7 Dutch grammar foundations
- `lib/dutch/knm.ts` — KNM loader + drill draw + scoring + attempt history (TDD'd, 12 tests)
- `lib/dutch/lezen.ts` — Lezen loader + tier filter + 5-text mock draw + scoring (TDD'd, 12 tests)
- `lib/dutch/exam-target.ts` — A2/B1 preference (default B1)
- `lib/dutch/level-map.ts` — ID → CEFR level lookup for the 3-stage progress bars

## Dutch — Exam-Prep Track (Inburgeringsexamen B1 + KNM)

### Target exam
Inburgeringsexamen B1 + KNM. HSM holders need this (or equivalent) to naturalize for the Dutch passport.

### Strategic framework
A1 (months 1-2) → A2 (months 3-5) → B1 (months 6-9). A2 = optional stop-out (settings toggle in welcome modal).

### UI language
All UI/labels in English. Dutch only for: KNM question text, Chaina voice lines, italic Dutch-skill-name subtitles (Lezen / Luisteren / Schrijven / Spreken) for exposure-learning.

**Bilingual study mode:** KNM study cards now show English under Dutch (drill stays Dutch-only for exam realism). Lezen study mode renders Dutch body + English translation toggle + bilingual MCQs; the timed mock is Dutch-only.

### Content inventory
| Track | Status | Notes |
|---|---|---|
| Lessons (A1-A2) | 5 existing | supermarket, introductions, cafe, doctor, transport |
| Foundations (A1-A2) | 7 existing | numbers, pronunciation, present, de/het, word-order, past, modals |
| KNM | 100 questions, 6 categories | Phase 1 (shipped 2026-05-26) |
| Lezen (Reading) | 10 texts (5 A1 + 4 A2 + 1 B1), 40 MCQs, bilingual study mode | Phase 2 (shipped 2026-05-26) |
| Luisteren (Listening) | not yet | Phase 3 |
| Schrijven (Writing) | not yet | Phase 4 |
| Spreken (Speaking) | not yet | Phase 5 |
| Mock exam | not yet | Phase 6 |

### Exam-targeted scenarios (`content/dutch/lessons/06-11`)
| ID | Title | Tier | Topic |
|---|---|---|---|
| `dutch-gemeente` | At the Gemeente | A2 | BRP-inschrijving, formal `u` register, official-document vocabulary |
| `dutch-housing-problem` | A Problem with the House | A2 | Calling landlord, describing problems, urgency softeners |
| `dutch-bank` | At the Bank | A2 | Opening account, complaint about charge, loonstrook |
| `dutch-huisarts-call` | Calling the Huisarts | B1 | Formal phone register, chronic conditions, specialist referral |
| `dutch-job-interview` | Job Interview | B1 | Self-intro, motivation, experience, strengths/weaknesses |
| `dutch-primary-school` | At Primary School | B1 | Parent-teacher meeting, child progress, raising concerns |

### Canonical sources
- **DUO oefenen.nl** — official practice + answer keys. Primary KNM reference.
- **inburgeren.nl** — official 38-video KNM series ("Naar Nederland").
- **Naar Nederland handbook** (free PDF) — the inburgering spine.
- **"Nederland en je rechten"** — KNM reference book.
- **TaalCompleet** textbook series — A1 → B1.
- **Bart de Pau "Learn Dutch"** YouTube — 1000-words course.
- **Marlou Lemmens "Learn Dutch with Marlou"** — A1 → B1 videos.
- **NedLes** YouTube — KNM-focused.

### Authoring approach for KNM
Questions written from scratch using knowledge of the Naar Nederland material — NOT copied from copyrighted DUO sources. User should spot-check against current DUO practice tests before relying on pass-logic.

### Storage keys (Dutch additions)
- `dutch-exam-target` — `'a2' | 'b1'`, default `'b1'`
- `dutch-knm-learned` — `Set<string>` of question IDs
- `dutch-knm-attempts` — `Array<{ts, score, total, passed}>` capped at 50
- `dutch-lezen-studied` — `Set<string>` of text IDs
- `dutch-lezen-mock-attempts` — `Array<{ts, score, total, passed, text_ids}>` capped at 50

