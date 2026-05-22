# Content Map — Hindi Learning App

Authoritative map of all learning content so future sessions don't re-read 1600 lines of JSON. Update this file when content changes.

## Inventory

### Situations (`content/lessons/*.json`) — 6 lessons
Conversational Hindi taught through scenarios. Each lesson: 9-10 phrases + grammar notes + culture notes + 2-3 skill breakdowns + AI practice prompt.

| ID | Title | Situation | Skills |
|----|-------|-----------|--------|
| `01-greetings` | Greetings & Fillers | First-time meeting at a house party | interjections/fillers, informal pronouns (tu/tum/aap), casual greetings |
| `02-auto-negotiation` | Arguing with an Auto Driver | Negotiating fare outside a metro | present continuous, imperative, negotiation softeners |
| `03-ordering-food` | Ordering Chai & Street Food | Roadside chai stall | quantities/numbers, `wala` constructions, polite requests |
| `04-expressing-opinions` | Expressing Opinions | Post-Bollywood-movie chat | past tense (tha/thi/the), `lagta hai` pattern, agree/disagree |
| `05-making-plans` | Making Plans with Friends | WhatsApp group weekend plans | future tense (ga/ge/gi), conditional (agar...toh), suggestions |
| `06-giving-directions` | Giving & Asking Directions | Stranger asks for metro | postpositions, location vocab, sequential instructions |

### Foundations (`content/foundations/*.json`) — 6 lessons
Grammar core. Same schema as situations but **`skill_breakdown` is currently empty `[]` in all 6**. Phrases + grammar_notes do the teaching.

| ID | Title |
|----|-------|
| `01-numbers` | Numbers & Counting |
| `02-present-tense` | Present Tense |
| `03-past-tense` | Past Tense |
| `04-future-tense` | Future Tense |
| `05-postpositions` | Postpositions |
| `06-pronouns-verbs` | Pronouns & Verb Agreement |

### Vocabulary (`content/vocabulary.json`)
6 categories × ~15-20 words = **100 words total**: Everyday Words, Emotions & Feelings, Food & Drinks, People & Relationships, Time & Numbers, Actions.

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
  practice_prompt: string  // sent to Gemini as scenario for chat practice
}
```

## Style Guide (in use)

- **Hinglish welcome** — English words mixed in (`boring`, `twist`, `interval`, `done`, `UPI`) match how urban Indians actually speak.
- **Romanization** — Devanagari is never used. Conventions:
  - `accha` (not `achcha` or `acha`) — written this way throughout
  - `chh` = aspirated ch (`chhe` = 6, `chhutta` = change, `chhat` = roof)
  - `nahi` (not `nahin`)
  - No diacritics (no `ā`, `ī`)
- **Pronunciation field** — uses CAPS to mark stress + hyphens for syllables (e.g. `BHAI-ya, kya HAAL hai?`). Not fully consistent across files.
- **Voice** — first-person learner, conversational, "yaar / dude" energy. Practice prompts always describe a concrete scenario the user steps into.
- **Cultural context** — every lesson grounds phrases in Indian social reality (auto-fare norms, WhatsApp group dynamics, `dekhte hain` = polite no).

## Known Issues (as of 2026-05-22)

### Bugs (fixed)
- ~~Typo `chahat pe` → `chhat pe` in `05-postpositions.json`~~ ✓
- ~~Wrong "you" register `tere paas` → `tumhare paas` in `01-greetings.json` phrase 7~~ ✓

### Romanization & style inconsistency (not yet addressed)
- Mixed stress system: sometimes CAPS-on-stressed-syllable (`BHAI-ya`), sometimes just hyphens for syllables (`KIT-ne`). Pick one.
- `cc` vs `chh` convention not documented in-content (style guide above defines it).
- Pronunciation field formatting varies file to file.

### Structural gaps
1. **Foundations have empty `skill_breakdown: []`** — situations have 2-3 rich skill breakdowns each, foundations have none.
2. **Scope is small** — only 6+6+100. Roadmap question: polish-then-grow vs grow-then-polish.
3. **No audio assets** — TTS via `lib/speech.ts` works, but no native recordings.
4. **No level markers** — no A1/A2/B1 progression.

## Loading

- `lib/lessons.ts` — imports all 6 lesson JSONs into an array
- `lib/foundations.ts` — imports all 6 foundation JSONs
- `lib/vocabulary.ts` — exports categories from vocabulary.json
- `lib/all-content.ts` — universal lookup `getUniversalLessonById(id)` across both
- `lib/personalization.ts` — `reorderLessonsByReason()` reshuffles situations based on onboarding (family/bollywood/moving/curious)
- `lib/system-prompt.ts` — `buildSystemPrompt(lesson)` injects lesson into Gemini system prompt for `/practice/[id]`

## Adding new content

1. Create `content/lessons/NN-topic.json` (or `content/foundations/NN-topic.json`) following the schema above
2. Import + push into array in `lib/lessons.ts` (or `lib/foundations.ts`)
3. Update this file's inventory table
4. Test locally — check the JSON renders, the practice prompt works in `/practice/[id]`
