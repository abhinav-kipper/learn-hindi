# Content Authoring Flow — Spec

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Scope

Make adding Hindi lesson content to the app smooth and consistent by:

1. Updating `CONTENT.md` so it's the authoritative source of authoring decisions (register policy, source canon, workflow).
2. Aligning the AI generator's `STYLE_GUIDE` (in `scripts/generate-lesson.mjs`) to the new aap-default register policy already enforced by the practice tutor.
3. Documenting the 3 canonical open-source sources to ground new content in.
4. Exercising the flow end-to-end by authoring 3 new lessons from the existing `content/lesson-queue.json` topic queue: `shopping-clothes`, `doctor-visit`, `phone-with-parents`.

After this ships, adding a new lesson is a single workflow: pick topic + source → draft → validate → commit.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| Canonical sources | Snell & Weightman (primary), Afroz Taj — A Door Into Hindi (primary), McGregor (grammar reference only — no phrase lifting) |
| Authoring workflow | AI-drafted (Gemini via `generate-lesson.mjs`, or directly by an authoring agent), human review |
| Scope this iteration | Flow + 3 lessons (shopping-clothes, doctor-visit, phone-with-parents) |
| Register policy | `aap` default; `tum` for peer-friend scenarios; `tu` only when intimately demanded; teaching lessons (01-greetings, 06-pronouns-verbs) are the only exceptions and must flag `tu` as "(very informal)" in english |
| `references[]` field | Required (currently optional); every new lesson must cite at least one specific chapter/lesson from a canonical source |
| Gender-default in examples | Feminine (matches app's female-default user gender) |

## 3. File changes

### Modified

| Path | Change |
|---|---|
| `CONTENT.md` | Replace style-guide section with new register policy; add new "Canonical Sources" section; add new "Authoring Workflow" section; update "Open gaps" (strike resolved items: situations/foundations bug fixed, daily-goal fixed, gender field added). |
| `scripts/generate-lesson.mjs` | Replace `STYLE_GUIDE` constant (~line 45) with the new aap-default policy. Add a `SOURCES` constant listing the 3 canonical books. Change `references` Zod schema from `.optional()` to required-with-min-1 for new lessons. |
| `content/lesson-queue.json` | Remove the 3 topics being authored. |
| `lib/lessons.ts` | Import 3 new JSONs, register in the lessons array. |
| `CLAUDE.md` | Update "Current App State" page count from 7 situations → 10. |

### New

| Path | Purpose |
|---|---|
| `content/lessons/08-shopping-clothes.json` | Bargaining at a clothing shop. Skills: sizes & colors, polite imperatives, haggling softeners. 9 phrases. References: Snell & Weightman Ch. 11. |
| `content/lessons/09-doctor-visit.json` | Describing symptoms to a doctor. Skills: body parts, pain expressions, polite requests. 9 phrases. References: Snell & Weightman Ch. 14, Afroz Taj Lesson 9. |
| `content/lessons/10-phone-with-parents.json` | Weekly call with parents — sustained aap register. Skills: family terms, future plans, promises. 10 phrases. References: Afroz Taj Lesson 11. |

### Deleted

None.

## 4. Style guide — the core of the new CONTENT.md section

### Register policy

- **Default**: `aap` (respectful). Shopkeepers, auto drivers, strangers, elders, anyone you're not close with.
- **Friendly/peer scenarios**: `tum` (chai with a mate, classmates, weekend plans, casual movie chat).
- **Intimate only**: `tu` (sibling teasing, very close friend on WhatsApp, anger). Use sparingly.
- **Teaching exceptions**: `01-greetings` and `06-pronouns-verbs` explicitly teach the 3-way contrast; `tu` phrases in those lessons are allowed but MUST be tagged "(very informal)" or "(intimate)" in the `english` field so learners don't internalize them as defaults.
- **Mistakes the tutor flags**: a learner using `tu` with a shopkeeper / `aap` with a clearly-peer scenario gets a correction. Authored content should never model these mismatches.

### Conversational, not bookish

- Use natural fillers and softeners: `arrey`, `accha`, `matlab`, `yaar`, `dekho`, `bas`, `haan`, `na`.
- Use contractions and dropped pronouns where Hindi naturally does (e.g. `"kya kar rahe ho?"` not `"aap kya kar rahe hain?"` when context is obvious peer).
- Avoid textbook connectives in phrases: `iss prakar`, `isliye`, `parantu`, `kintu`. These belong in `grammar_notes`, not in dialogue.
- Prefer one short sentence over one long sentence with a connective.
- 2-3 sentences per phrase MAX. One is often best.

### Structure & length

- 8-10 phrases per lesson.
- Each phrase: `hindi`, `english`, `context`, `pronunciation`.
- `context`: 1-2 sentences. What's the conversational beat? What does this phrase signal socially?
- `pronunciation`: SYLLABLE-stress format, e.g. `BA-zaar ja-NA hai`. Stressed syllable in CAPS. Hyphens between syllables. Consistent across all lessons.
- `grammar_notes`: 3-5 short notes. Focus on the new rule the lesson teaches.
- `culture_notes`: 2-4 short notes. Practical social-dynamic tips, not generic facts.
- `skill_breakdown`: 2-3 entries. Each: `skill` (string), `explanation` (1-2 sentences), `more_examples` (3-5 `{hindi, english}` pairs).
- `practice_prompt`: 1-2 sentences setting the scene for the Gemini tutor in `/practice/<id>`.
- `references`: at least one entry like `"Snell & Weightman Ch. 11"` or `"Afroz Taj Lesson 9"`.

### Gender-aware examples

- Where verb endings differ by speaker gender, show both: `"main jaa raha hoon / jaa rahi hoon"`.
- Default the single-form examples to **feminine** (`-i` / `-rahi` / `-gayi`) since the app defaults users to female gender.
- The practice tutor uses the stored user gender to give correct agreement; authored examples should not contradict this.

## 5. Canonical Sources section (new in CONTENT.md)

A short paragraph per source — what it covers, where it's free, what to use it for.

**Snell & Weightman — Teach Yourself Hindi**
22 chapters, grammar-progressive with dialogues. Free PDF on archive.org. Use for: grammar accuracy, scenario inspiration, idiomatic phrase patterns. The dialogues lean a little formal; soften them when porting into a lesson.

**Afroz Taj — A Door Into Hindi**
24 video lessons + transcripts. Free on the UNC Chapel Hill site (`taj.oasis.unc.edu`). Use for: conversational tone, North Indian register, scenario authenticity. Phrases here are usually drop-in usable with minor tweaks for register.

**McGregor — Outline of Hindi Grammar**
Oxford. Use ONLY as a grammar reference, never lift phrases — McGregor is too formal for conversational content. Useful for resolving "is this conjugation right?" questions when Snell & Weightman is ambiguous.

## 6. Authoring Workflow section (new in CONTENT.md)

Numbered, copy-pasteable:

1. Pick a topic from `content/lesson-queue.json` (or add one with fields: `id`, `title`, `scenario`, `skills`, `level`, `references`).
2. Pick the source chapter(s) — at least one from Snell & Weightman or Afroz Taj.
3. Draft the lesson JSON:
   - **AI-assisted**: `GOOGLE_GENERATIVE_AI_API_KEY=… node scripts/generate-lesson.mjs --topic=<id>` — generates a draft using the updated `STYLE_GUIDE`.
   - **Hand-authored / agent-authored**: write the JSON directly in `content/lessons/NN-<id>.json` following the schema.
4. Review against the style guide:
   - Register correct? (`aap` default, `tum` peer, no rogue `tu`)
   - Conversational, not bookish?
   - `pronunciation` in `SYLLABLE-stress` format?
   - Gender-aware where verb endings differ?
   - `references[]` populated with a specific chapter/lesson?
5. Register the lesson in `lib/lessons.ts`:
   - Add the import at the top.
   - Add the named export to the `lessons` array.
6. Update `CONTENT.md` inventory table — add a row for the new lesson.
7. Validate locally:
   ```bash
   npx vitest run
   npx tsc --noEmit
   node scripts/lint-design.mjs
   ```
   All three must be green.
8. Commit with the message format: `content(hindi): add <topic> lesson — <source citation>`.

## 7. Generator script updates (`scripts/generate-lesson.mjs`)

**Replace** the existing `STYLE_GUIDE` constant (~line 45-65) with content reflecting the new policy. The new style guide string must include:

- 3-way register rule with `aap` as default
- "no tu outside 01-greetings / 06-pronouns-verbs" hard rule
- Conversational fillers + the bookish-connectives blacklist
- Feminine-default in examples
- Length caps (8-10 phrases, 2-3 sentences per phrase)
- SYLLABLE-stress pronunciation format

**Add** a new `SOURCES` constant naming the 3 canonical books, included in the Gemini system prompt so it grounds itself in them.

**Tighten** the Zod schema for `references`:
```diff
- references: z.array(z.string()).optional(),
+ references: z.array(z.string()).min(1),
```
The generator already attempts to populate references from the topic's queue entry; tightening the schema makes it a contract rather than a hope.

## 8. The 3 lessons

Each is a full Lesson JSON following the schema. Drafted in this session by the authoring agent using knowledge of the cited sources. High-level scenarios:

- **08-shopping-clothes** (Snell & Weightman Ch. 11): clothing-store haggling. 9 phrases. Tone: friendly but firm with the shopkeeper. Uses `aap` (shopkeeper is a stranger). Teaches sizes (`size`, `medium`/`large`/`extra-large`), colors (`neela`, `kala`, `safed`, `gulabi`), polite imperative `dijiye` / `dikhaiye`, haggling softeners (`thoda kam karenge?`).
- **09-doctor-visit** (Snell & Weightman Ch. 14 + Afroz Taj Lesson 9): describing symptoms. 9 phrases. Tone: polite + slightly worried. Uses `aap` (doctor). Teaches body-part vocab (`sar`, `pet`, `gala`, `kamar`), pain construction (`X mein dard hai`), duration (`do din se`), modal `kar sakti hoon`.
- **10-phone-with-parents** (Afroz Taj Lesson 11): weekly call with parents. 10 phrases. Tone: warm + dutiful. Uses `aap` throughout (parents always addressed as `aap` in respectful North Indian families; parents can address learner as `tum` but the learner-authored phrases are from the learner's POV, all `aap`). Teaches sustained-aap register, family terms (`maa`, `papa`, `dadi`, `bhai`), future plans (`agle hafte`), promises (`pakka aaungi`).

All three:
- Default to feminine verb endings in single-form examples.
- Reference at least one specific chapter/lesson.
- Use the `SYLLABLE-stress` pronunciation format.
- Have 2-3 culture notes that explain social dynamics (e.g. for doctor: "Indian doctors expect patients to describe symptoms in detail, even if they seem unrelated — leads to more accurate diagnosis").

## 9. Out of scope

- A content-lint script mirroring the design-lint (e.g. auto-flag too many `tu` in non-teaching lessons). Worth a follow-up once we have more lessons; over-engineering for this session.
- Backfilling foundations `skill_breakdown: []` arrays (separate known gap, separate session).
- Validating cited chapter numbers against the actual book PDFs (we trust the authoring agent's knowledge; spot-check welcome).
- Adding more topics to `content/lesson-queue.json` — that's a weekly-cron concern, not part of this flow.
- Dutch content (separate language pipeline, not covered).

## 10. Validation

After this ships:
- All existing tests pass (`npx vitest run`).
- `npx tsc --noEmit` clean.
- `node scripts/lint-design.mjs` clean.
- 3 new lessons visible on `/` home page (situations tab), tappable, lesson view renders without error.
- Practice mode (`/practice/<new-id>`) opens for each new lesson and the tutor's first turn references the scenario.

## 11. Open questions

None — all settled in brainstorming.
