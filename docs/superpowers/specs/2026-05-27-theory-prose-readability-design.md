# Theory prose readability + renderer upgrade — design

**Date:** 2026-05-27
**Status:** Brainstormed, design approved, plan TBD
**Track:** Foundation theory chapters (Hindi)

## Problem

The foundation theory chapters teach real grammar, but the explanatory `body` prose is hard to digest in one read. Two compounding causes:

1. **The writing is dense + jargon-heavy.** A representative sentence from `02-present-tense` ("Forming the habitual" section): *"The suffix shifts with the subject's gender and number; the auxiliary shifts with the person."* Two technical claims, four jargon words (suffix, subject, auxiliary, person), one sentence. The reader has to parse it twice.

2. **The renderer can't format anything.** `body` is a flat string rendered by a bare `Paragraph` component (`components/lesson/TheoryView.tsx`) that just drops it into `<p>` tags. The content already contains markdown-style backticks (`` `karna` ``, `` `kar` ``, `` `tum` ``) meant to highlight Hindi tokens — but they render as **literal backtick characters** on screen (visible in the user's screenshot). There's no bold, no lists. So even well-intentioned structure in the source is invisible, and authors have no tools to make prose scannable.

The tables, worked-example blocks, tip/note/warning callouts, and quick-check micro-quizzes all render well and genuinely help. The gap is specifically the prose `body`.

## Goal

Make theory prose understandable in a single read while preserving 100% of the grammar being taught. Two waves:

1. **Renderer upgrade** — teach the `Paragraph` component a small markdown subset (token chips, bold, bullet lists) so the existing backtick syntax renders correctly and authors can make text scannable. Benefits all existing content immediately, both languages.
2. **Content rewrite** — rewrite the `body` prose of the 9 Hindi foundations using plain-language principles, leaning on the new formatting.

## Non-goals (deferred / excluded)

- **Dutch foundations (7).** Deferred to a later pass. Hindi is the track in active use.
- **Schema changes.** The markdown subset lives inside the existing `body` string. No new `TheorySection` fields.
- **Numbered-steps block type.** Bullets only (the brainstorm explicitly chose bullets over numbered steps).
- **Tables / examples / callouts / quick-checks.** They render well and stay as-is. Only `body` prose changes.
- **`cutting_intro` voice.** Cutting's 1-sentence section openers stay warm/casual — untouched.
- **Accuracy / content corrections.** This is a clarity-and-delivery pass. No grammar rule is changed, simplified-away, or dropped. Same completeness, clearer wording.
- **Glossary / tap-to-define tooltips.** Considered and rejected in brainstorm (a tap interrupts flow). Jargon is handled inline via "plain words first, term in parens."

## Architecture

### Wave 1 — renderer (`components/lesson/TheoryView.tsx`)

Replace the body of the `Paragraph` component with a small inline-markdown parser. It still splits the incoming string on `\n\n` into blocks, but each block is now classified and rendered:

- **Bullet block:** a block whose lines all start with `- ` (or `- `) renders as a `<ul>` of `<li>`s. Each `<li>`'s text runs through the inline parser below.
- **Paragraph block:** anything else renders as a `<p>` (existing styling: `FONTS.body`, 15px/16px, line-height 1.55, `ink60`/`ink`), with its text run through the inline parser.

Inline parser (applied to paragraph text and to each bullet's text), processed left-to-right into an array of React nodes:

- `` `token` `` (backtick-delimited) → a `<span>` "token chip": butter background (`COLORS.butter`), `FONTS.body` (or a mono stack if available — use `FONTS.body` to avoid a new font dep), `COLORS.ink`, `padding: '0 5px'`, `borderRadius: 6`, `border: BORDER.thin`-equivalent hairline, `whiteSpace: 'nowrap'`, slightly smaller font (0.92em). Renders the inner text without the backticks.
- `**bold**` (double-asterisk-delimited) → `<strong>` with `fontWeight: 800`, `color: COLORS.ink`.
- Plain runs → raw text nodes.

Parsing is deliberately simple: a single regex tokenization pass that recognizes `` `...` `` and `**...**`; no nesting (a bold span won't contain a chip and vice-versa — authors won't need it). Unmatched backticks/asterisks render literally (graceful). The parser is a pure helper function (e.g. `renderInline(text: string): ReactNode[]`) co-located in the file.

This is one file, one commit. Every existing theory `body` across all 16 foundations immediately renders backticks as chips. The dense prose stays dense until Wave 2, but the literal-backtick clutter is gone everywhere.

### Wave 2 — content rewrite (9 Hindi foundation JSONs)

Files: `content/foundations/01-numbers.json` … `09-ne-rule.json`. Only the `theory.sections[*].body` field of each section is rewritten. Everything else in each file is left byte-for-byte intact.

**Writing principles** (the rewrite brief):

1. **Plain words first, technical term in parentheses on first use.** "the helper word (auxiliary) — `hoon`/`hai`/`ho`/`hain`"; "the ending (suffix) — `-ta`/`-ti`/`-te`". After first use in a section, the plain word can stand alone.
2. **One idea per sentence.** Split compound/semicolon sentences.
3. **Dense "A does X; B does Y" → a bullet list.** Use the new `- ` syntax. Example: the present-tense habitual sentence becomes:
   ```
   **Two things change:**
   - the ending (`-ta`/`-ti`/`-te`) — shifts with gender + number
   - the helper word (`hoon`/`hai`/`ho`/`hain`) — shifts with the pronoun
   ```
4. **Concrete beside abstract.** Put the worked example next to the rule it illustrates, not paragraphs away.
5. **Lead with the recipe / what-changes, then the why.**
6. **Wrap every Hindi token in backtick chips; bold the key English concept** (sparingly — one or two per paragraph).
7. **Preserve all grammar.** Same rules, same coverage, same accuracy. No simplification of *what* is taught — only *how* it's delivered. If a section teaches an edge case, the rewrite still teaches that edge case.
8. **Keep it short.** Prefer fewer words. A rewrite that's longer than the original is usually wrong unless it converted prose to a (longer but scannable) bullet list.

**Rollout:**
- The author (this session) rewrites `02-present-tense` by hand first, as the **reference exemplar**. It appears in full in the implementation plan so the user sees the target style before anything scales.
- The other 8 Hindi foundations are rewritten by **parallel Sonnet subagents**, each given: the file path, the writing principles above, the present-tense exemplar, and an instruction to touch only `body` fields. Modeled on the prior phrase-dedup audit dispatch.

## Testing / verification

- `npx tsc --noEmit` clean after the renderer change.
- `npm run lint:design` clean (the token-chip styling uses palette tokens; any literal hex needs a `@design-allow` note — prefer `COLORS.butter` etc.).
- `npx vitest run` stays green (243 tests). The existing `theory-view.test.tsx` component test must still pass; if it asserts on raw backtick text it gets updated to assert on the chip rendering.
- JSON validity: each rewritten foundation must `JSON.parse` cleanly (subagents write valid JSON; a quick `node -e` parse loop confirms all 9 after the wave).
- Manual eyeball: open `02-present-tense` theory in dev, confirm chips/bold/bullets render and the habitual section reads in one pass. Spot-check 2-3 of the subagent-rewritten foundations.

## Rollout summary

1. **Wave 1 (renderer):** upgrade `Paragraph` → markdown-subset parser. Commit. Ships the backtick fix for everything.
2. **Wave 2 (content):** hand-rewrite `02-present-tense` as exemplar → commit. Dispatch 8 parallel Sonnet subagents for `01, 03, 04, 05, 06, 07, 08, 09` → review their reports → commit. 
3. Update CLAUDE.md + CONTENT.md.

Waves are independent and individually shippable: Wave 1 alone is a clean improvement; Wave 2 depends on Wave 1's syntax being live.

## Future follow-ups (out of scope here)

- Dutch foundations (7) get the same rewrite pass.
- Possible `examples`/`callout` prose could adopt the same inline parser if it ever gains backtick syntax (today they have their own renderers; not needed).
- Numbered-steps block type if recipe-style content proves to want ordering beyond bullets.
