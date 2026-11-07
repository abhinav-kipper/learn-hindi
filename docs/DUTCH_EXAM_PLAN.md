# Dutch exam prep: state, decisions, and what to build next

Durable memory for this track. A cloud session's container is wiped between
runs, so anything worth keeping lives here, in git. Read this before planning
Dutch work; update it when the picture changes.

Last updated: 2026-11-07.

---

## 1. The learner

- Preparing for the **Inburgeringsexamen at A2**, not B1. This is settled:
  `dutch-exam-target` now defaults to `a2` and the whole Dutch UI follows it.
- Hindi is a separate, casual track with no exam. Do not mix the two: a
  Hindi-grammar aside was found in a Dutch chapter and removed.
- Tests on a phone against the live Vercel deploy, so work ships to `main`.
- Has taken a real Dutch course (DE1, lessons 1-10). The 25 cheatsheet topics
  were built against that syllabus and cover all ten of its grammar goals.
  DE2 begins with the perfect tense.

## 2. The exam, as of this writing

Five separately-booked papers. **Verify format against DUO / inburgeren.nl
before building UI around it** — the practice sites that describe it are
commercial and disagree on timings and question counts.

| Paper | Shape (approx) | App status |
|---|---|---|
| Lezen (reading) | ~25 questions, computer | live, thin at A2 |
| Luisteren (listening) | ~25 questions, computer | live, TTS audio only |
| **Schrijven (writing)** | 40 min, pen and paper, 4 tasks: one form plus short texts | **missing** |
| **Spreken (speaking)** | ~16 recorded tasks, ~35 min, 1 min each | **missing** |
| KNM | 40 questions, 45 min, 8 statutory themes | live, strongest module |

The eight statutory KNM themes: Werk en inkomen, Omgangsvormen/waarden en
normen, Wonen, Gezondheid, Geschiedenis en geografie, Instanties,
Staatsinrichting, Onderwijs en opvoeding. All eight are now covered.

Also worth confirming for this learner: whether they fall under **Wi2013**
(which adds ONA) or **Wi2021** (which adds MAP and PVT). That changes what
else they owe beyond the five papers.

## 3. What the app has (2026-11-07)

| Module | Content |
|---|---|
| Lessons | 19 (11 A1, 5 A2, 3 B1) |
| Foundations | 14 grammar chapters (8 A1, 6 A2) |
| Cheatsheets | 25 topics, 214 drill questions |
| KNM | 132 questions, all 8 themes |
| Lezen | 10 texts (5 A1, 4 A2, 1 B1) |
| Luisteren | 10 clips (4 A1, 4 A2, 2 B1) |
| Vocabulary | 208 words, 12 categories |
| Sounds | 8 pronunciation stages |

## 4. Decisions already made, and why

Re-opening these without reason wastes a session.

- **A2 is the default target.** B1 content is never hidden, only dimmed and
  relabelled ("beyond your target", `B1 · extra`). Changeable in Settings.
- **Content IDs are one global namespace.** Every Dutch id must be `dutch-`
  prefixed. A collision on `questions` once made the Dutch chapter unreachable
  behind the Hindi one. Guarded by `__tests__/lib/dutch-content-ids.test.ts`.
- **Cheatsheets are deliberately NOT wired into the SM-2 SRS** (`lib/review.ts`).
  That was a scoping choice, not an oversight. See the roadmap below: for an
  exam with a deadline it is now probably the wrong call.
- **Drill screens have no tap-to-define**, so tapping can't leak an answer.
- **KNM facts are kept structural**, not date-anchored. No euro amounts, no AOW
  age, no benefit rates: they drift every year and silently rot.
- **CI runs Node 24, prod runs Node 26.** Deliberate. jsdom 29 has no
  `localStorage` on Node 26; jsdom 31 fixes that but breaks the tests guarding
  the Chai Galli border/shadow recipe.

## 5. Traps that have already cost a session

- **`npm install` in this pnpm repo** resolves a different tree from the
  lockfile: 10 component test files fail to import, `tsc` reports ~18 phantom
  errors, and ~70 tests silently vanish. Always
  `pnpm install --frozen-lockfile`.
- **The service worker can serve a stale build.** RSC payloads used to be
  cached stale-while-revalidate, so an installed PWA kept showing the previous
  deploy. Fixed, but **bump `CACHE_VERSION` in `public/sw.js` and the matching
  names in `lib/offline-cache.ts` together** on any caching change.
- **Content JSON formatting.** The cheatsheet files are hand-formatted; never
  round-trip them through `json.dumps(indent=2)`. The foundations, knm.json and
  vocabulary.json are clean round-trips and safe to rewrite programmatically.
- **Verify against a freshly rebuilt server.** `pkill -f "next start"` does not
  match the `next-server` process, which has produced false "clean" audits.

---

## 6. Roadmap, in the order a teacher would choose

The principle: **the exam is won on the two papers the app does not have.**
Reading, listening and KNM are recognition tasks and the app already trains
them. Writing and speaking are production, they are 40% of the exam, and the
app currently offers zero Dutch production practice of any kind.

### Tier 1 — decides pass or fail

**1. Spreken (speaking).** The paper most people fail. You get about a minute
per task, recorded, no retry, so what matters is automatic sentence frames
rather than grammar knowledge. Four task types to build: a video question,
describing one picture, choosing between two pictures, and a three-picture
story. **The backend already exists**: `components/voice-button.tsx` takes a
`locale` and documents `nl-NL`, and `app/api/pronounce/route.ts` already turns
recorded audio into scored coaching. This is wiring plus prompts, not greenfield.

**2. Schrijven (writing).** Four tasks: a form, short messages, free writing.
**The backend already exists too**: `app/api/journal-check/route.ts` branches on
`language === 'dutch'` and is simply never surfaced on the Dutch track. The Chai
Diary is the working pattern to copy.

### Tier 2 — multiplies what is already built

**3. Wire Dutch into the spaced-repetition engine.** `lib/review.ts` is a full
SM-2 implementation already powering the Hindi daily review. Feeding Dutch
vocabulary, missed KNM questions and weak cheatsheet topics into one daily
queue is the single cheapest large gain available, because retention under
time pressure is what the exam actually measures. Revisit the decision in §4.

**4. An exam-readiness view.** There is no answer to "am I ready to book?".
A per-paper readiness signal, built from existing mock scores and studied
counts, would turn scattered progress into one decision. High motivational
value for a learner with a deadline, low build cost.

**5. Calibrate the mocks, then add a full mock-exam day.** Current drills are
20/20/30 questions against a real ~25/~25/40. Fix the lengths first, then allow
sitting all five papers back to back under time.

### Tier 3 — content depth

**6. Lezen genre and A2 depth.** Only 4 of 10 texts are A2, and they are
narrative paragraphs ("My day", "What I eat"). The real paper uses authentic
documents: gemeente letters, leaflets, ads, schedules, forms, notices. The
genre mismatch matters more than the count. Also `Buying an OV-chipkaart` is
stale (OVpay).

**7. Vocabulary toward ~600-800.** 208 is a solid core but far short of the
~1,500-2,000 an A2 candidate is usually credited with. Grow it in themed exam
sets rather than one bulk drop, and only alongside item 3, since words that are
never reviewed are not learned.

**8. Luisteren realism.** Clips are a single synthetic TTS voice with no
overlap, no background noise and unnatural pacing. The real paper has natural
speed and multiple speakers. Hardest gap to close; lowest priority because it
needs real recordings.

### Explicitly not worth doing yet

- B1 content of any kind. It is out of scope for this exam.
- More A1 material. That level is well covered.
- XP or leveling systems. They do not move an exam result.

---

## 7. How to use the app to actually pass

Feature work is only half of it. The study pattern matters as much:

1. **Book the exam date first.** Everything below works better against a
   deadline, and the papers are booked separately.
2. **Daily, small, spoken aloud.** Twenty minutes every day beats three hours
   on Sunday. Read every Dutch sentence out loud rather than silently; the
   speaking paper rewards mouth-familiarity, not recognition.
3. **KNM is the cheapest pass.** 132 questions across all 8 themes, 40 on the
   paper, pass at 28. It is pure knowledge with no language production. Clear
   it early for the confidence and to take one paper off the list.
4. **Drill weak spots, not favourites.** `getWeakTopics` already exists in the
   cheatsheet engine. Re-reading what you know feels productive and is not.
5. **Simulate conditions before booking.** Timed, no notes, no pausing. A score
   under exam pressure is the only score that predicts the real one.
