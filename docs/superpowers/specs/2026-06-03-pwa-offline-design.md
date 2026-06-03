# PWA Offline — caching + status banner

**Date:** 2026-06-03
**Status:** Shipped (merged to `main`)
**Audience:** The app owner (single learner), then any learner on a flaky or
absent connection. Both languages (Hindi + Dutch); the work is global.

## Problem

The app is installed as a PWA but did not actually work offline:

1. **No offline boot.** `public/sw.js` handled notifications only and cached
   nothing ("does NOT cache network responses"). A cold load with no network
   failed even though all the *data* is already local.
2. **No offline awareness.** Nothing told the user they had dropped offline, so
   features that need the network (AI chat, pronunciation) just failed with raw
   errors and no explanation.

What was *already* local (so the gap was caching + signaling, not data):

- All content (lessons/foundations/vocab/stories/KNM/Lezen/Luisteren) is bundled
  JSON, built into the app.
- All progress/activity is `localStorage` (no DB, no account, no server writes).
- ~640 pre-generated mp3 clips are committed under `public/audio`, `public/chaina`,
  `public/stroopwafel`.
- Fonts are self-hosted by `next/font` at build time.

## Goal

Make the PWA load and work offline for everything that doesn't fundamentally
need a server, and make offline mode visible — without changing the local-only
data model or touching existing features.

## What shipped

### 1. Service-worker caching (`public/sw.js`)

Hand-written (no `next-pwa`/workbox dependency — keeps it Next 16-safe).
Registration is unchanged (`registerServiceWorker()` in `layout-shell.tsx`).

Strategies (GET only — POST like `/api/chat` is never intercepted):

| Request | Strategy | Why |
|---|---|---|
| `/_next/static/*` | cache-first | content-hashed, immutable |
| `/audio`, `/chaina`, `/stroopwafel` | cache-first | pre-generated mp3s, static |
| `/api/tts` | cache-first, FIFO cap 300 (`TTS_MAX_ENTRIES`) | deterministic per text+lang; a phrase spoken once works offline after |
| navigations (HTML) | network-first → cached page → `offline.html` | fresh online; any visited route works offline |
| other same-origin GET | stale-while-revalidate | icons, manifest, RSC flight payloads |
| `/api/chat`, `/api/pronounce` | network-only | real-time Gemini, must stay fresh |

- **Versioning:** bump `CACHE_VERSION` to invalidate all `bs-*` caches on the
  next deploy (cleared in `activate`).
- **Graceful TTS degrade:** a missed `/api/tts` while offline returns
  `Response.error()`, which `lib/speech.ts` already falls back to browser
  `speechSynthesis` for.
- New `public/offline.html` (Chai-Galli-styled static fallback). Manifest gained
  `id` + `scope: "/"`.

### 2. Offline status banner (`components/offline-banner.tsx`)

A slim pill slides down from the top when the device goes offline ("you're
offline — saved lessons still work") and shows a brief green "back online"
confirmation (2.5s) on reconnect. Mounted once in `layout-shell.tsx`. TDD'd
(4 tests).

- Driven by the browser `online`/`offline` events; syncs with `navigator.onLine`
  on mount.
- `pointerEvents: 'none'` → it can never intercept a tap, so no existing feature
  is affected even where it visually overlaps.
- Renders nothing when online (SSR-safe, zero footprint during normal use).
- Layered at z-index 80: below the daily-goal modal (90/91), feature tooltips
  (100-102), and the gloss popover (81); above page content. No clash with the
  bottom-anchored prompts (z50) or Chaina stage (z55).

## Explicitly out of scope

- **AI chat + pronunciation offline.** They fundamentally need the LLM; offline
  they surface a network error by design (offline.html explains this). A richer
  in-app "this needs internet" mode for those screens was considered and
  deferred.
- **Cross-device / cloud sync of progress.** See below — there is intentionally
  no server, so this is a non-goal, not a regression.

## Progress & sync (clarification)

There is **no sync** and nothing is "missing" offline. All progress/activity
(streak, lesson completion, daily active-minutes ticker, quiz scores, mistakes,
favorites, vocab, Dutch attempts, Chaina memory) writes **synchronously to
`localStorage`** regardless of connectivity, so offline progress is committed
instantly and never queued or lost. There is no online→offline reconciliation
step because there is no server/DB to reconcile against. The SW Cache API is
fully separate from `localStorage`. The by-design tradeoff: progress is
per-browser/per-device; multi-device sync would require an account + backend the
app deliberately doesn't have.

## Verification

`next build` ✓ · `tsc --noEmit` ✓ · `vitest run` (356 tests, 4 new) ✓ ·
`lint:design` ✓. SW + offline.html + manifest validated (syntax/JSON/HTML).
