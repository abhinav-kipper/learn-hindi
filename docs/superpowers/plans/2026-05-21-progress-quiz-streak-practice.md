# Progress + Quiz + Streak + Practice-Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement four hindi-app improvements as a single batch — phrase-level lesson progress, vocabulary in quizzes, streak calendar fixes, and a practice-complete celebration that also fixes three latent bugs.

**Architecture:** Each item is largely independent. Section 1 adds a new `lib/phrase-progress.ts` module + wires it through the lesson-flow carousel. Section 2 refactors `lib/quiz.ts` to interleave vocabulary questions. Section 3 fixes pure logic in the progress page streak calendar. Section 4 adds a Finish button + completion modal to the practice page and centralizes lesson-completion side effects there.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, Framer Motion, canvas-confetti, Vitest + jsdom for unit tests.

---

## File Structure

**Section 1 — Phrase progress:**
- Create: `lib/phrase-progress.ts`
- Create: `__tests__/lib/phrase-progress.test.ts`
- Modify: `components/lesson-flow/swipeable-carousel.tsx`
- Modify: `components/lesson-flow/section-phrases.tsx`
- Modify: `components/lesson-flow/lesson-flow.tsx`
- Modify: `app/progress/page.tsx`

**Section 2 — Vocab in quiz:**
- Modify: `lib/vocabulary.ts`
- Modify: `types/quiz.ts`
- Modify: `lib/quiz.ts`
- Create: `__tests__/lib/quiz.test.ts`

**Section 3 — Streak calendar fix:**
- Modify: `app/progress/page.tsx`

**Section 4 — Practice complete:**
- Modify: `app/practice/[id]/page.tsx`

---

## Section 1 — Phrase-Level Progress

### Task 1: Create phrase-progress module with tests

**Files:**
- Create: `lib/phrase-progress.ts`
- Create: `__tests__/lib/phrase-progress.test.ts`

- [ ] **Step 1.1: Write failing tests**

Create `__tests__/lib/phrase-progress.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  markPhraseViewed,
  getViewedPhrases,
  getLessonPercent,
} from '@/lib/phrase-progress'
import type { Lesson } from '@/types/lesson'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

function makeLesson(id: string, phraseCount: number): Lesson {
  return {
    id,
    title: 'Test',
    situation: 'test',
    skills: [],
    phrases: Array.from({ length: phraseCount }, (_, i) => ({
      hindi: `h${i}`,
      english: `e${i}`,
      context: `c${i}`,
      pronunciation: `p${i}`,
    })),
    grammar_notes: [],
    culture_notes: [],
    skill_breakdown: [],
    practice_prompt: '',
  }
}

describe('phrase-progress', () => {
  beforeEach(() => localStorage.clear())

  it('records viewed phrase indices', () => {
    markPhraseViewed('greetings', 0)
    markPhraseViewed('greetings', 2)
    expect(getViewedPhrases('greetings').sort()).toEqual([0, 2])
  })

  it('deduplicates repeated views', () => {
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 1)
    expect(getViewedPhrases('greetings')).toEqual([1])
  })

  it('isolates progress per lesson', () => {
    markPhraseViewed('greetings', 0)
    markPhraseViewed('food', 0)
    markPhraseViewed('food', 1)
    expect(getViewedPhrases('greetings')).toEqual([0])
    expect(getViewedPhrases('food').sort()).toEqual([0, 1])
  })

  it('returns empty array for unknown lesson', () => {
    expect(getViewedPhrases('never-seen')).toEqual([])
  })

  it('getLessonPercent computes from viewed phrases', () => {
    const lesson = makeLesson('greetings', 10)
    markPhraseViewed('greetings', 0)
    markPhraseViewed('greetings', 1)
    markPhraseViewed('greetings', 2)
    expect(getLessonPercent(lesson)).toBe(30)
  })

  it('getLessonPercent returns 100 if lesson is in completedLessons (back-compat)', () => {
    localStorage.setItem('hindi-progress', JSON.stringify({
      completedLessons: ['greetings'],
      currentStreak: 0,
      lastActiveDate: '',
      practiceSessionCount: 0,
    }))
    const lesson = makeLesson('greetings', 10)
    expect(getLessonPercent(lesson)).toBe(100)
  })

  it('getLessonPercent returns 0 for unseen, incomplete lesson', () => {
    const lesson = makeLesson('greetings', 10)
    expect(getLessonPercent(lesson)).toBe(0)
  })

  it('getLessonPercent rounds to nearest integer', () => {
    const lesson = makeLesson('greetings', 3)
    markPhraseViewed('greetings', 0)
    // 1/3 = 33.333..., rounded to 33
    expect(getLessonPercent(lesson)).toBe(33)
  })
})
```

- [ ] **Step 1.2: Run the tests to verify they fail**

Run: `npx vitest run __tests__/lib/phrase-progress.test.ts`
Expected: FAIL — module not found / functions undefined.

- [ ] **Step 1.3: Implement the module**

Create `lib/phrase-progress.ts`:

```ts
import type { Lesson } from '@/types/lesson'
import { getProgress } from '@/lib/progress'

const STORAGE_KEY = 'hindi-phrase-progress'

type ViewedMap = Record<string, number[]>

function loadMap(): ViewedMap {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as ViewedMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveMap(map: ViewedMap): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function markPhraseViewed(lessonId: string, phraseIndex: number): void {
  const map = loadMap()
  const existing = map[lessonId] ?? []
  if (!existing.includes(phraseIndex)) {
    map[lessonId] = [...existing, phraseIndex]
    saveMap(map)
  }
}

export function getViewedPhrases(lessonId: string): number[] {
  const map = loadMap()
  return map[lessonId] ?? []
}

export function getLessonPercent(lesson: Lesson): number {
  const progress = getProgress()
  if (progress.completedLessons.includes(lesson.id)) {
    return 100
  }
  const total = lesson.phrases.length
  if (total === 0) return 0
  const viewed = getViewedPhrases(lesson.id).length
  return Math.round((viewed / total) * 100)
}
```

- [ ] **Step 1.4: Run the tests to verify they pass**

Run: `npx vitest run __tests__/lib/phrase-progress.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 1.5: Commit**

```bash
git add lib/phrase-progress.ts __tests__/lib/phrase-progress.test.ts
git commit -m "feat: add phrase-level progress tracking module

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Wire phrase-viewed tracking into the carousel

**Files:**
- Modify: `components/lesson-flow/swipeable-carousel.tsx`

- [ ] **Step 2.1: Add onIndexChange prop to carousel**

In `components/lesson-flow/swipeable-carousel.tsx`, change the props interface and the component to accept and fire an `onIndexChange` callback. Replace the entire file with:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/lib/sounds'

interface SwipeableCarouselProps {
  items: React.ReactNode[]
  onComplete?: () => void
  onIndexChange?: (index: number) => void
}

export function SwipeableCarousel({ items, onComplete, onIndexChange }: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  const next = () => {
    if (currentIndex < items.length - 1) {
      setDirection(1)
      setCurrentIndex(i => i + 1)
      playSound('swipe')
    } else if (onComplete) {
      onComplete()
    }
  }

  const prev = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(i => i - 1)
      playSound('swipe')
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  }

  return (
    <div className="flex flex-col items-center flex-1">
      {/* Card area */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 || info.velocity.x < -500) next()
              else if (info.offset.x > 50 || info.velocity.x > 500) prev()
            }}
            className="absolute w-full px-6"
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + counter */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-[var(--accent)] scale-125' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">{currentIndex + 1} / {items.length}</p>
      </div>
    </div>
  )
}
```

The only change is: adding `useEffect` import, the `onIndexChange` prop, and the effect that fires it.

- [ ] **Step 2.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 2.3: Commit**

```bash
git add components/lesson-flow/swipeable-carousel.tsx
git commit -m "feat: add onIndexChange callback to SwipeableCarousel

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Wire SectionPhrases to mark phrases viewed

**Files:**
- Modify: `components/lesson-flow/section-phrases.tsx`
- Modify: `components/lesson-flow/lesson-flow.tsx`

- [ ] **Step 3.1: Add lessonId prop to SectionPhrases and wire callback**

In `components/lesson-flow/section-phrases.tsx`, update the `SectionPhrasesProps` interface and the component signature. Find the existing interface:

```tsx
interface SectionPhrasesProps {
  phrases: Phrase[]
  grammarNotes: string[]
  cultureNotes: string[]
  onNext: () => void
}
```

Replace with:

```tsx
interface SectionPhrasesProps {
  lessonId: string
  phrases: Phrase[]
  grammarNotes: string[]
  cultureNotes: string[]
  onNext: () => void
}
```

Add the import at the top of the file (after the existing imports):

```tsx
import { markPhraseViewed } from '@/lib/phrase-progress'
```

Find the existing function signature:

```tsx
export function SectionPhrases({ phrases, grammarNotes, cultureNotes, onNext }: SectionPhrasesProps) {
```

Replace with:

```tsx
export function SectionPhrases({ lessonId, phrases, grammarNotes, cultureNotes, onNext }: SectionPhrasesProps) {
```

Find the existing `SwipeableCarousel` invocation at the bottom of the file:

```tsx
<SwipeableCarousel items={carouselItems} onComplete={onNext} />
```

Replace with:

```tsx
<SwipeableCarousel
  items={carouselItems}
  onComplete={onNext}
  onIndexChange={(i) => markPhraseViewed(lessonId, i)}
/>
```

- [ ] **Step 3.2: Pass lessonId down from lesson-flow**

In `components/lesson-flow/lesson-flow.tsx`, find the `renderSection` function:

```tsx
const renderSection = () => {
  switch (currentSection) {
    case 'intro': return <SectionIntro lesson={lesson} onNext={goNext} />
    case 'phrases': return (
      <SectionPhrases
        phrases={lesson.phrases}
        grammarNotes={lesson.grammar_notes}
        cultureNotes={lesson.culture_notes}
        onNext={goNext}
      />
    )
    case 'cta': return <SectionCta lesson={lesson} />
  }
}
```

Replace the phrases case with:

```tsx
case 'phrases': return (
  <SectionPhrases
    lessonId={lesson.id}
    phrases={lesson.phrases}
    grammarNotes={lesson.grammar_notes}
    cultureNotes={lesson.culture_notes}
    onNext={goNext}
  />
)
```

- [ ] **Step 3.3: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3.4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (3 existing test files + the new phrase-progress tests).

- [ ] **Step 3.5: Commit**

```bash
git add components/lesson-flow/section-phrases.tsx components/lesson-flow/lesson-flow.tsx
git commit -m "feat: track viewed phrases per lesson via carousel index changes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Display phrase-level percent on progress page

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 4.1: Import getLessonPercent and replace binary % logic**

In `app/progress/page.tsx`, add the import:

```tsx
import { getLessonPercent } from '@/lib/phrase-progress'
```

Find the two lesson-progress rendering blocks (one for `lessons` (Situations), one for `foundations`). Each currently renders:

```tsx
{lessons.map((lesson) => {
  const isComplete = stats && getProgress().completedLessons.includes(lesson.id)
  return (
    <div key={lesson.id}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
        <span className="text-[var(--text-tertiary)]">{isComplete ? '100%' : '0%'}</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isComplete ? '100%' : '0%' }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`h-full rounded-full ${
            isComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-[var(--border)]'
          }`}
        />
      </div>
    </div>
  )
})}
```

Replace the `lessons.map` block with:

```tsx
{lessons.map((lesson) => {
  const pct = getLessonPercent(lesson)
  const isComplete = pct === 100
  const hasProgress = pct > 0
  return (
    <div key={lesson.id}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
        <span className="text-[var(--text-tertiary)]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
              : hasProgress
                ? 'bg-gradient-to-r from-indigo-400 to-violet-500'
                : 'bg-[var(--border)]'
          }`}
        />
      </div>
    </div>
  )
})}
```

And replace the `foundations.map` block analogously (same code, but use the violet→indigo gradient when complete to match the existing visual pattern):

```tsx
{foundations.map((lesson) => {
  const pct = getLessonPercent(lesson)
  const isComplete = pct === 100
  const hasProgress = pct > 0
  return (
    <div key={lesson.id}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)] truncate mr-2">{lesson.title}</span>
        <span className="text-[var(--text-tertiary)]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-violet-400 to-indigo-500'
              : hasProgress
                ? 'bg-gradient-to-r from-indigo-300 to-violet-400'
                : 'bg-[var(--border)]'
          }`}
        />
      </div>
    </div>
  )
})}
```

- [ ] **Step 4.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4.3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4.4: Commit**

```bash
git add app/progress/page.tsx
git commit -m "feat: render phrase-level percent on lesson progress bars

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Section 2 — Vocabulary in Quiz

### Task 5: Add getExploredVocabWords helper

**Files:**
- Modify: `lib/vocabulary.ts`

- [ ] **Step 5.1: Append helper to vocabulary.ts**

In `lib/vocabulary.ts`, add this function at the end of the file:

```ts
/**
 * Returns all vocabulary words the user has explored (tapped/flipped at least once)
 * across all categories. Each word is flattened with its category id for context.
 */
export function getExploredVocabWords(): VocabWord[] {
  const learned = getLearnedWords()
  const explored: VocabWord[] = []
  for (const cat of vocabularyData.categories) {
    const learnedInCat = learned[cat.id] ?? []
    for (const word of cat.words) {
      if (learnedInCat.includes(word.hindi)) {
        explored.push(word as VocabWord)
      }
    }
  }
  return explored
}
```

- [ ] **Step 5.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5.3: Commit**

```bash
git add lib/vocabulary.ts
git commit -m "feat: add getExploredVocabWords helper for quiz integration

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Add source discriminator to quiz types

**Files:**
- Modify: `types/quiz.ts`

- [ ] **Step 6.1: Add optional source field**

In `types/quiz.ts`, find:

```ts
export interface QuizQuestion {
  id: string
  type: QuizType
  prompt: string
  subPrompt?: string
  answers: QuizAnswer[]
  lessonId: string
  phraseIndex: number
}
```

Replace with:

```ts
export interface QuizQuestion {
  id: string
  type: QuizType
  prompt: string
  subPrompt?: string
  answers: QuizAnswer[]
  lessonId: string
  phraseIndex: number
  source?: 'phrase' | 'vocab'
}
```

- [ ] **Step 6.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6.3: Commit**

```bash
git add types/quiz.ts
git commit -m "feat: add optional source discriminator to QuizQuestion

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Write quiz vocab tests (failing)

**Files:**
- Create: `__tests__/lib/quiz.test.ts`

- [ ] **Step 7.1: Write failing tests for vocab mixing**

Create `__tests__/lib/quiz.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { generateQuiz } from '@/lib/quiz'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('generateQuiz', () => {
  beforeEach(() => localStorage.clear())

  it('returns lesson-only questions when no vocab has been explored', () => {
    const questions = generateQuiz(['greetings'], 10)
    expect(questions.length).toBeGreaterThan(0)
    for (const q of questions) {
      expect(q.source ?? 'phrase').toBe('phrase')
    }
  })

  it('mixes ~30% vocab questions when enough vocab is explored', () => {
    // Mark 5 vocabulary words as explored across categories
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek', 'bas', 'bilkul', 'zaroor'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    const vocabCount = questions.filter(q => q.source === 'vocab').length
    // 30% of 10 = 3; allow flex if pool is smaller
    expect(vocabCount).toBeGreaterThanOrEqual(1)
    expect(vocabCount).toBeLessThanOrEqual(3)
  })

  it('falls back to phrases-only when fewer than 3 vocab words are explored', () => {
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    for (const q of questions) {
      expect(q.source ?? 'phrase').toBe('phrase')
    }
  })

  it('never emits fill-in-blank for vocab source', () => {
    localStorage.setItem('hindi-vocab-learned', JSON.stringify({
      everyday: ['accha', 'theek', 'bas', 'bilkul', 'zaroor'],
    }))

    const questions = generateQuiz(['greetings'], 10)
    for (const q of questions) {
      if (q.source === 'vocab') {
        expect(q.type).not.toBe('fill-in-blank')
      }
    }
  })

  it('returns empty array when no lessons match', () => {
    const questions = generateQuiz(['nonexistent-lesson'], 10)
    expect(questions).toEqual([])
  })
})
```

- [ ] **Step 7.2: Run the tests to confirm they fail**

Run: `npx vitest run __tests__/lib/quiz.test.ts`
Expected: Several FAIL (the new "mixes ~30% vocab" test will fail because vocab is not currently emitted; others may pass coincidentally).

- [ ] **Step 7.3: Commit**

```bash
git add __tests__/lib/quiz.test.ts
git commit -m "test: add failing tests for vocab integration in quiz generator

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Refactor generateQuiz to mix vocabulary

**Files:**
- Modify: `lib/quiz.ts`

- [ ] **Step 8.1: Replace the quiz generators to support both sources**

Replace the entire content of `lib/quiz.ts` with:

```ts
import { QuizQuestion, QuizAnswer, QuizType } from '@/types/quiz'
import { getAllContent } from '@/lib/lessons'
import { Phrase } from '@/types/lesson'
import { getExploredVocabWords, VocabWord } from '@/lib/vocabulary'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  const filtered = exclude ? arr.filter(item => !exclude.includes(item)) : arr
  return shuffle(filtered).slice(0, count)
}

interface PhraseTarget {
  source: 'phrase'
  hindi: string
  english: string
  context: string
  lessonId: string
  phraseIndex: number
}

interface VocabTarget {
  source: 'vocab'
  hindi: string
  english: string
  context: string // we map vocab.example -> context for context-match
  lessonId: string // synthetic ("vocab")
  phraseIndex: number // -1 to signal not a real phrase
}

type Target = PhraseTarget | VocabTarget

function phrasesToTargets(lessonIds?: string[]): PhraseTarget[] {
  const lessons = getAllContent()
  const filtered = lessonIds ? lessons.filter(l => lessonIds.includes(l.id)) : lessons
  const targets: PhraseTarget[] = []
  for (const lesson of filtered) {
    lesson.phrases.forEach((phrase: Phrase, index: number) => {
      targets.push({
        source: 'phrase',
        hindi: phrase.hindi,
        english: phrase.english,
        context: phrase.context,
        lessonId: lesson.id,
        phraseIndex: index,
      })
    })
  }
  return targets
}

function vocabToTargets(): VocabTarget[] {
  const explored = getExploredVocabWords()
  return explored.map((word: VocabWord) => ({
    source: 'vocab' as const,
    hindi: word.hindi,
    english: word.english,
    context: word.example,
    lessonId: 'vocab',
    phraseIndex: -1,
  }))
}

function generateTranslateToEnglish(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.english, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.english, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'translate-to-english',
    prompt: target.hindi,
    subPrompt: 'What does this mean in English?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

function generateTranslateToHindi(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.hindi, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.hindi, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'translate-to-hindi',
    prompt: target.english,
    subPrompt: 'How do you say this in Hindi?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

function generateFillInBlank(target: PhraseTarget, allPhrases: PhraseTarget[]): QuizQuestion {
  const words = target.hindi.split(' ')
  if (words.length < 2) {
    return generateTranslateToEnglish(target, allPhrases)
  }
  const blankIndex = Math.floor(Math.random() * words.length)
  const correctWord = words[blankIndex]
  const blankedPhrase = words.map((w, i) => (i === blankIndex ? '___' : w)).join(' ')

  const otherWords = allPhrases
    .flatMap(p => p.hindi.split(' '))
    .filter(w => w !== correctWord && w.length > 1)
  const wrongWords = pickRandom([...new Set(otherWords)], 3)

  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: correctWord, isCorrect: true },
    ...wrongWords.map(w => ({ id: randomId(), text: w, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'fill-in-blank',
    prompt: blankedPhrase,
    subPrompt: `Fill in the blank: "${target.english}"`,
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: 'phrase',
  }
}

function generateContextMatch(target: Target, pool: Target[]): QuizQuestion {
  const wrong = pickRandom(pool, 3, [target])
  const answers: QuizAnswer[] = shuffle([
    { id: randomId(), text: target.hindi, isCorrect: true },
    ...wrong.map(p => ({ id: randomId(), text: p.hindi, isCorrect: false })),
  ])
  return {
    id: randomId(),
    type: 'context-match',
    prompt: target.context,
    subPrompt: 'Which phrase fits this situation?',
    answers,
    lessonId: target.lessonId,
    phraseIndex: target.phraseIndex,
    source: target.source,
  }
}

const phraseQuizTypes: QuizType[] = ['translate-to-english', 'translate-to-hindi', 'fill-in-blank', 'context-match']
const vocabQuizTypes: QuizType[] = ['translate-to-english', 'translate-to-hindi', 'context-match']

function makePhraseQuestion(target: PhraseTarget, pool: PhraseTarget[]): QuizQuestion {
  const type = phraseQuizTypes[Math.floor(Math.random() * phraseQuizTypes.length)]
  switch (type) {
    case 'translate-to-english': return generateTranslateToEnglish(target, pool)
    case 'translate-to-hindi': return generateTranslateToHindi(target, pool)
    case 'fill-in-blank': return generateFillInBlank(target, pool)
    case 'context-match': return generateContextMatch(target, pool)
  }
}

function makeVocabQuestion(target: VocabTarget, pool: VocabTarget[]): QuizQuestion {
  const type = vocabQuizTypes[Math.floor(Math.random() * vocabQuizTypes.length)]
  switch (type) {
    case 'translate-to-english': return generateTranslateToEnglish(target, pool)
    case 'translate-to-hindi': return generateTranslateToHindi(target, pool)
    case 'context-match': return generateContextMatch(target, pool)
    default: return generateTranslateToEnglish(target, pool)
  }
}

export function generateQuiz(lessonIds: string[], count: number): QuizQuestion[] {
  const phraseTargets = phrasesToTargets(lessonIds)
  if (phraseTargets.length === 0) return []

  const vocabTargets = vocabToTargets()
  // Need >=3 vocab to mix (so we can build 3 distractors)
  const canMixVocab = vocabTargets.length >= 3

  let vocabCount = canMixVocab ? Math.round(count * 0.3) : 0
  vocabCount = Math.min(vocabCount, vocabTargets.length)
  const phraseCount = count - vocabCount

  const allPhrasePool = phrasesToTargets() // distractor pool: all phrases (not just selected lessons)

  const selectedPhrases = shuffle(phraseTargets).slice(0, phraseCount)
  const selectedVocab = shuffle(vocabTargets).slice(0, vocabCount)

  const phraseQuestions = selectedPhrases.map(t => makePhraseQuestion(t, allPhrasePool))
  const vocabQuestions = selectedVocab.map(t => makeVocabQuestion(t, vocabTargets))

  return shuffle([...phraseQuestions, ...vocabQuestions])
}

// Store quiz scores in localStorage
const QUIZ_SCORES_KEY = 'hindi-quiz-scores'

export interface QuizScore {
  score: number
  total: number
  date: string
  lessonIds: string[]
}

export function saveQuizScore(score: number, total: number, lessonIds: string[]): void {
  if (typeof window === 'undefined') return
  const scores = getQuizScores()
  scores.push({ score, total, date: new Date().toISOString(), lessonIds })
  const trimmed = scores.slice(-50)
  localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(trimmed))
}

export function getQuizScores(): QuizScore[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(QUIZ_SCORES_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as QuizScore[]
  } catch {
    return []
  }
}

export function getAverageQuizScore(): number {
  const scores = getQuizScores()
  if (scores.length === 0) return 0
  const total = scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0)
  return Math.round(total / scores.length)
}
```

- [ ] **Step 8.2: Run quiz tests to verify they pass**

Run: `npx vitest run __tests__/lib/quiz.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 8.3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 8.4: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 8.5: Commit**

```bash
git add lib/quiz.ts
git commit -m "feat: mix vocabulary questions (30%) into generated quizzes

Pulls from words user has explored. Falls back to phrases-only if
fewer than 3 vocab words have been explored. Never emits fill-in-blank
for single-word vocab entries.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Section 3 — Streak Calendar Fix

### Task 9: Fix day labels, DST drift, add pending-today state

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 9.1: Replace streak calendar logic and rendering**

In `app/progress/page.tsx`, find this block (inside the `useEffect`):

```tsx
// Build streak calendar (last 7 days)
const today = new Date()
const days: boolean[] = []
for (let i = 6; i >= 0; i--) {
  const d = new Date(today)
  d.setDate(d.getDate() - i)
  const dateStr = d.toISOString().split('T')[0]
  // A day is active if it's the lastActiveDate or within the streak
  if (progress.lastActiveDate && progress.currentStreak > 0) {
    const lastActive = new Date(progress.lastActiveDate)
    const daysDiff = Math.floor((lastActive.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    days.push(daysDiff >= 0 && daysDiff < progress.currentStreak)
  } else {
    days.push(false)
  }
}
setStreakDays(days)
```

Replace with:

```tsx
// Build streak calendar (last 7 days) — DST-safe, using YYYY-MM-DD comparison
const todayStr = new Date().toISOString().split('T')[0]
const activeSet = new Set<string>()
if (progress.lastActiveDate && progress.currentStreak > 0) {
  const last = new Date(progress.lastActiveDate)
  for (let i = 0; i < progress.currentStreak; i++) {
    const d = new Date(last)
    d.setDate(d.getDate() - i)
    activeSet.add(d.toISOString().split('T')[0])
  }
}

const dayStates: Array<'active' | 'pending' | 'inactive'> = []
const todayDate = new Date()
for (let i = 6; i >= 0; i--) {
  const d = new Date(todayDate)
  d.setDate(d.getDate() - i)
  const dateStr = d.toISOString().split('T')[0]
  if (activeSet.has(dateStr)) {
    dayStates.push('active')
  } else if (dateStr === todayStr && progress.currentStreak > 0) {
    // Streak is alive (yesterday counted) but user hasn't acted today yet
    dayStates.push('pending')
  } else {
    dayStates.push('inactive')
  }
}
setStreakDays(dayStates)
```

Now find the existing state declaration:

```tsx
const [streakDays, setStreakDays] = useState<boolean[]>([])
```

Replace with:

```tsx
const [streakDays, setStreakDays] = useState<Array<'active' | 'pending' | 'inactive'>>([])
```

Now find the calendar day labels block:

```tsx
const lessons = getAllLessons()
const foundations = getAllFoundations()
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const today = new Date().getDay()
const reorderedLabels = [...Array(7)].map((_, i) => {
  const idx = (today - 6 + i + 7) % 7
  return dayLabels[idx]
})
```

Replace with:

```tsx
const lessons = getAllLessons()
const foundations = getAllFoundations()
// Sun-indexed array so dayLabels[getDay()] gives the correct letter (Sun=S, Mon=M, ...)
const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const todayDow = new Date().getDay()
const reorderedLabels = [...Array(7)].map((_, i) => {
  // Column i shows the date that is (6 - i) days ago, so its DoW is (todayDow - (6 - i)) mod 7
  const idx = (todayDow - (6 - i) + 7) % 7
  return dayLabels[idx]
})
```

Now find the streak day rendering block:

```tsx
<div className="flex justify-between">
  {streakDays.map((active, i) => (
    <div key={i} className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        active ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-300'
      }`}>
        {reorderedLabels[i]}
      </div>
    </div>
  ))}
</div>
```

Replace with:

```tsx
<div className="flex justify-between">
  {streakDays.map((state, i) => (
    <div key={i} className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        state === 'active'
          ? 'bg-orange-400 text-white'
          : state === 'pending'
            ? 'bg-transparent border-2 border-dashed border-orange-300 text-orange-500'
            : 'bg-orange-100 text-orange-300'
      }`}>
        {reorderedLabels[i]}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 9.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 9.3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 9.4: Commit**

```bash
git add app/progress/page.tsx
git commit -m "fix: streak calendar day-label indexing, DST drift, and add pending-today state

- Fix day labels: array was Mon-indexed but getDay() returns Sun-indexed
- Fix DST drift: compare YYYY-MM-DD strings instead of millisecond deltas
- Add 'pending' state: today is shown with dashed outline when streak is alive
  but user hasn't acted yet today

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Section 4 — Practice Complete Moment

### Task 10: Add Finish button and completion overlay

**Files:**
- Modify: `app/practice/[id]/page.tsx`

- [ ] **Step 10.1: Replace practice page with Finish button + completion modal**

Replace the entire content of `app/practice/[id]/page.tsx` with:

```tsx
'use client'

import { useState, useEffect, useRef, useCallback, useMemo, FormEvent, ChangeEvent } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ChatMessage } from '@/components/chat-message'
import { VoiceButton } from '@/components/voice-button'
import { incrementPracticeCount, markLessonComplete, updateStreak } from '@/lib/progress'
import { getAnyLessonById } from '@/lib/lessons'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface PracticePageProps {
  params: Promise<{ id: string }>
}

function useChat({ api, body }: { api: string; body: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSentInitial = useRef(false)

  const sendMessages = useCallback(
    async (messagesToSend: Message[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesToSend.map(({ role, content }) => ({ role, content })),
            ...body,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Server error: ${response.status}`)
        }
        if (!response.body) throw new Error('No response body')

        const assistantId = (Date.now() + 1).toString()
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '' },
        ])
        playSound('pop')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            )
          }
        }
      } catch (err) {
        console.error('Chat error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [api, body]
  )

  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true
      sendMessages([])
    }
  }, [sendMessages])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      playSound('tap')
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      await sendMessages(newMessages)
    },
    [input, isLoading, messages, sendMessages]
  )

  return { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error }
}

export default function PracticePage({ params }: PracticePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showFinish, setShowFinish] = useState(false)

  const body = useMemo(() => ({ lessonId: id }), [id])
  const lesson = getAnyLessonById(id)

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body,
  })

  const handleTranscript = useCallback((text: string) => {
    setInput(text)
  }, [setInput])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const userMessageCount = messages.filter(m => m.role === 'user').length

  const handleFinish = () => {
    if (userMessageCount === 0) return
    markLessonComplete(id)
    updateStreak()
    incrementPracticeCount()
    playSound('levelup')
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#34d399', '#fbbf24'],
      ticks: 80,
      gravity: 1.2,
      scalar: 0.9,
    })
    setShowFinish(true)
  }

  return (
    <motion.div
      className="flex flex-col h-dvh max-w-lg mx-auto"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) {
          router.push(`/lessons/${id}`)
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] safe-top">
        <Link
          href={`/lessons/${id}`}
          className="flex items-center gap-1 text-sm text-[var(--accent)] font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Lesson
        </Link>
        <button
          type="button"
          onClick={handleFinish}
          disabled={userMessageCount === 0 || isLoading}
          className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Finish ✓
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <FeatureTooltip
            id="practice"
            message="The AI will start talking first — reply in Hindi (romanized) or English!"
            position="center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mt-16"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <p className="font-medium text-[var(--text-primary)]">Setting the scene...</p>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">Your conversation partner is about to start talking.</p>
            </motion.div>
          </FeatureTooltip>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as 'user' | 'assistant'}
            content={message.content}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg py-2 px-3 mx-auto">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-[var(--bg-surface)] border-t border-[var(--border)] safe-bottom">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type in Hindi or English..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-sm disabled:opacity-50 transition-all"
          />
          <VoiceButton onTranscript={handleTranscript} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {showFinish && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
            >
              <div className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl border border-[var(--border)] p-8 max-w-sm w-full text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                  Nice practice!
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {userMessageCount} message{userMessageCount === 1 ? '' : 's'} exchanged
                </p>
                {lesson && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {lesson.title}
                  </p>
                )}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => router.push(`/lessons/${id}`)}
                    className="block w-full text-center py-3 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-md"
                  >
                    Back to lesson
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="block w-full text-center py-3 px-6 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold rounded-2xl border border-[var(--border)]"
                  >
                    Home
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

Key behavioral changes vs the original file:
- Removed the `useEffect` that called `incrementPracticeCount()` on mount.
- Added `showFinish` state, `handleFinish` handler, Finish button in header.
- Added completion overlay (modal + confetti + buttons).
- Imported `markLessonComplete`, `updateStreak`, `getAnyLessonById`, `confetti`, `AnimatePresence`.

- [ ] **Step 10.2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 10.3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 10.4: Verify the dev build starts and the page renders**

Run: `npx next build`
Expected: Build succeeds.

If `next build` fails, fix any issues before committing.

- [ ] **Step 10.5: Commit**

```bash
git add app/practice/[id]/page.tsx
git commit -m "feat: add Finish button + completion overlay to practice chat

Wires three previously-missing side effects to lesson completion:
- markLessonComplete (practice could not complete a lesson before)
- updateStreak (lessons did not contribute to streak before)
- incrementPracticeCount moved here from mount effect (fixes inflation
  on every page mount)

Finish button is disabled until the user has sent at least one message.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Final verification

### Task 11: Full test + build + smoke

- [ ] **Step 11.1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing + new).

- [ ] **Step 11.2: Run lint**

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 11.3: Run full build**

Run: `npx next build`
Expected: Build succeeds without errors.

- [ ] **Step 11.4: Manual smoke (optional, recommended)**

Run: `pnpm dev` (or `npm run dev`)
Open http://localhost:3000 and verify:
1. Progress page shows partial percentages on lessons you've partially viewed.
2. Quiz includes vocab questions after exploring a few vocab words.
3. Streak calendar shows correct day letters for today's column.
4. Practice page has a green Finish button in the header that opens the completion overlay.

- [ ] **Step 11.5: Done**

All four improvements implemented. The committed history will be readable as one PR with ~10 focused commits.
