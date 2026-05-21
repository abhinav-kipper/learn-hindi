# Multi-Language Dutch Extension Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Dutch as a second language to the Bolna Seekho app, co-existing alongside Hindi with fully separate progress, a persistent language switcher in the UI, and a grammar-tutor practice mode tailored for Dutch beginners.

**Architecture:** Parallel language modules — Hindi code is untouched, Dutch gets its own content directory and lib modules. A `LanguageContext` is the only new shared infrastructure; everything else is additive.

**User context:** Complete Dutch beginner living in the Netherlands. Wants foundations-first learning (grammar structure + pronunciation + building blocks). Practice chat is tutor mode (explain, drill, correct) not Hindi-style roleplay scenarios. Slightly mixed register — colloquial for daily life, polite enough for official settings.

---

## Section 1: Language Switching

- A `LanguageContext` wraps the whole app in `app/layout.tsx`, holding the active language (`'hindi' | 'dutch'`) persisted to localStorage key `app-active-language`.
- Defaults to `'hindi'` on first visit — no change for existing users.
- The language switcher lives in the **bottom nav** as a small flag/pill (🇮🇳 / 🇳🇱). One tap switches languages instantly with no page reload.
- All existing routes (`/lessons/[id]`, `/practice/[id]`, `/quiz`, `/vocabulary`, `/progress`) serve content for the active language. URLs do not encode language.
- Dutch onboarding: if switching to Dutch for the first time, a lightweight screen fires (name already known, just sets Dutch daily goal and shows welcome). Hindi onboarding is unchanged.

## Section 2: Content Structure

**Directory layout:**
```
content/
  lessons/          ← Hindi situations (unchanged)
  foundations/      ← Hindi foundations (unchanged)
  vocabulary.json   ← Hindi vocab (unchanged)
  dutch/
    lessons/        ← Dutch situations (5 files)
    foundations/    ← Dutch foundations (7 files)
    vocabulary.json ← Dutch vocab categories
```

**Dutch content uses same `Lesson` JSON shape** as Hindi, with `dutch` as the target language field name instead of `hindi`.

**Dutch Foundations (7 lessons — priority):**
1. Numbers, days, months, time
2. Pronunciation guide (g/ch sounds, ui/ij/ou vowels, linking)
3. Present tense conjugation (regular verbs + hebben/zijn)
4. De/het gender system + articles + adjective agreement
5. Word order (V2 rule, separable verbs, subordinate clauses)
6. Past tense (perfect tense with hebben vs zijn)
7. Core verbs (willen, kunnen, moeten, gaan, komen, zijn, hebben)

**Dutch Situations (5 lessons — daily Netherlands life, mixed register):**
1. Supermarket & daily errands
2. Introducing yourself (neighbors, colleagues)
3. Café & restaurant
4. Doctor & pharmacy
5. Public transport

**Content loaders:**
- `lib/dutch/lessons.ts` — mirrors `lib/lessons.ts`, loads Dutch situation content
- `lib/dutch/foundations.ts` — mirrors `lib/foundations.ts`, loads Dutch foundation content

## Section 3: Dutch Practice Chat (Tutor Mode)

The `/practice/[id]` page UI is identical for both languages. The system prompt sent to Gemini differs:

**Dutch tutor mode system prompt (`lib/system-prompt-dutch.ts`):**
- AI is a patient Dutch grammar tutor, not a roleplay character
- Opens by introducing the lesson's core concept, then invites practice
- Drills conjugations, word order, and grammar patterns interactively
- Corrects Dutch attempts with explanation ("almost — use 'zijn' here because motion verbs take zijn in perfect tense")
- Always provides English alongside Dutch (beginner-appropriate)
- Register: patient, clear, slightly formal — not slang-heavy
- Example opener: "Laten we beginnen! Today we're working on [topic]. Here's the core pattern — let's practice it together."

The Finish button, completion overlay, `markLessonComplete`, `updateStreak`, and `incrementPracticeCount` all work identically, just namespaced to Dutch storage keys.

## Section 4: Storage Isolation

**Hindi keys — completely unchanged:**
```
hindi-progress
hindi-phrase-progress
hindi-vocab-learned
hindi-quiz-scores
hindi-review-data
hindi-review-sessions
hindi-notification-pref
hindi-last-reminder-scheduled
hindi-user-profile       ← shared (name, daily goal)
```

**Dutch parallel keys:**
```
dutch-progress
dutch-phrase-progress
dutch-vocab-learned
dutch-quiz-scores
dutch-review-data
dutch-review-sessions
```

**New neutral key:**
```
app-active-language      ← 'hindi' | 'dutch', defaults to 'hindi'
```

Streak is per-language and shown for the active language only. Name and daily goal from `hindi-user-profile` are shared across languages (one user, one profile). Dutch daily goal can be added later if needed.

All existing `lib/` functions accept storage keys as constants. Pages and components read the active language from `useLanguage()` and pass the correct prefixed key (e.g. `dutch-progress`) when calling lib functions — no wrapper layer needed.

## Section 5: Shared vs Language-Specific

**Shared — untouched:**
- All UI components (`lesson-card`, `phrase-card`, `chat-message`, `quiz-card`, `bottom-nav`, `layout-shell`, etc.)
- Quiz engine logic (`lib/quiz.ts`)
- Review systems (`lib/review.ts`, `lib/vocab-review.ts`)
- Sounds, animations, confetti
- All app routes (serve active-language content via context)

**Language-specific — new Dutch files only:**
- `content/dutch/foundations/` (7 JSON files)
- `content/dutch/lessons/` (5 JSON files)
- `content/dutch/vocabulary.json`
- `lib/dutch/lessons.ts`
- `lib/dutch/foundations.ts`
- `lib/system-prompt-dutch.ts`
- `app/api/tts/route.ts` updated to accept `?lang=nl` param (returns `nl-NL` audio)

**New shared infrastructure — minimal:**
- `lib/language-context.tsx` — React context + `useLanguage()` hook, persists active language
- `lib/language-config.ts` — per-language config object (name, flag emoji, TTS locale, target field name)
- `components/bottom-nav.tsx` — updated with language switcher pill

## Out of Scope (YAGNI)

- Per-language daily goal (shared profile is sufficient for now)
- Dutch vocabulary swipe review (can add after content exists)
- Dutch-specific quiz types beyond the existing 4
- Any Dutch-specific onboarding beyond a welcome screen
- Devanagari/script handling (Dutch is Latin alphabet natively)
