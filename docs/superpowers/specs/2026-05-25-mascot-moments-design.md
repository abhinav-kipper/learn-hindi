# Chaina Mascot Moments — Design Spec

**Status:** approved 2026-05-25
**Branch:** `claude/mascot-design-impl-IseIB`
**Source handover:** `/tmp/hindi_app_2/mascot_moments/` (CLAUDE_CODE_PROMPT.md + MASCOT_MOMENTS.md + 7 source files + interactive HTML prototype)

## 1. Scope

Port the 11-moment Chaina mascot animation system from the handover into the `learn-hindi` Next.js app. **Replace** the existing `components/cute-moments.tsx` popup system entirely — add 3 new Chaina moments to cover its triggers (favorite-save, conjugation-drill correct, mistakes-drill "got it") so feedback coverage stays whole.

Ship on Web Speech. Keep the MP3 fallback architecture intact but dormant so a future ElevenLabs generation pass drops in zero-code-change.

This is a pure UX/character layer. No changes to progress logic, SRS, AI chat, content JSONs, or the Chai Galli design tokens.

## 2. Decisions (settled in brainstorming)

| Decision | Choice |
|---|---|
| TTS strategy | Web Speech now. MP3-first-with-fallback architecture intact-but-dormant. ElevenLabs script committed but not run. |
| Coexistence with `cute-moments.tsx` | Replace entirely. Add 3 new Chaina moments to cover the orphaned triggers. |
| Mute UI | No new toggle in v1. Existing `bolna-seekho-muted` silences both SFX and Chaina voice. |
| Feature flag | None. Solo-user app. |
| Devanagari TTS | Out of scope. Romanized phonetic Hinglish via the `speak` field. |
| Dutch / Stroopie port | Out of scope. System is character-agnostic for future swap. |
| Settings page for fine-grained controls | Out of scope. None exists today. |

## 3. File layout

### New files

| Path | Purpose |
|---|---|
| `components/design/cutting-animations.css` | Keyframes (peek-up-right/left, peek-down, dismiss-down, wave-tilt, walk-across, sympathy-nod, bubble-pop/fade, poke-wobble, idle-peek, excited-spin, thumb-flash) + `prefers-reduced-motion` override |
| `components/design/SpeechBubble.tsx` | Typed port of `speech-bubble.jsx`. Same API. |
| `components/design/moments.ts` | `MOMENTS`, `LINES`, `pickLine` with full TS types. **14 moments** (11 spec + 3 new). |
| `components/design/MomentStage.tsx` | `<ChainaProvider>` context + `<MomentStage/>` fixed overlay. Exports `useChaina()` hook returning `{ play, stop }`. |
| `components/design/chainaFrequency.ts` | `canFire(key, mode)` + `markFired(key, mode)`. Modes: `once-per-session`, `once-per-day`, `debounce-800ms`. |
| `lib/chaina-voice.ts` | Converted from `chaina-voice.js` IIFE → proper TS module + module-level singleton. SSR-safe (all `window`/`localStorage` guarded). Exports `play`, `speak`, `cancel`, `setMuted`, `isMuted`, `setClipBase`. |
| `scripts/generate-chaina-voices.mjs` | Moved from `mascot_moments/`. Added as `voices` npm script. **Not executed** in this implementation. |
| `public/chaina/` | Empty directory committed via `.gitkeep` so the fetch path resolves cleanly (404s expected, fallback handles). |

### Modified files

| Path | Change |
|---|---|
| `components/design/Cutting.tsx` | Add `wave` / `sympathy` / `wink` / `excited` / `sleepy` mood cases (port from `mascot_moments/cutting.jsx`). Add `blink?: boolean` prop (default `true`). Keep existing `idle` / `happy` byte-identical. |
| `app/layout.tsx` | Replace `CuteMomentsProvider` with `ChainaProvider`. Mount `<MomentStage/>` once. Import `cutting-animations.css` after `animations.css`. |
| `app/page.tsx` | Mount-effect: detect last-session timestamp → fire `welcomeBack` / `firstOpenToday` / `firstEver` per rules. Wrap header `<Cutting size={92}/>` in tap-handler firing `play('tap')`. |
| `components/design/LessonChaiGalli.tsx` | Replace `useCuteMoments()`. Fire `lessonComplete` on success branch (alongside existing confetti). Fire `favoriteSaved` on star tap. Fire `idleNudge` after 25s no input. Fire `phraseStreak` on the 3rd consecutive reveal. |
| `app/quiz/page.tsx` | Replace `cheer()` with `play('correctAnswer')` / `play('wrongAnswer')`. After `updateStreak`, fire `streakMilestone` if new streak ∈ {7,14,30,50,100}. |
| `app/drill/conjugation/page.tsx` | Replace `cheer()` with `play('conjugationCorrect')`. |
| `app/mistakes/page.tsx` | Replace `cheer()` with `play('drillGotIt')`. |
| `lib/progress.ts` | `updateStreak` returns `number` (the new streak). Existing void callers ignore. Avoids coupling `lib/` to React. |
| `lib/mistakes.ts` | `addMistake` (or equivalent recorder) returns `{ firstOfDay: boolean }`. Callers fire `firstMistake` when true. |
| `components/layout-shell.tsx` | Add visibility-change `hidden` handler firing `sessionEnd` if session length ≥5min (existing handler already wired for notifications). |
| `app/onboarding/page.tsx` | Fire `firstEver` at mount (gated by `chaina-freq-firstEver` once-ever flag). |

### Deleted files

- `components/cute-moments.tsx` — replaced entirely
- Mock in `__tests__/components/lesson-chai-galli.test.tsx` updated (file not deleted, mock target changed)

## 4. Architecture

```
ChainaProvider (mounts in app/layout.tsx, inside LanguageProvider)
  │
  ├── exposes useChaina() → { play(key), stop() }
  └── renders <MomentStage/>
        │
        ├── position: fixed; inset: 0; pointer-events: none;  (z-index 30)
        ├── state: { key, line, idx, phase: 'enter'|'hold'|'exit' } | null
        ├── on play(key):
        │     1. pickLine(key) → { line, idx }
        │     2. setState({ key, line, idx, phase: 'enter' })
        │     3. after 200ms → chainaVoice.play(key, idx, line.speak) (if cfg.voice)
        │     4. after enterMs → phase: 'hold'
        │     5. after enterMs+holdMs → phase: 'exit'
        │     6. after enterMs+holdMs+exitMs → null
        └── renders <Cutting mood={cfg.mood} blink={cfg.mood !== 'sleepy'}/> + <SpeechBubble/>
```

**Trigger sites are React components** — they call `useChaina().play(key)` directly. Frequency caps wrapped at the consumer site (e.g. `if (canFire('phraseStreak', 'once-per-session')) { play('phraseStreak'); markFired(...) }`). Keeps `MomentStage` dumb.

**Non-React triggers** (e.g. inside `lib/progress.ts` `updateStreak`): the lib stays React-free. Functions like `updateStreak` and `addMistake` return enough info (new streak count, first-of-day flag) for the calling React component to decide whether to fire a moment.

## 5. Moment registry — 14 moments

11 from the spec, byte-identical config. Plus 3 new:

| Key | When | Anchor | Mood | Voice | Frequency cap |
|---|---|---|---|---|---|
| firstEver | First-ever launch | center | wave | ✅ | once-ever (localStorage) |
| welcomeBack | ≥24h since last session | bottom-right | wave | ✅ | once-per-session, mutex with firstOpenToday |
| firstOpenToday | Same calendar day | bottom-right | idle | ✅ | once-per-session, mutex with welcomeBack |
| phraseStreak | 3 reveals in a row | inline-right | happy | ❌ | once-per-lesson-mount |
| correctAnswer | Quiz correct | top-right | happy | ✅ | none |
| wrongAnswer | Quiz wrong | top-right | sympathy | ✅ | none |
| lessonComplete | Mark chapter complete | center | excited | ✅ | none |
| streakMilestone | Streak crosses {7,14,30,50,100} | walk | excited | ✅ | none (already gated by `seenStreakMilestones[]`) |
| idleNudge | 25s idle on lesson | bottom-edge | sleepy | ❌ | once-per-screen-mount |
| firstMistake | First [[CORRECTION]] of day | bottom-right | wink | ✅ | once-per-day |
| sessionEnd | Backgrounded after 5+ min | bottom-right | wave | ✅ | once-per-session |
| tap | User pokes Chaina | inplace | happy | ✅ | debounce-800ms |
| **favoriteSaved** (new) | Star a phrase | bottom-right | wink | ❌ | debounce-800ms |
| **conjugationCorrect** (new) | Conjugation drill correct | top-right | happy | ❌ | none |
| **drillGotIt** (new) | Mistakes drill "got it" | inline-right | happy | ❌ | none |

The 3 new moments are **silent** so they don't talk over the existing context (favoriting is a quick action; conjugation/mistakes drills have their own focus). Their visual treatment mirrors phraseStreak / correctAnswer for consistency.

## 6. Copy bank (LINES)

11 spec moments use the LINES from `moments.js` byte-identical. The 3 new moments add:

```ts
favoriteSaved: [
  { main: 'saved ⭐', caption: 'drill karenge baad mein', speak: 'Saved.' },
  { main: 'star added', speak: 'Star added.' },
],
conjugationCorrect: [
  { main: 'sahi!', speak: 'Sahi.' },
  { main: 'ekdum theek', speak: 'Ekdum theek.' },
],
drillGotIt: [
  { main: 'got it!', speak: 'Got it.' },
  { main: 'pakka', caption: 'yaad rahega', speak: 'Pakka.' },
],
```

`pickLine` no-repeat invariant unchanged.

## 7. Storage keys

| Key | Scope | Purpose |
|---|---|---|
| `chaina-freq-<momentKey>` | localStorage (day) or sessionStorage (session) | frequency cap state |
| `chaina-last-session-ts` | localStorage | timestamp of last app open, for welcomeBack/firstOpenToday discrimination |
| `chaina-first-ever-seen` | localStorage | "1" once firstEver fired |
| `chaina-session-start-ts` | sessionStorage | session start, used by sessionEnd (5min threshold) |
| `chaina-voice-muted` | localStorage | reserved for future fine-grained toggle. v1 reads but does not write. |

The existing `bolna-seekho-muted` also silences Chaina voice (read by `chaina-voice.ts`).

## 8. Voice (chaina-voice.ts)

Module-level singleton. SSR-safe — all browser API access guarded.

```ts
export const chainaVoice = {
  play(momentKey: string, idx: number, fallbackText?: string): void,
  speak(text: string, opts?: SpeechOpts): void,
  cancel(): void,
  setMuted(b: boolean): void,
  isMuted(): boolean,
  setClipBase(url: string): void,
};
```

- `play()` tries `${clipBase}/${momentKey}-${idx}.mp3`. On error/404, remembers the URL (no retry) and falls back to `speak(fallbackText)`.
- `speak()` uses `window.speechSynthesis` with pitch 1.7, rate 0.95, picks the best Hindi/Indian-English voice available (`Lekha`/`Veena`/`Microsoft Heera`/`Samantha`/...).
- Boot: `chainaVoice.setClipBase('/chaina')` once at module load.

## 9. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  [data-chaina-moment] { animation: fade-in 200ms ease forwards !important; }
}
```

Every Chaina-rendered element gets `data-chaina-moment`. Voice still plays (reduced-motion ≠ silent).

## 10. Testing

- **Snapshot test** `components/design/Cutting.tsx` with each mood (`idle`/`happy`/`wave`/`sympathy`/`wink`/`excited`/`sleepy`).
- **Unit test** `pickLine(key)` no-repeat invariant over 100 iterations for keys with >1 line.
- **Unit test** `canFire`/`markFired` per mode (once-per-session, once-per-day, debounce-800ms).
- **Unit test** `chainaVoice.play()` falls back to `speak()` when audio fails (mock `Audio` constructor).
- **Component test** `MomentStage` renders nothing initially, renders Cutting+SpeechBubble on `play()`, clears after duration.
- Update existing `lesson-chai-galli.test.tsx` mock target from `cute-moments` → `MomentStage`.

## 11. Explicit non-goals

- ElevenLabs MP3 generation (script committed, not run)
- Devanagari TTS locale
- Dutch / Stroopie character port
- Settings page or fine-grained per-moment mute
- A11y beyond `prefers-reduced-motion` (no ARIA live region beyond what the existing `cute-moments` provided; speech bubble is decorative)

## 12. Implementation order (rough)

1. CSS + Cutting moods + SpeechBubble (no logic yet — visual port first)
2. `lib/chaina-voice.ts`, `moments.ts`, `chainaFrequency.ts`
3. `MomentStage.tsx` + `ChainaProvider`, mount in `app/layout.tsx`, **smoke-test all 14 moments via a temp dev-only trigger panel**
4. Wire triggers — start with `tap` (home header), `correctAnswer`/`wrongAnswer` (quiz), `lessonComplete`
5. Remove `cute-moments.tsx` + rewire its 4 call sites
6. Wire remaining moments (welcomeBack/firstOpenToday/firstEver, sessionEnd, idleNudge, phraseStreak, firstMistake, streakMilestone)
7. Tests
8. Final QA: visit each route on dev server, trigger each moment, verify no collisions with `bottom-nav`, `daily-review-popup`, `install-prompt`

A separate writing-plans pass will turn this into a step-by-step plan with checkpoints.
