# Content Authoring Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock in the Hindi content authoring flow (canonical sources, aap-default register, conversational style, source-citation requirement) and exercise it end-to-end by adding 3 new lessons.

**Architecture:** Update `CONTENT.md` to be the authoritative authoring guide. Align `scripts/generate-lesson.mjs`'s `STYLE_GUIDE` with the new register policy and tighten the Zod schema. Author 3 new lesson JSONs by hand using knowledge of the cited Snell & Weightman / Afroz Taj chapters. Register them in `lib/lessons.ts` and update inventory.

**Tech Stack:** TypeScript / Next.js 16, Node.js scripts, Zod for content schema, JSON content files.

**Spec:** `docs/superpowers/specs/2026-05-26-content-authoring-flow-design.md`
**Repo:** `abhinav-kipper/learn-hindi`
**Branch:** suggest `feature/content-authoring-flow` (or work directly on main — solo app)

---

## Reference paths

- `CONTENT.md` — the authoritative content map. Currently has stale style guide.
- `scripts/generate-lesson.mjs` — Gemini-driven lesson generator with inline `STYLE_GUIDE` constant.
- `content/lessons/*.json` — situation lessons. Files named `NN-<id>.json` where `NN` is 01..N.
- `content/lessons/07-home-visit.json` — best reference for what a polished lesson looks like (full schema, 10 phrases, all fields populated).
- `lib/lessons.ts` — registers lessons by importing each JSON and adding to the `lessons` array.
- `content/lesson-queue.json` — topic queue, contains the 3 topics we're authoring.
- `CLAUDE.md` — has a "Current App State" line that mentions situations count.

Schema reminder (from `scripts/generate-lesson.mjs`, lines 86-98):
```ts
{
  id: string,
  title: string,
  situation: string,
  skills: string[2..5],
  phrases: { hindi, english, context, pronunciation }[8..10],
  grammar_notes: string[3..6],
  culture_notes: string[2..4],
  skill_breakdown: { skill, explanation, more_examples: {hindi,english}[3..6] }[2..3],
  practice_prompt: string,
  references: string[]    // currently optional, becoming required (min 1)
}
```

---

## Task 1: Update CONTENT.md with new style guide, sources, workflow

**Files:**
- Modify: `CONTENT.md` (replace style guide section; add Canonical Sources + Authoring Workflow sections; update Open Gaps)

- [ ] **Step 1: Read current CONTENT.md**

Run: `cat CONTENT.md` to confirm structure. Current outline:
- Inventory (Situations / Foundations / Vocabulary tables)
- Schema (Lesson JSON, Vocab JSON)
- Style Guide (the stale section to replace)
- Known content issues / Open gaps

- [ ] **Step 2: Replace the existing Style Guide section + add new sections**

Open `CONTENT.md`. Locate the "Style Guide" section (or any section that mentions romanization rules + register). Replace it with the block below, AND insert the "Canonical Sources" and "Authoring Workflow" sections immediately after the Schema section but before the Open Gaps section.

The exact text to paste (use Edit tool — find the old style-guide header and replace through the end of that section):

```markdown
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
```

- [ ] **Step 3: Update the Open Gaps section**

Find the "Open Gaps" section (or equivalent — "Known content issues"). Update it to strike resolved items. The current state of resolved-but-still-listed issues:
- Situations/foundations label bug — RESOLVED (fixed in commit `601f089`).
- Daily-goal meter showing sessions instead of minutes — RESOLVED (commit `8e5161a`).
- No gender field — RESOLVED (commit `5a6e5a4`).

Remove those items if present; keep remaining gaps (e.g. Foundations 02-06 empty `skill_breakdown: []`, conjugation drill is verb-by-verb, etc.).

- [ ] **Step 4: Verify CONTENT.md is well-formed Markdown**

```bash
wc -l CONTENT.md
```
Expected: substantially more lines than before (the Style Guide section grew + 2 new sections added).

- [ ] **Step 5: Commit**

```bash
git add CONTENT.md
git commit -m "docs(content): rewrite CONTENT.md style guide for aap-default + add Canonical Sources + Authoring Workflow"
```

---

## Task 2: Align scripts/generate-lesson.mjs with new style guide + tighten references

**Files:**
- Modify: `scripts/generate-lesson.mjs`

- [ ] **Step 1: Replace the STYLE_GUIDE constant**

Open `scripts/generate-lesson.mjs`. Find the `const STYLE_GUIDE = \`...\``.trim()` block (around lines 45-65). Replace it with:

```js
const STYLE_GUIDE = `
REGISTER POLICY (Hindi has 3 forms of "you" — get this right):
- DEFAULT: "aap" (respectful). Use for shopkeepers, auto drivers, strangers, elders, anyone you're not close with.
- "tum": friendly/peer (chai with a mate, classmates, weekend plans).
- "tu": intimate/playful (sibling teasing, very close friend, anger). Use sparingly.
- Teaching exceptions: lesson IDs "01-greetings" and "06-pronouns-verbs" explicitly teach the contrast — only there can "tu" phrases appear, and they MUST be tagged "(very informal)" or "(intimate)" in the english field.
- The practice tutor flags register-mismatches as corrections; authored content must never model those mismatches.

ROMANIZATION RULES (must follow exactly):
- ASCII romanization only — NO Devanagari script.
- Single-vowel endings: write "karta" not "kartaa", "karunga" not "karoongaa".
- Use "chh" for छ sound (e.g. "chhat").
- Use "dh" for ध (e.g. "dhanyavaad"), "th" for थ (e.g. "thoda").
- Use "aa" only when ambiguity matters ("haan" vs "han").

PRONUNCIATION FIELD:
- SYLLABLE-stress format. Hyphens between syllables. CAPS on the stressed syllable.
- Example: "BA-zaar ja-NA hai", "na-mas-TE AUN-ty ji".

GENDER:
- Where verb endings differ by speaker gender, show both: "main jaa raha hoon / jaa rahi hoon".
- For single-form examples, use FEMININE ("-i", "-rahi", "-gayi") — the app defaults users to female gender.

CONTENT STYLE:
- Phrases should sound like real conversation, not textbook Hindi. Use fillers (arrey, accha, matlab, yaar, bas, dekho, na, haan).
- 2-3 Hindi sentences per phrase MAX. One is often best.
- Avoid textbook connectives in phrases: "iss prakar", "isliye", "parantu", "kintu". Put those in grammar_notes only.
- Each phrase has a "context" field explaining the social nuance.
- Culture notes give one practical tip about social dynamics, not generic facts.
- references[] field is REQUIRED — cite at least one specific chapter/lesson from the canonical sources below.
`.trim()
```

- [ ] **Step 2: Add the SOURCES constant immediately after STYLE_GUIDE**

```js
const SOURCES = `
CANONICAL SOURCES — ground your phrases in these, not invented examples:
- Snell & Weightman "Teach Yourself Hindi" — 22 chapters, grammar-progressive. Good for grammar accuracy and idiomatic patterns. Slightly formal in tone — soften when porting.
- Afroz Taj "A Door Into Hindi" (UNC Chapel Hill, taj.oasis.unc.edu) — 24 video lessons with transcripts. Conversational, North Indian register. Usually drop-in usable.
- McGregor "Outline of Hindi Grammar" — Oxford. Use ONLY for grammar disambiguation. Never lift phrases from it (too academic-formal).

Always populate references[] with at least one specific chapter/lesson like "Snell & Weightman Ch. 11" or "Afroz Taj Lesson 9".
`.trim()
```

- [ ] **Step 3: Tighten the references field in the Zod schema**

Find `LessonSchema` (around lines 88-98). Change:

```js
  references: z.array(z.string()).optional(),
```

To:

```js
  references: z.array(z.string()).min(1),
```

- [ ] **Step 4: Wire SOURCES into the prompt**

Find where `STYLE_GUIDE` is used in the prompt-building function (search for `${STYLE_GUIDE}`). Add `${SOURCES}` directly after it so Gemini sees both. Example diff context (your file may differ slightly):

```diff
   const prompt = `You are a Hindi curriculum writer. Generate ONE situational Hindi
   ...
   ${STYLE_GUIDE}
+
+  ${SOURCES}
   ...`
```

- [ ] **Step 5: Verify the script still parses + tsc clean**

```bash
node -c scripts/generate-lesson.mjs
npx tsc --noEmit
```

Both must succeed. (`node -c` syntax-checks without running.)

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-lesson.mjs
git commit -m "feat(generator): aap-default register + canonical sources + require references[]"
```

---

## Task 3: Author lesson 08-shopping-clothes

**Files:**
- Create: `content/lessons/08-shopping-clothes.json`

- [ ] **Step 1: Write the JSON**

Create `/home/user/learn-hindi/content/lessons/08-shopping-clothes.json` with this exact content:

```json
{
  "id": "shopping-clothes",
  "title": "Shopping for Clothes",
  "situation": "You're at a clothing shop in a busy market, picking out a kameez. You want a different color, the size doesn't fit, and the asking price is too high.",
  "skills": ["sizes & colors", "polite imperatives (-iye)", "haggling softeners", "preferences"],
  "phrases": [
    { "hindi": "bhaiya, ek baar yeh wali kameez dikhaiye", "english": "Bhaiya, please show me this kameez", "context": "'bhaiya' (brother) for a younger shopkeeper — universal market address. 'ek baar' (one time) is a softener that means 'just / please'. 'dikhaiye' is the polite-imperative 'show'.", "pronunciation": "BHAI-ya, EK baar YEH wa-LI ka-MEEZ di-KHAI-ye" },
    { "hindi": "iska kya rate hai aapke yahaan?", "english": "What's the price at your shop?", "context": "'kya rate hai' is the natural haggling-opener for shopkeepers. 'aapke yahaan' (at your place) hints you're comparing with other shops.", "pronunciation": "IS-ka kya RATE hai AAP-ke ya-HAAN?" },
    { "hindi": "neela waala dikhaiye, gulabi nahi chahiye", "english": "Show me the blue one, I don't want pink", "context": "'waala' attached to a color = 'the X one'. 'neela waala' = the blue one. 'chahiye' (need/want) is the standard preference verb.", "pronunciation": "NEE-la WAA-la di-KHAI-ye, gu-LAA-bi na-HI cha-HI-ye" },
    { "hindi": "size medium mein hai? large thoda bada lagega", "english": "Do you have it in medium? Large will be a bit big", "context": "'mein hai?' (in X is?) = 'do you have in X'. 'lagega' (will seem/feel) — natural way to express anticipated fit.", "pronunciation": "SIZE me-DI-um mein hai? LARGE tho-DA ba-DA la-GE-ga" },
    { "hindi": "yeh chhota hai mujhe, ek size bada dikhaiye", "english": "This is small for me, show one size bigger", "context": "'chhota' (small) — gender-agrees with kameez (feminine) → 'chhoti'. Here speaker uses masculine because 'yeh' refers to the size, not the garment. Both work in casual speech.", "pronunciation": "YEH chho-TA hai mu-JHE, EK size ba-DA di-KHAI-ye" },
    { "hindi": "arrey itna mehnga? thoda kam karenge na?", "english": "Oh that's expensive — you'll bring it down a bit, won't you?", "context": "'arrey' is the haggling-shock filler. 'thoda kam karenge na' (won't you make it a little less) — 'na' tag-question makes it almost a friendly ask, not a demand.", "pronunciation": "AR-rey IT-na meh-NGA? tho-DA KAM ka-RE-nge na?" },
    { "hindi": "main aapko paanch sau dungi, isse zyaada nahi", "english": "I'll give you five hundred, not more than that", "context": "'paanch sau' = 500. 'dungi' (feminine future of 'give'). 'isse zyaada nahi' (not more than this) is the standard counter-offer closer.", "pronunciation": "MAIN AAP-ko PAANCH sau DOON-gi, IS-se zyaa-DA na-HI" },
    { "hindi": "theek hai, le leti hoon — pack kar dijiye", "english": "Okay, I'll take it — please pack it up", "context": "'le leti hoon' (I'll take, feminine) — 'le lena' is the completion-compound 'take up'. 'pack kar dijiye' = please pack — borrowing English 'pack' is normal in modern shopping Hindi.", "pronunciation": "THEEK hai, LE le-TI hoon — PACK kar DI-ji-ye" },
    { "hindi": "bill bhi de dijiye, please", "english": "Please give the bill too", "context": "'bill' borrowed from English — universal in Indian shopping. 'de dijiye' (please give) — compound 'de dena' (give over) is more polite than just 'dijiye'.", "pronunciation": "BILL bhi DE di-JI-ye, PLEASE" }
  ],
  "grammar_notes": [
    "Polite imperative '-iye' (dikhaiye, lijiye, kijiye) is the 'aap' form of commands — always use with shopkeepers and strangers",
    "Compound verbs of completion: 'le lena' (take up), 'de dena' (give over), 'kar dena' (do over). The second verb adds politeness/finality",
    "'waala' attaches to nouns/colors to mean 'the X one' — 'neela waala', 'chhota waala', 'kal waala' (the one from yesterday)",
    "Future tense feminine: '-ungi/-egi/-engi' for first/second/third person. 'main dungi' = I'll give (female speaker)",
    "Tag-question 'na' at the end softens any request: 'kar dijiye na' (please do it, won't you) is friendlier than just 'kar dijiye'"
  ],
  "culture_notes": [
    "Haggling is expected in markets and small shops — never in branded stores or malls. Starting bid: 40-50% of asked price",
    "Address shopkeepers as 'bhaiya' (younger) or 'uncle ji' (older). 'Sir' works in upscale shops; never use the shopkeeper's first name",
    "Refusing the first counter-offer and walking a few steps away is a standard move — the shopkeeper will often call you back with a better price",
    "It's fine (expected, even) to mix English shopping vocab into Hindi: 'size', 'pack', 'bill', 'rate' are universal"
  ],
  "skill_breakdown": [
    {
      "skill": "Sizes and colors",
      "explanation": "Most clothing words are borrowed from English (size, large, medium) and used as-is. Hindi color names take 'waala' to mean 'the X one'.",
      "more_examples": [
        { "hindi": "kala kurta dikhaiye", "english": "show me a black kurta" },
        { "hindi": "small size mein hai kya?", "english": "do you have it in small?" },
        { "hindi": "yeh safed waala kitne ka hai?", "english": "how much is this white one?" },
        { "hindi": "laal waala chahiye, neela nahi", "english": "I want the red one, not blue" }
      ]
    },
    {
      "skill": "Polite imperative -iye",
      "explanation": "The 'aap' form of commands. Drop the infinitive 'na' and add '-iye'. Use with shopkeepers, strangers, anyone you're not close with.",
      "more_examples": [
        { "hindi": "ek minute rukiye", "english": "please wait a minute" },
        { "hindi": "yeh dekhiye", "english": "please see this" },
        { "hindi": "thoda aage dikhaiye", "english": "please show further" },
        { "hindi": "naya stock laaiye kal", "english": "please bring new stock tomorrow" }
      ]
    },
    {
      "skill": "Haggling softeners",
      "explanation": "Hindi haggling relies on softening particles ('thoda', 'na', 'arrey') rather than blunt counter-offers. The friendlier you sound, the more the shopkeeper drops the price.",
      "more_examples": [
        { "hindi": "thoda toh kam kijiye", "english": "at least bring it down a little" },
        { "hindi": "itna mehnga kyun hai bhaiya?", "english": "why is it so expensive, bhaiya?" },
        { "hindi": "aakhri price kya hai?", "english": "what's your final price?" }
      ]
    }
  ],
  "practice_prompt": "You are a shopkeeper at a clothing stall in a busy market. The customer is browsing kameez/kurtas. They'll ask about colors, sizes, prices. Push back on prices like a real shopkeeper would — quote slightly high, come down when they push, but not on the first ask. Use 'aap' (the customer is a stranger). Open with 'aaiye aaiye, kya dikhaaun?'",
  "references": ["Snell & Weightman Ch. 11", "Afroz Taj Lesson 7"]
}
```

- [ ] **Step 2: Commit**

```bash
git add content/lessons/08-shopping-clothes.json
git commit -m "content(hindi): add shopping-clothes lesson — Snell & Weightman Ch. 11"
```

---

## Task 4: Author lesson 09-doctor-visit

**Files:**
- Create: `content/lessons/09-doctor-visit.json`

- [ ] **Step 1: Write the JSON**

Create `/home/user/learn-hindi/content/lessons/09-doctor-visit.json` with this exact content:

```json
{
  "id": "doctor-visit",
  "title": "At the Doctor",
  "situation": "You've been unwell for two days — fever, headache, upset stomach. You're at a clinic explaining your symptoms to the doctor.",
  "skills": ["body parts & pain", "describing symptoms", "polite requests", "asking about restrictions"],
  "phrases": [
    { "hindi": "doctor sahib, mujhe do din se bukhar hai", "english": "Doctor sahib, I've had fever for two days", "context": "'doctor sahib' is the respectful address — never use the doctor's first name. 'X se' (since X) is the standard duration pattern.", "pronunciation": "DOC-tor sa-HIB, mu-JHE DO din se bu-KHAAR hai" },
    { "hindi": "sar mein bahut dard ho raha hai", "english": "I have a lot of pain in my head", "context": "'X mein dard hai' (pain in X) is the universal pain construction in Hindi. 'ho raha hai' (is happening) makes it ongoing.", "pronunciation": "SAR mein ba-HUT DARD ho ra-HA hai" },
    { "hindi": "pet kharab hai, kuch khaaya nahi jaa raha", "english": "My stomach is upset, I can't really eat anything", "context": "'pet kharab' (stomach bad) = upset stomach, fixed idiom. 'khaaya nahi jaa raha' (can't be eaten) — impersonal-passive construction, very natural in Hindi.", "pronunciation": "PET kha-RAAB hai, KUCH khaa-YA na-HI jaa ra-HA" },
    { "hindi": "raat ko neend bhi nahi aati", "english": "I'm not even sleeping at night", "context": "'neend aana' (sleep coming) — how Hindi expresses 'to sleep'. 'bhi' (also/even) emphasizes that on top of everything else, sleep is also disturbed.", "pronunciation": "RAAT ko NEEND bhi na-HI AA-ti" },
    { "hindi": "kya aap mujhe kuch dawaai de sakte hain?", "english": "Could you give me some medicine?", "context": "'kar sakte hain' is the polite modal for asking ability/permission. Note: speaker uses '-sakte hain' (plural-polite) addressing the doctor as 'aap'.", "pronunciation": "KYA aap mu-JHE KUCH da-WAA-i DE sak-TE hain?" },
    { "hindi": "khaane mein kuch parhej hai kya?", "english": "Are there any food restrictions?", "context": "'parhej' (restriction/avoidance) — specifically for diet/lifestyle during illness. Indian doctors usually do prescribe what to eat and what to avoid.", "pronunciation": "khaa-NE mein KUCH par-HEJ hai kya?" },
    { "hindi": "blood test karwana padega kya?", "english": "Will I need to get a blood test?", "context": "'karwana' (causative of 'do') = to get done. 'padega' = will have to — expresses unavoidable obligation, slightly anxious.", "pronunciation": "BLOOD TEST kar-WAA-na pa-DE-ga kya?" },
    { "hindi": "yeh dawaai kab tak leni hai?", "english": "How long do I need to take this medicine?", "context": "'kab tak' (until when) — asks for a duration. 'leni hai' (have to take, feminine) — 'leni' agrees with 'dawaai' (feminine).", "pronunciation": "YEH da-WAA-i KAB tak LE-ni hai?" },
    { "hindi": "theek hai doctor sahib, kal phir dikhaane aaungi", "english": "Alright doctor sahib, I'll come show you again tomorrow", "context": "'dikhaane' (to show — purposive infinitive). 'aaungi' (will come, feminine). Coming back for a follow-up is normal in clinic visits.", "pronunciation": "THEEK hai DOC-tor sa-HIB, KAL phir di-KHAA-ne AAUN-gi" }
  ],
  "grammar_notes": [
    "Pain construction: 'X mein dard hai' (pain in X). Always use 'mein' (in), never 'ka' (of). 'sar mein dard', 'pet mein dard', 'kamar mein dard'",
    "Duration with 'se': 'do din se' (since two days), 'ek hafte se' (since one week). The verb stays in present tense — Hindi uses present where English uses present perfect",
    "Impersonal passive: 'khaaya nahi jaa raha' (can't be eaten), 'soya nahi jaa raha' (can't be slept). Use when an action feels involuntary or impossible",
    "Modal 'X kar sakte hain' (can do X) — for asking permission/ability politely. Drop 'sakte' and you get plain present",
    "Causative 'X karwana' (get X done) — for things done TO you by someone else. 'blood test karwana' = to get a blood test (done by the lab)"
  ],
  "culture_notes": [
    "Always address doctors as 'doctor sahib' (male) or 'doctor sahiba' / 'doctor madam' (female). First names are reserved for very close family doctors",
    "Indian doctors expect detailed symptom descriptions — duration, intensity, what makes it worse, what you ate. The more you tell, the better",
    "Prescriptions almost always include diet restrictions ('parhej') — avoiding cold drinks, sour food, oily food. Ask explicitly so you know",
    "Follow-up visits are normal and expected. 'kal phir dikhaane aaungi' (I'll come show again tomorrow) is a standard closer"
  ],
  "skill_breakdown": [
    {
      "skill": "Body parts and pain",
      "explanation": "The pain construction 'X mein dard hai' works with every body part. Learn the common ones: sar (head), pet (stomach), gala (throat), kamar (back/waist), seena (chest), aankh (eye), kaan (ear).",
      "more_examples": [
        { "hindi": "gale mein bahut dard hai", "english": "I have a lot of throat pain" },
        { "hindi": "kamar mein dard ho raha hai", "english": "my back is hurting" },
        { "hindi": "aankhon mein jalan hai", "english": "my eyes are burning" },
        { "hindi": "kaan mein halki si dard hai", "english": "I have a slight earache" }
      ]
    },
    {
      "skill": "Describing duration with 'se'",
      "explanation": "Use 'X se' (since X) plus present tense to describe how long a symptom has been going on. Hindi uses present where English uses present perfect.",
      "more_examples": [
        { "hindi": "teen din se bukhar hai", "english": "I've had fever for three days" },
        { "hindi": "ek hafte se khanssi aa rahi hai", "english": "I've had a cough for a week" },
        { "hindi": "kal raat se neend nahi aayi", "english": "I haven't slept since last night" }
      ]
    },
    {
      "skill": "Polite modal requests",
      "explanation": "Use 'kya aap X kar sakte/sakti hain?' (could you do X?) to ask politely. The verb agrees with the doctor's gender. Drop 'kya' for a softer question.",
      "more_examples": [
        { "hindi": "kya aap dawaai likh sakte hain?", "english": "could you write the prescription?" },
        { "hindi": "kya yeh fir se check kar sakti hain?", "english": "could you (female doctor) check it again?" },
        { "hindi": "kya main yeh khaa sakti hoon?", "english": "can I eat this?" }
      ]
    }
  ],
  "practice_prompt": "You are a Hindi-speaking general physician. The patient (the user) is unwell and describing symptoms. Ask follow-up questions like a real doctor would — when did it start, what does the pain feel like, what have they eaten. Use 'aap' (doctor-patient register). Diagnose lightly and prescribe a parhej. Open with 'aaiye, baithiye — kya takleef hai?'",
  "references": ["Snell & Weightman Ch. 14", "Afroz Taj Lesson 9"]
}
```

- [ ] **Step 2: Commit**

```bash
git add content/lessons/09-doctor-visit.json
git commit -m "content(hindi): add doctor-visit lesson — Snell & Weightman Ch. 14 + Afroz Taj Lesson 9"
```

---

## Task 5: Author lesson 10-phone-with-parents

**Files:**
- Create: `content/lessons/10-phone-with-parents.json`

- [ ] **Step 1: Write the JSON**

Create `/home/user/learn-hindi/content/lessons/10-phone-with-parents.json` with this exact content:

```json
{
  "id": "phone-with-parents",
  "title": "Phone Call with Parents",
  "situation": "Your weekly Sunday-evening call with mummy and papa back home. They ask about work, food, sleep, and when you're visiting next. You're the daughter, calling from your apartment in another city.",
  "skills": ["sustained aap register", "family terms", "future plans", "feminine future-tense verbs"],
  "phrases": [
    { "hindi": "namaste mummy, kaisi hain aap?", "english": "Namaste mummy, how are you?", "context": "Standard call opener. Always 'aap' to parents in respectful North Indian families. 'kaisi' (feminine) agrees with mummy.", "pronunciation": "na-mas-TE MUM-my, KAI-si hain AAP?" },
    { "hindi": "papa kahaan hain? unhe bhi phone de dijiye", "english": "Where's papa? Please pass the phone to him too", "context": "'de dijiye' (please give over) — even with mummy you stay polite with imperatives. 'unhe bhi' (to him too) — 'bhi' (also) makes sure papa isn't left out.", "pronunciation": "PA-pa ka-HAAN hain? UN-he bhi PHONE de DI-ji-ye" },
    { "hindi": "main bilkul theek hoon, aap chinta mat kijiye", "english": "I'm absolutely fine, please don't worry", "context": "'chinta mat kijiye' (don't worry, polite) — parents always worry, you always reassure. Standard exchange.", "pronunciation": "MAIN bil-KUL THEEK hoon, AAP chin-TA MAT KI-ji-ye" },
    { "hindi": "aap dono kaise hain? khaana time pe khaa rahe hain?", "english": "How are you both? Are you eating meals on time?", "context": "Reciprocal concern. 'time pe' (on time) — food timing is a constant Indian parent topic. 'rahe hain' (you-plural-polite ongoing).", "pronunciation": "AAP DO-no KAI-se hain? khaa-NA TIME pe khaa ra-HE hain?" },
    { "hindi": "kaam thoda zyaada hai is hafte, par sambhal lungi", "english": "Work is a bit much this week, but I'll manage", "context": "'sambhal lungi' (I'll manage, feminine future + 'le lena' completion compound). Downplaying work stress is standard — you don't want parents worrying.", "pronunciation": "KAAM tho-DA zyaa-DA hai IS haf-TE, PAR sam-BHAAL LOON-gi" },
    { "hindi": "agle hafte zaroor aaungi, pakka", "english": "I'll definitely come next week, for sure", "context": "'agle hafte' (next week). 'aaungi' (will come, feminine future). 'pakka' (definitely/sure) — Indian-parent vocabulary for commitments.", "pronunciation": "AG-le HAF-te za-ROOR AAUN-gi, PAK-ka" },
    { "hindi": "haan, sabzi banaai thi kal — papa ki recipe se", "english": "Yes, I made sabzi yesterday — using papa's recipe", "context": "'banaai thi' (had made, feminine perfect — agrees with sabzi). 'ki recipe se' (with X's recipe) — family recipes carry weight.", "pronunciation": "HAAN, SAB-zi ba-NAA-i thi KAL — PA-pa ki RE-ci-pe se" },
    { "hindi": "ek baat batani thi aapko, baad mein phone karungi", "english": "I wanted to tell you something, I'll call back later", "context": "'batani thi' (wanted to tell, feminine + obligation). Bringing up something important then deferring is conversational scaffolding — parents will remember and ask.", "pronunciation": "EK BAAT ba-TAA-ni thi AAP-ko, BAAD mein PHONE ka-ROON-gi" },
    { "hindi": "achchha mummy, ab rakhti hoon — kal phir baat karenge", "english": "Alright mummy, hanging up now — we'll talk again tomorrow", "context": "'rakhti hoon' (literally 'I'm putting down') = I'm hanging up — idiomatic for ending a phone call. 'baat karenge' (we will talk) — future tense neutral.", "pronunciation": "ACH-chha MUM-my, AB rakh-TI hoon — KAL phir BAAT ka-RE-nge" },
    { "hindi": "aap apna khayaal rakhna, papa ko bhi pyaar de dena", "english": "Take care of yourself, give my love to papa too", "context": "'khayaal rakhna' (take care) — standard sign-off concern. 'pyaar de dena' (give love over) — pass affection to other family members; you'd never just hang up after talking only to one parent.", "pronunciation": "AAP AP-na kha-YAAL rakh-NA, PA-pa ko bhi PYAAR de DE-na" }
  ],
  "grammar_notes": [
    "Sustained 'aap' register: parents are always 'aap' in respectful families. Verb agreement is plural-polite throughout: 'kaisi hain' (not 'kaisi ho'), 'kar rahe hain' (not 'kar rahe ho')",
    "Feminine future tense for first person: '-ungi/-ungi' (main aaungi = I will come). Masculine is '-unga'. Verbs in this lesson use feminine throughout",
    "Compound verb 'le lena' (take up) attaches to a main verb to express completion/finality: 'sambhal lungi' (I'll fully manage), 'rakh leti hoon' (I'm putting it down/hanging up)",
    "'rakhna' (to keep/put) is the idiomatic verb for hanging up a phone — 'rakhti hoon' = I'm hanging up. Also 'phone rakh dena' (put the phone down)",
    "'ki recipe se' / 'ke saath' / 'ke baare mein' — postpositions follow nouns and agree with gender: 'ki' for feminine, 'ka' for masculine, 'ke' for masculine plural"
  ],
  "culture_notes": [
    "Sunday-evening calls with parents are an unwritten weekly ritual in most North Indian families — skipping one without warning prompts concerned calls",
    "Parents are ALWAYS addressed as 'aap', no matter how close you are. Using 'tum' with parents sounds rude even in casual moments",
    "Food, sleep, and weight are the holy trinity of parental concerns. Expect questions about all three every call. Acceptable answers: yes, yes, no I haven't lost weight",
    "When ending a call, never just say goodbye to the parent you've been talking to — always 'pass on love' (pyaar dena) to the other parent / family members"
  ],
  "skill_breakdown": [
    {
      "skill": "Sustained aap register",
      "explanation": "With parents, every verb takes the plural-polite form. 'aap' is always paired with '-hain' (not '-ho'), and imperatives use '-iye' / '-kijiye' (not '-o').",
      "more_examples": [
        { "hindi": "aap khaana khaaye?", "english": "did you eat?" },
        { "hindi": "aap kab aa rahe hain?", "english": "when are you coming?" },
        { "hindi": "aap thoda araam kijiye", "english": "please rest a bit" },
        { "hindi": "aap chinta mat kijiye", "english": "please don't worry" }
      ]
    },
    {
      "skill": "Family terms",
      "explanation": "Hindi family vocabulary distinguishes paternal vs maternal relatives. For parents and immediate family, the common forms: mummy/maa (mother), papa/pita ji (father), bhai (brother), didi (older sister), dadi (paternal grandma), nani (maternal grandma).",
      "more_examples": [
        { "hindi": "dadi kaisi hain?", "english": "how is paternal grandma?" },
        { "hindi": "bhai se baat karwa dijiye", "english": "please let me speak to brother" },
        { "hindi": "didi ko bhi namaste kehna", "english": "say namaste to older sister too" }
      ]
    },
    {
      "skill": "Future-tense plans and promises",
      "explanation": "Future-tense first-person feminine: '-ungi'. Common verbs you'll need on calls: aaungi (will come), karungi (will do), bataungi (will tell), khaaungi (will eat).",
      "more_examples": [
        { "hindi": "agle mahine zaroor aaungi", "english": "I'll definitely come next month" },
        { "hindi": "kal aapko phone karungi", "english": "I'll call you tomorrow" },
        { "hindi": "baad mein bataungi", "english": "I'll tell you later" }
      ]
    }
  ],
  "practice_prompt": "You are the user's mother on a Sunday-evening phone call. Ask about food (have they eaten, what), sleep (are they sleeping enough), work (too much stress?), and when they're visiting next. Use 'tum' with the user (parents address children as 'tum' or 'tu'; you choose 'tum' here — warm but parental). Open with 'haan beta, kaisi ho? khaana khaaya?'",
  "references": ["Afroz Taj Lesson 11", "Snell & Weightman Ch. 9"]
}
```

- [ ] **Step 2: Commit**

```bash
git add content/lessons/10-phone-with-parents.json
git commit -m "content(hindi): add phone-with-parents lesson — Afroz Taj Lesson 11"
```

---

## Task 6: Register the 3 lessons in lib/lessons.ts

**Files:**
- Modify: `lib/lessons.ts`

- [ ] **Step 1: Add imports + array entries**

Open `lib/lessons.ts`. Current imports section (around lines 4-10):

```ts
import greetings from '@/content/lessons/01-greetings.json'
import autoNegotiation from '@/content/lessons/02-auto-negotiation.json'
import orderingFood from '@/content/lessons/03-ordering-food.json'
import expressingOpinions from '@/content/lessons/04-expressing-opinions.json'
import makingPlans from '@/content/lessons/05-making-plans.json'
import givingDirections from '@/content/lessons/06-giving-directions.json'
import homeVisit from '@/content/lessons/07-home-visit.json'
```

Add three new imports after homeVisit:

```ts
import greetings from '@/content/lessons/01-greetings.json'
import autoNegotiation from '@/content/lessons/02-auto-negotiation.json'
import orderingFood from '@/content/lessons/03-ordering-food.json'
import expressingOpinions from '@/content/lessons/04-expressing-opinions.json'
import makingPlans from '@/content/lessons/05-making-plans.json'
import givingDirections from '@/content/lessons/06-giving-directions.json'
import homeVisit from '@/content/lessons/07-home-visit.json'
import shoppingClothes from '@/content/lessons/08-shopping-clothes.json'
import doctorVisit from '@/content/lessons/09-doctor-visit.json'
import phoneWithParents from '@/content/lessons/10-phone-with-parents.json'
```

Current lessons array (around lines 12-20):

```ts
const lessons: Lesson[] = [
  greetings,
  autoNegotiation,
  orderingFood,
  expressingOpinions,
  makingPlans,
  givingDirections,
  homeVisit,
] as Lesson[]
```

Add the three new entries in order:

```ts
const lessons: Lesson[] = [
  greetings,
  autoNegotiation,
  orderingFood,
  expressingOpinions,
  makingPlans,
  givingDirections,
  homeVisit,
  shoppingClothes,
  doctorVisit,
  phoneWithParents,
] as Lesson[]
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: clean. If the JSON shape mismatches the `Lesson` type, fix the JSON not the type.

- [ ] **Step 3: Verify the lessons load + tests pass**

```bash
npx vitest run
```

Expected: all existing tests pass. The lesson-resume / phrase-progress / personalization tests touch this list — if any fail, the new JSONs probably have a structural issue.

- [ ] **Step 4: Verify design lint clean**

```bash
node scripts/lint-design.mjs
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add lib/lessons.ts
git commit -m "feat(lessons): register shopping-clothes + doctor-visit + phone-with-parents"
```

---

## Task 7: Pop the 3 topics from the queue + update inventory + update CLAUDE.md

**Files:**
- Modify: `content/lesson-queue.json` (remove the 3 used topics)
- Modify: `CONTENT.md` (add 3 rows to the Situations inventory table)
- Modify: `CLAUDE.md` (update situations count if mentioned)

- [ ] **Step 1: Update lesson-queue.json**

Open `content/lesson-queue.json`. Remove the 3 topic entries for `shopping-clothes`, `doctor-visit`, `phone-with-parents`. Preserve order of remaining topics + the `_comment` field.

- [ ] **Step 2: Update CONTENT.md Situations inventory table**

Find the "Situations (`content/lessons/*.json`)" table. Update the count from "7 lessons" → "10 lessons" in the section header. Add three rows to the end of the table:

```markdown
| `08-shopping-clothes` | Shopping for Clothes | Clothing shop with bargaining | sizes & colors, polite imperatives (-iye), haggling softeners, preferences |
| `09-doctor-visit` | At the Doctor | Describing symptoms at a clinic | body parts & pain, describing symptoms, polite requests, asking about restrictions |
| `10-phone-with-parents` | Phone Call with Parents | Weekly Sunday call with mummy & papa | sustained aap register, family terms, future plans, feminine future-tense verbs |
```

- [ ] **Step 3: Update CLAUDE.md if it references a situations count**

Run: `grep -n 'situations\|7 lessons\|7 situations' CLAUDE.md`

If you find a line mentioning "7 situations" or similar, update to "10 situations". The most likely location is in the "Current App State" or "Pages" section.

If no match — skip this step.

- [ ] **Step 4: Verify**

```bash
node -e "JSON.parse(require('fs').readFileSync('content/lesson-queue.json','utf8'))"
npx tsc --noEmit
npx vitest run
```

All should be clean.

- [ ] **Step 5: Commit**

```bash
git add content/lesson-queue.json CONTENT.md CLAUDE.md
git commit -m "chore(content): pop 3 topics from queue, update inventory, bump situations count"
```

---

## Task 8: Final QA + push

- [ ] **Step 1: Full local verification**

```bash
npx vitest run
npx tsc --noEmit
node scripts/lint-design.mjs
```

Expected:
- vitest: 214/214 pass (no test count changes from this work — content additions don't add tests)
- tsc: clean
- design-lint: 46+ files clean

- [ ] **Step 2: Smoke-check the new lessons in dev**

If dev server boots quickly (<30s), start `npm run dev`, visit:
- `http://localhost:3000` — home page should now show 10 situations cards
- `http://localhost:3000/lessons/shopping-clothes` — should render with the new header showing "chapter 08 · situations" and the 9 phrases
- `http://localhost:3000/lessons/doctor-visit` — should render
- `http://localhost:3000/lessons/phone-with-parents` — should render

Kill the dev server. **Skip this step if dev server boots slowly** — the visual CI workflow will catch boot issues.

- [ ] **Step 3: Push**

```bash
git push origin <branch-name>
```

If on main directly: `git push origin main`.

- [ ] **Step 4: Confirm CI green**

- `ci` workflow: should be green (eslint + tsc + design-lint + vitest)
- `visual` workflow: will fail (no baselines committed yet — pre-existing condition from the design-lock-in pipeline shipment)

---

## Self-review checklist (for the implementing engineer)

- [ ] `CONTENT.md` has the new Style Guide / Canonical Sources / Authoring Workflow sections; old style guide replaced
- [ ] `scripts/generate-lesson.mjs` has the new `STYLE_GUIDE` + new `SOURCES` constant + `references` field required (min 1)
- [ ] 3 new JSON files exist at `content/lessons/08-`, `09-`, `10-`
- [ ] `lib/lessons.ts` imports + registers all 3
- [ ] `content/lesson-queue.json` no longer contains the 3 used topic entries
- [ ] `CONTENT.md` inventory table has 3 new rows; section header says "10 lessons"
- [ ] CLAUDE.md updated if it referenced a situations count
- [ ] All tests pass; tsc clean; design-lint clean
- [ ] All 7 commits pushed
