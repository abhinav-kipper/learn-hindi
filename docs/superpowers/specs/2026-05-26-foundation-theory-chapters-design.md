# Beefed-up Foundation Chapters (Pilot: Noun Gender) — Design

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Goal

The Hindi foundations are grammar lessons but only carry brief `grammar_notes` bullets — not enough to actually teach the concept. User feedback: "phrases lessons do not teach enough in proper structure that she learns the theory the concept... add proper book knowledge."

Solution: extend the `Lesson` schema with an optional `theory` block. When present, the lesson opens with a scrollable textbook-style chapter (paragraphs, conjugation tables, worked examples, callout boxes), then transitions into the existing phrase carousel via a CTA. Pilot with `07-noun-gender` (which is also the current authoring template for foundations).

## 2. Decisions

| Decision | Choice |
|---|---|
| Where theory lives | FOUNDATIONS only. Situations stay phrase-first scenario lessons. |
| Depth | Medium textbook chapter — ~3-5 sub-sections, ~3-4 screens scroll, intro + sections + wrap-up. |
| Flow | LINEAR — theory first, scroll to bottom, CTA "Got it — try the phrases →" enters phrase carousel. No tabs / mode switching. |
| Authoring scope (this session) | Pilot 1 foundation: `07-noun-gender`. Infrastructure ships alongside. Other 8 foundations beefed up in a follow-up session. |
| Markdown / rich text | Plain prose strings split by `\n\n` for paragraphs. No Markdown parser. Optional `examples` / `table` / `callout` are first-class structured fields. |
| Visual aesthetic | Chai Galli — composed Stickers, ink borders, palette colors, existing fonts. No new design tokens. |
| Lessons WITHOUT theory | Behave exactly as before — straight to phrase carousel. Backwards-compatible. |
| Mark-complete gating | Unchanged from yesterday's fix: still requires `revealed.size === total` on the phrase carousel. Theory scroll alone does not unlock mark-complete. |

## 3. Schema additions

Add to `types/lesson.ts`:

```ts
export interface TheoryTable {
  caption?: string
  columns: string[]         // e.g. ['ending', 'gender', 'examples']
  rows: string[][]          // each inner array length must match `columns.length`
}

export interface TheoryExample {
  hindi: string
  english: string
  breakdown?: string        // optional grammar-breakdown line, italic
}

export type CalloutTone = 'tip' | 'warning' | 'note'

export interface TheoryCallout {
  tone: CalloutTone
  body: string
}

export interface TheorySection {
  heading: string
  body: string              // multi-paragraph prose, split on \n\n
  table?: TheoryTable
  examples?: TheoryExample[]
  callout?: TheoryCallout
}

export interface Theory {
  intro: string             // chapter-opening paragraph
  sections: TheorySection[] // 3-5 sub-sections
  wrap_up?: string          // optional summary paragraph
}

export interface Lesson {
  // ...existing fields unchanged...
  theory?: Theory
}
```

All new types are exported alongside the existing ones. The new field on `Lesson` is optional, so existing JSON content compiles without changes.

## 4. UI / component shape

### `components/lesson/TheoryView.tsx` (NEW)

Renders the full chapter from a `Theory` prop. Vertical scroll. Bottom CTA fires the `onStartPhrases` callback.

```tsx
type Props = {
  theory: Theory
  title: string                   // lesson.title
  onStartPhrases: () => void
}
```

Layout (top to bottom):
1. **Chapter header bar** — peach-gradient backdrop, small "📖 chapter" Tag, lesson title in display font
2. **Intro paragraph** — body font, ink60, 15px, line-height 1.55
3. **Sections** — one block per `theory.sections[]`, in order:
   - Heading (display, bold, ink, 20px)
   - Body paragraphs (`body.split('\n\n').map(p => <p>{p}</p>)`)
   - Optional table — see styling below
   - Optional examples — see styling below
   - Optional callout — see styling below
4. **Wrap-up paragraph** (if present)
5. **CTA button** — full-width orange Sticker: "Got it — try the phrases →"

### Visual treatment per element

**Table:** white Sticker, ink border, column-headers row in cream bg + display font 11px uppercase letter-spaced; body rows alternate W / peach2 backgrounds; cells body font 13px ink60; optional `caption` rendered as small ink45 italic line above the table.

**Worked examples:** column of butter-bg Stickers, each with:
- Hindi (display font, 17px, ink) on top line
- English (body font, 14px, ink60) on second line
- Optional `breakdown` line in italic body font 12px ink45

**Callout:** colored Sticker matching tone:
- `tip` → mint bg, `💡` prefix, "TIP" mochiy-pop tag in top-left
- `note` → lav bg, `📝` prefix, "NOTE" tag
- `warning` → peach bg, `⚠️` prefix, "WATCH OUT" tag

**CTA:** orange Sticker, full-width, ink-on-orange display font 16px, "Got it — try the phrases →". Has hard shadow + pressed state via existing Sticker primitive.

### Integration with `LessonChaiGalli.tsx`

Existing flow has sections: intro (0) / phrases (1) / completion (2), tracked via `sectionIndex` in the resume logic and the carousel state.

Change: when `lesson.theory` is present, render `<TheoryView>` instead of the existing intro section. `onStartPhrases` advances to section 1 (phrases). Resume-from-phrase logic unchanged.

For lessons WITHOUT `theory`, behavior is identical to today. No diff.

## 5. The Noun Gender chapter — verbatim content

This is the verbatim authoring content for `07-noun-gender.json`'s new `theory` block. The implementer should drop this in as-is (and may polish punctuation but not restructure).

```json
{
  "intro": "Hindi has two genders — masculine and feminine — and every single noun has one. Get the gender wrong and the whole sentence breaks: adjectives, verbs, even some postpositions change to match the noun's gender. There's no neuter and no 'just memorize the article' shortcut — gender lives inside the word itself and ripples outward to everything connected to it. Master this and a huge amount of Hindi clicks into place.",
  "sections": [
    {
      "heading": "The two genders",
      "body": "Every Hindi noun is either masculine (पुल्लिंग, pulling) or feminine (स्त्रीलिंग, striling). There is no neuter and no third option. When you learn a new noun, learn its gender at the same time — write it down as `ladka (m)` or `kitaab (f)`. This habit pays off forever.\n\nGender controls more than you'd expect from English. Compare these two sentences — same meaning, different gender, almost every word changes:",
      "examples": [
        { "hindi": "ladka acchaa hai", "english": "the boy is good", "breakdown": "ladka (m) + acchaa (m form) + hai" },
        { "hindi": "ladki acchhi hai", "english": "the girl is good", "breakdown": "ladki (f) + acchhi (f form) + hai" }
      ],
      "callout": { "tone": "note", "body": "Notice that the verb `hai` stays the same — it's only the adjective that shifts. We'll see when verbs shift too in the section below." }
    },
    {
      "heading": "Spot the pattern from the ending",
      "body": "Most Hindi nouns follow a vowel-ending pattern that hints at gender. This is your first guess — right about 75% of the time. Memorize the pattern; memorize the exceptions.",
      "table": {
        "caption": "Common noun-ending patterns",
        "columns": ["ending", "usually", "examples"],
        "rows": [
          ["-aa or consonant", "masculine", "ladka, makaan (house), paani (water), kitaab... wait, kitaab is feminine"],
          ["-ii / -i", "feminine", "ladki, kursi (chair), roti, gaadi (vehicle)"],
          ["-aa from Sanskrit", "feminine", "bhaasha (language), sevaa (service), kathaa (story)"],
          ["irregular", "varies — memorize", "aadmi/m, aurat/f, haath/m, kitaab/f, raat/f"]
        ]
      },
      "callout": { "tone": "warning", "body": "Pattern is a guide, not a rule. Common everyday nouns break it — `aadmi` (man) ends in `-i` but is masculine; `kitaab` (book) ends in a consonant but is feminine. Always learn the gender alongside the word." }
    },
    {
      "heading": "Adjective agreement",
      "body": "Hindi adjectives split into two camps: ones that change with the noun's gender, and ones that don't.\n\nAdjectives ending in -aa are the shape-shifters. They become -i for feminine, -e for masculine plural. `acchaa` → `acchhi` (f) → `acchhe` (m. pl.). `naya` → `nayi` (f) → `naye` (m. pl.).\n\nAdjectives that don't end in -aa (like `khush` happy, `laal` red, `theek` fine) stay frozen no matter what the noun is. You can use them with any gender and they won't change.",
      "examples": [
        { "hindi": "acchhaa khaana", "english": "good food", "breakdown": "khaana (m) + acchhaa (m form)" },
        { "hindi": "acchhi chai", "english": "good tea", "breakdown": "chai (f) + acchhi (f form)" },
        { "hindi": "naya kapda", "english": "new cloth/garment", "breakdown": "kapda (m) + naya (m form)" },
        { "hindi": "nayi saari", "english": "new saree", "breakdown": "saari (f) + nayi (f form)" },
        { "hindi": "laal kapda / laal saari", "english": "red cloth / red saree", "breakdown": "laal doesn't end in -aa, so no change regardless of gender" }
      ],
      "callout": { "tone": "tip", "body": "Hard rule: -aa adjectives always shift to match the noun. The shift is mechanical: -aa → -i for feminine, -aa → -e for masculine plural. Memorize this transform; you'll use it constantly." }
    },
    {
      "heading": "Verb agreement (the harder bit)",
      "body": "In the present continuous and present habitual, the verb agrees with the SUBJECT's gender. `Main jaa rahaa hoon` (I am going, masculine speaker) vs `main jaa rahi hoon` (I am going, feminine speaker). Same sentence, different gender of the speaker, different verb ending.\n\nIn the past tense with `ne` (the ergative-past construction), the verb agrees with the OBJECT's gender, not the subject's. This catches every English speaker off guard. `Maine roti khaayi` (roti is feminine, so the verb ends in `-i`) but `maine khaana khaaya` (khaana is masculine, so verb ends in `-a`). The subject `main` (I) hasn't changed — but the verb has, because the object did.",
      "examples": [
        { "hindi": "main jaa rahaa hoon", "english": "I'm going (masc. speaker)", "breakdown": "subject = main (1st person, here masc.); verb ending matches" },
        { "hindi": "main jaa rahi hoon", "english": "I'm going (fem. speaker)", "breakdown": "subject = main (1st person, here fem.); verb ending matches" },
        { "hindi": "maine roti khaayi", "english": "I ate roti", "breakdown": "object = roti (f); verb ending = -i (feminine), regardless of speaker gender" },
        { "hindi": "maine khaana khaaya", "english": "I ate the meal", "breakdown": "object = khaana (m); verb ending = -a (masculine), regardless of speaker gender" }
      ],
      "callout": { "tone": "note", "body": "The `ne` rule has its own foundation lesson. For now just notice: past-tense verbs with `ne` track the OBJECT's gender. Drill this; it's one of the top three things English speakers get wrong in Hindi." }
    },
    {
      "heading": "Gendering English loanwords",
      "body": "When Hindi borrows English nouns, speakers assign a gender based on what feels right — usually tracking a similar Hindi noun. The patterns aren't strict but they're consistent enough that you'll start guessing correctly.\n\nTech and machines tend masculine (tracking `yantra`). Foods and drinks tend feminine (tracking `chai`). Vehicles tend feminine (tracking `gaadi`). When you hear locals use one gender for a loanword, just memorize it and move on — these are stable.",
      "table": {
        "caption": "Common English loanwords and their adopted gender",
        "columns": ["word", "gender", "tracks"],
        "rows": [
          ["computer", "masculine", "yantra (machine, m)"],
          ["mobile / phone", "masculine", "yantra (m)"],
          ["car", "feminine", "gaadi (vehicle, f)"],
          ["bus", "feminine", "gaadi (f)"],
          ["coffee", "feminine", "chai (f)"],
          ["pizza", "masculine", "khaana (m)"],
          ["email", "masculine", "or `email aaya` (the email came-masc.)"]
        ]
      },
      "callout": { "tone": "tip", "body": "When in doubt, listen to which gender locals use — and lean masculine for tech/objects, feminine for foods/vehicles. Native speakers don't always agree on edge cases, so don't stress; pick one and be consistent." }
    }
  ],
  "wrap_up": "Gender isn't optional in Hindi — it's structural. The single most useful habit is to learn the gender WITH the noun, every time you encounter a new word. Write it like a flashcard: `kitaab (f) — book`, `aadmi (m) — man`. The phrases below give you practice spotting and applying gender in real conversations. Pay attention to adjective endings as you read them."
}
```

The existing fields in `07-noun-gender.json` (situation, skills, phrases, grammar_notes, culture_notes, skill_breakdown, practice_prompt, references) all stay. The `theory` field is added alongside them.

## 6. Files

### New
| Path | Responsibility |
|---|---|
| `components/lesson/TheoryView.tsx` | Renders a `Theory` block. Props: `theory`, `title`, `onStartPhrases`. Self-contained — composes inline sub-renders (table, example, callout) without needing separate component files. |
| `components/lesson/TheoryView.test.tsx` | Component tests (vitest + RTL): renders intro + sections + wrap-up, renders tables / examples / callouts when present, CTA calls `onStartPhrases`. |

### Modified
| Path | Change |
|---|---|
| `types/lesson.ts` | Add `Theory`, `TheorySection`, `TheoryTable`, `TheoryExample`, `TheoryCallout`, `CalloutTone` exports. Add optional `theory?: Theory` field to `Lesson`. |
| `content/foundations/07-noun-gender.json` | Add the `theory` block verbatim from Section 5. |
| `components/design/LessonChaiGalli.tsx` | If `lesson.theory` is defined AND the user is on the intro section, render `<TheoryView>` instead of the existing intro markup. CTA advances to phrases section. |
| `CLAUDE.md` | Add the new `Theory` types to the Pages / Libraries description. Note pilot status for Noun Gender. |
| `CONTENT.md` | Document the new optional `theory` block in the Schema section. Note Noun Gender as the first foundation to use it. |

### Deleted
None.

## 7. Validation

- `npx tsc --noEmit` clean — new optional field, no existing consumer broken
- `npx vitest run` — 270 existing tests still pass + new TheoryView tests (target 5-6 cases: renders intro, renders section heading, renders table with N rows, renders example with breakdown, renders each callout tone, CTA fires onStartPhrases)
- `node scripts/lint-design.mjs` clean — all colors via tokens, no raw hex
- Manual: open Noun Gender foundation → see chapter intro → scroll through 5 sections (each with appropriate table/examples/callout) → see wrap-up → tap "Got it — try the phrases →" → land in phrase carousel → reveal all phrases → mark-complete unlocks → completion celebration fires
- Open any other foundation (e.g. `01-numbers`) → behavior unchanged, goes straight to phrase carousel
- Open any situation lesson → behavior unchanged

## 8. Out of scope

- Beef up the other 8 foundations in this session (follow-up)
- Add theory to situation lessons (decided: foundations only)
- Inline grammar hints in situations that link back to foundations (future polish)
- Interactive theory drills (quiz inline / drag-and-drop) — read-only for MVP
- Markdown parser — body strings are plain prose with `\n\n` for paragraph breaks
- Devanagari script throughout the chapter — keep romanization to stay consistent with existing content
- Audio narration of theory paragraphs — TTS already works on phrases; chapter prose is for reading
- A `theory_completed` progress flag — completion is still gated on the phrase carousel, not the theory scroll

## 9. Risks

- **Authoring depth** — writing a real textbook chapter for one foundation is significant content work. The verbatim content in Section 5 is the deliverable. Implementer should drop it in and not paraphrase; the editorial work was done here.
- **Visual density of long-scroll chapter** — 5 sections × (heading + 2-3 paragraphs + table + examples + callout) is substantial vertical content. Mitigation: comfortable line-height, consistent spacing (16-20px between sections), the chapter feels like a book chapter, not a wall of text.
- **Lesson resume behavior** — if the user closes mid-theory and comes back, do they restart from the top of the chapter or pick up where they left? MVP: always start at top of chapter. Persistent scroll position is YAGNI for a chapter that takes 2-3 minutes to read.
- **Mark-complete UX** — user finishes theory but skips through phrases without revealing — they'll see the "reveal every phrase to unlock" hint per yesterday's gating change. This is correct behavior. The chapter doesn't bypass that gate.

## 10. Open questions

None — all settled.
