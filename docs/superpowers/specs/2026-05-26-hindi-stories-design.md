# Hindi Stories — Chai Galli Motion-Comics — Design

**Status:** approved 2026-05-26
**Repo:** `abhinav-kipper/learn-hindi`

## 1. Goal

Add a new content type to the Hindi side of the app: short, illustrated, animated story panels in the existing Chai Galli sticker aesthetic. Cute, calm, no-quiz reading practice — pure consumption with English translation reveals + per-panel TTS.

Three stories ship in MVP, ~5 panels each.

## 2. Decisions

| Decision | Choice |
|---|---|
| Visual style | Stay in Chai Galli (sticker pack, hard offset shadows, flat palette). NO external image assets — every scene composed from SVG + Framer Motion. Cute idle animations (blink, bounce, steam). |
| Story count | 3 in MVP |
| Panel count per story | ~5 (range 4-6 acceptable) |
| Interaction | Tap-through (or swipe). One panel at a time. Right-edge tap or swipe to advance. |
| English translation | Tap-to-reveal per panel, mirrors existing lesson reveal-zone pattern. |
| TTS | Per-panel "hear it" button (browser TTS via existing `lib/speech.ts`) |
| Quiz / comprehension | NONE in MVP. Pure consumption. |
| Per-word translation | NOT in MVP (deferred) |
| Language | Hindi-only. Dutch parallel can come later. |
| Home placement | New "Stories" section on Hindi home, between Continue chip and Situations/Foundations tab pill. NOT a new bottom-nav tab. |
| Progress tracking | New `lib/stories-progress.ts`. Storage key `learn-hindi:hindi-stories-read` (JSON array of story IDs). Card shows mint check-dot when complete. |
| Routes | New `/stories/[id]` for the reader. No separate `/stories` index page — index is the Hindi home section. |
| New characters | 3 new SVG character primitives in Chai Galli style (Nani, Customer, Shopkeeper). Cutting is reused as the chaiwala in Story 1 and as the customer in Story 3. |
| Chaina moment on completion | Out of scope (deferred — could add `storyComplete` later) |

## 3. The 3 stories (content brief)

### Story 1 — `chai-stall` (A1)
**Title:** The Chai Stall
**Description (card tease):** "First chai with Cutting." (or similar 4-7 words)
**Skill tags:** greetings, ordering food
**Maps to vocab from:** `01-greetings`, `03-ordering-food`
**Cultural beat:** Origin story for Cutting the mascot. User arrives at a roadside chai stall, sees Cutting, orders chai, makes small talk, leaves with new friend.
**Panel arc (5):**
1. NARRATION (scene: `chai-stall`) — "Cutting waits for the first customer of the day." (Hindi: `cutting din ke pehle grahak ka intezaar kar raha hai`)
2. CUSTOMER (left, scene: `chai-stall`) — "do chai dena, bhaiya. ek meri aur ek aapki." / "Two chais please. One for me and one for you."
3. CUTTING (right, scene: `chai-stall`) — "arrey wah! mere liye bhi? bahut shukriya, dost!" / "Wow! For me too? Thanks a lot, friend!"
4. CUSTOMER (left) — "tumhara naam kya hai?" / "What's your name?"
5. CUTTING (right, scene: `chai-stall`) — "main Cutting hoon. half-chai bechta hoon, full-friendship deta hoon." / "I'm Cutting. I sell half-chai, I give full-friendship."

### Story 2 — `lost-in-bazaar` (A1-A2)
**Title:** Lost in the Bazaar
**Description:** "Three shopkeepers, three different answers."
**Skill tags:** directions, navigation
**Maps to vocab from:** `06-giving-directions`
**Cultural beat:** Tourist asks for a hotel, gets three contradictory directions, eventually realizes nobody actually knows but everyone is helpful. Comedy-of-helpfulness.
**Panel arc (5):**
1. NARRATION (scene: `bazaar`) — "Maya is looking for the Hotel Surya. She has no idea where it is." / "Maya hotel Surya dhoond rahi hai. usse koi pata nahi hai kahaan hai."
2. SHOPKEEPER 1 (left, scene: `bazaar`) — "seedha jaao, phir left. bilkul saamne hai." / "Go straight, then left. It's right there."
3. SHOPKEEPER 2 (right, scene: `bazaar`) — "arrey nahi! right le lo. main bhi wahaan jaata hoon." / "Oh no! Take a right. I go there too."
4. CHILD (center, scene: `bazaar`) — "auntie, mere papa wahaan kaam karte hain. main le chalti hoon." / "Auntie, my papa works there. I'll take you."
5. NARRATION (scene: `bazaar`) — "Maya is now part of the family." / "Maya ab parivar ka hissa hai." (Punchline: in India, asking for directions = joining the community)

### Story 3 — `sunday-with-nani` (A2)
**Title:** Sunday with Nani
**Description:** "Lunch with grandmother."
**Skill tags:** family terms, hospitality, food
**Maps to vocab from:** `07-home-visit`, `10-phone-with-parents`
**Cultural beat:** Sunday lunch at grandmother's house. User arrives, removes shoes, gets fed too much food, leaves with leftovers in a steel dabba.
**Panel arc (5):**
1. CUTTING (center, scene: `nani-house`) — "nani ji, namaste! main aapse milne aaya hoon." / "Nani-ji, hello! I came to meet you."
2. NANI (left, scene: `nani-house`) — "arrey beta! aa gaya tu? joote yahin utaar de. haath dho le." / "Oh child! You came? Take your shoes off here. Wash your hands."
3. NANI (left, scene: `nani-house` — table loaded with food) — "tu toh bahut patla ho gaya hai. yeh poori, yeh sabzi, aur thoda halwa bhi." / "You've gotten so thin. Have this poori, this sabzi, and a bit of halwa too."
4. CUTTING (right, scene: `nani-house`) — "nani, bas! bahut khaa liya. pet bhar gaya." / "Nani, enough! I've eaten a lot. My stomach is full."
5. NANI (left, scene: `nani-house` — handing dabba) — "yeh dabba le ja. ghar pe khaayega kal." / "Take this tiffin. You'll eat it at home tomorrow." (Punchline: in India, "I'm full" means nothing — you're leaving with leftovers)

Each story's punchline (last panel) carries the cultural truth. Important — these aren't just language drills, they're cultural micro-essays.

## 4. Schema (`types/story.ts`)

```ts
export type SceneId =
  | 'chai-stall'
  | 'bazaar'
  | 'nani-house'
  | 'narrator-card'

export type SpeakerPosition = 'left' | 'right' | 'center'

export interface Panel {
  scene: SceneId
  hindi: string
  english: string
  speaker?: string              // 'cutting' | 'nani' | 'chaiwala' | 'shopkeeper' | 'child' | 'narrator' | etc.
  speaker_position?: SpeakerPosition
  pronunciation?: string        // syllable-stress, optional
}

export interface Story {
  id: string
  title: string
  description: string           // 1-line tease for card
  panels: Panel[]
  level?: 'A1' | 'A2' | 'B1'    // optional
  skill_tags?: string[]
}
```

## 5. File structure

### New

| Path | Responsibility |
|---|---|
| `types/story.ts` | `Story`, `Panel`, `SceneId` types |
| `content/stories/01-chai-stall.json` | Story 1 (5 panels) |
| `content/stories/02-lost-in-bazaar.json` | Story 2 (5 panels) |
| `content/stories/03-sunday-with-nani.json` | Story 3 (5 panels) |
| `lib/stories.ts` | Loader — imports JSONs, exports `getAllStories()`, `getStoryById(id)` |
| `lib/stories-progress.ts` | Read-state tracking. `markStoryRead(id)`, `isStoryRead(id)`, `getStoriesRead()`, `getStoriesReadCount()`. Storage key `learn-hindi:hindi-stories-read`. TDD'd. |
| `components/stories/StoryCard.tsx` | Home-card. Title + description + read-check sticker. |
| `components/stories/StoryReader.tsx` | The tap-through reader. State: current panel index, English-revealed?, story complete? |
| `components/stories/scenes/ChaiStallScene.tsx` | Background composition for chai-stall scene |
| `components/stories/scenes/BazaarScene.tsx` | Bazaar street scene |
| `components/stories/scenes/NaniHouseScene.tsx` | Indoor nani-house scene |
| `components/stories/scenes/NarratorCard.tsx` | Narrator title/caption card (no characters) |
| `components/stories/characters/Nani.tsx` | NEW SVG character — sari-wearing grandmother sticker. Chai Galli style. |
| `components/stories/characters/Customer.tsx` | NEW SVG character — generic humanoid sticker (used as the chai-stall customer in Story 1 + as Maya the protagonist in Story 2). |
| `components/stories/characters/Shopkeeper.tsx` | NEW SVG character — humanoid with mustache and a small box/bag prop. Rendered TWICE in Story 2 with different palettes (Shopkeeper 1 = peach + mint, Shopkeeper 2 = butter + lavender) so we don't need separate components. |
| `app/stories/[id]/page.tsx` | Single-story route — loads story by ID, renders `<StoryReader />` |
| `lib/stories-progress.test.ts` | Tests for `lib/stories-progress.ts` |
| `lib/stories.test.ts` | Tests for `lib/stories.ts` (loads-all, getById, returns undefined for unknown) |

### Modified

| Path | Change |
|---|---|
| `app/page.tsx` | Insert new "Stories" section between Continue chip and Situations/Foundations tab pill, scoped to `language === 'hindi'`. Renders `<StoryCard>` × 3. |
| `CLAUDE.md` | Add Stories to file-structure block + Pages table + Libraries table + storage-keys section. New 2026-05-26 wave entry. |
| `CONTENT.md` | Add Hindi Stories inventory section with the 3-row table. |

### Deleted

None.

## 6. Per-panel layout

```
┌────────────────────────────────────────────┐
│  ◀                            Panel 3 / 5  │  ← thin top bar: back button + progress
├────────────────────────────────────────────┤
│                                            │
│                                            │
│              [ scene illustration ]        │  ← Top 55-60% — scene background
│                                            │     + character(s) with idle motion
│         [character]   [bubble]             │     + speech bubble Sticker
│                                            │
├────────────────────────────────────────────┤
│  🔊 hear it          🟧 Show English       │  ← Bottom 40% — text card
│                                            │
│  hindi text here (Bricolage display)       │
│  ─────────────────────────────             │
│  ▶ english reveal zone (lavender → mint)   │     - tap reveals translation
│                                            │
│              ▶ Next panel                  │  ← right side tap OR swipe-left advances
└────────────────────────────────────────────┘
```

Final panel (story complete) replaces the bottom text card with a "celebration" sub-card: Confetti, happy-hop Cutting, "Read more stories" CTA → back to home. Calls `markStoryRead(storyId)` once on mount.

## 7. Animation behavior (Framer Motion)

- **Panel-to-panel transition:** `AnimatePresence` with `mode="wait"`. Exiting panel slides left + fades; new panel slides in from right.
- **Character entrance:** each character `motion.div` mounts with `initial={{ y: 20, opacity: 0 }}` + `animate={{ y: 0, opacity: 1, transition: { delay: 0.15 } }}`.
- **Speech bubble:** scales in with `scale: [0, 1.1, 1]` keyframe sequence, slight delay after character.
- **Cutting idle:** reuses existing `blink` + `float-y` keyframes from `animations.css`.
- **Other characters idle:** subtle `breathe` (slight scale 1.0 ↔ 1.02 over 2.5s).
- **Story complete:** Confetti + happy-hop Cutting + scale-in CTA button.

## 8. Where on the Hindi home

Insert between the existing Continue chip and the Situations/Foundations tab pill. Approximate hierarchy:

```
HINDI HOME (existing)
  Goal banner / streak chip
  Continue: <last active lesson>

  STORIES                  ← NEW (scoped: language === 'hindi')
  [Chai Stall card]
  [Lost in Bazaar card]
  [Sunday with Nani card]

  Tab pill: Situations / Foundations
  <lesson sticker list>
  <foundation sticker list>
```

Section header shows "Stories" + small "{readCount} of 3" pill (e.g. "1 of 3 read").

Story cards use existing Sticker primitive — ~80px tall — with title (display font), 1-line description, and a mint check-circle on the right when read. Tap → `/stories/<id>`. Card backgrounds rotate through peach / butter / mint (palette derived from card index for visual variety).

## 9. New SVG characters — style guide

Three new characters added in Chai Galli style. Style constraints:
- Same line weight as Cutting (2.5px ink stroke)
- Same hard-shadow recipe (`4px 4px 0 #36281e`)
- 2-3 colors per character from the COLORS palette
- Same proportions as Cutting (head ~50% of body height)
- Subtle idle animation (eye blink, slight bounce)

**Nani:** rounded grandmother figure. Sari draped (orange / peach), white hair bun, glasses (small circles), warm smile, hands clasped over a steel dabba (small grey rectangle).

**Customer:** generic humanoid figure. Round head, short stylized hair, simple shirt (palette set by prop so it can re-skin), neutral-friendly face. Used as the chai-stall customer in Story 1 AND as Maya in Story 2 (with a different shirt palette for visual differentiation).

**Shopkeeper:** humanoid with mustache (ink stroke), small bag/box prop suggesting a market stall, slightly more weight than the Customer character. Rendered twice in Story 2 with different palettes (Shopkeeper 1 = peach + mint, Shopkeeper 2 = butter + lavender) — same component, palette via props, so no separate component needed.

All three new characters sit alongside Cutting in `components/stories/characters/`. They're presentation-only — no interactive behavior beyond idle animation. Cutting plays the chaiwala role in Story 1 (his "origin story") and the customer role in Story 3, so no separate Chaiwala component is needed.

## 10. Out of scope

- Per-word translation popovers (defer to v2)
- Comprehension MCQs / quizzes (deferred)
- Dutch stories (Hindi-only for now)
- Native audio recordings (browser TTS only)
- More than 3 stories in this batch
- More than 3 new character SVGs
- Chaina moment on story-complete (deferred — could add `storyComplete` later)
- Stories as a search-overlay-indexable content type
- Stories in bottom-nav
- Story-related Cute Moments / streak interactions

## 11. Validation

- All existing tests pass + new tests for `lib/stories.ts` (3 tests) + `lib/stories-progress.ts` (6 tests)
- `npx tsc --noEmit` clean
- `node scripts/lint-design.mjs` clean
- Story renders on Hindi home; tapping a card opens `/stories/<id>`; user swipes through 5 panels with TTS + English-reveal working; completion celebration fires; refresh shows mint check-dot on the card
- `lib/stories-progress.ts` correctly persists + reads back across reloads
- Dutch home unchanged (stories don't appear there)

## 12. Risks / open considerations

- **Character art consistency:** 3 new SVG characters in Chai Galli style is the main creative risk. Mitigation — strict reference to Cutting (line weight, palette, proportions, shadow recipe). Authoring agent must view `components/design/Cutting.tsx` first.
- **Panel pacing on small screens:** 60/40 split between scene and text card needs to feel right on iPhone SE (smallest target). May need to reduce illustration height to 50% if cramped.
- **TTS quality on Hindi:** browser TTS produces variable Hindi pronunciation. Acceptable for MVP but a future v2 could ship native recordings.
- **Story discoverability:** if the section sits below the Continue chip but above the tab pill, it might push the lesson list further down. Acceptable for a feature aimed at reinforcement after lesson work.

## 13. Open questions

None.
