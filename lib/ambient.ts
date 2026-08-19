// Ambient soundscapes — a faint, looping background bed per learning track
// (a chai-stall hum for Hindi, a café terrace for Dutch). Opt-in and OFF by
// default: a low-volume loop that starts on a user gesture, respects the
// global sound mute, and fades in so it never jars.
//
// Audio is pre-rendered once via scripts/generate-audio.mjs (ELEVEN_AMBIENT=1)
// into public/audio/ambient/<track>.mp3. Until those clips are shipped this is
// a silent no-op — start() just fails to load and is swallowed.

const AMBIENT_KEY = 'bolna-seekho-ambient' // '1' = on (default off)
const MUTE_KEY = 'bolna-seekho-muted'

export type AmbientTrack = 'hindi' | 'dutch'

let el: HTMLAudioElement | null = null
let currentTrack: AmbientTrack | null = null
let fadeTimer: ReturnType<typeof setInterval> | null = null

// Every element we've started, so stopAmbient() can guarantee none keeps
// looping. The old teardown faded out via the shared timer and only paused in
// the fade's callback; a start/stop firing during that fade cancelled it before
// the pause ran, orphaning a looping clip with no reference to stop it (silent
// only on tab close, and immune to the off toggle + mute). Tracking every
// element makes teardown total.
const activeEls = new Set<HTMLAudioElement>()

const TARGET_VOLUME = 0.14

export function isAmbientOn(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(AMBIENT_KEY) === '1'
  } catch {
    return false
  }
}

function isGloballyMuted(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(MUTE_KEY) === 'true' || localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
}

/** Linearly ramp `audio.volume` to `to` over `ms`, then optionally run `done`. */
function fade(audio: HTMLAudioElement, to: number, ms: number, done?: () => void) {
  clearFade()
  const from = audio.volume
  const steps = Math.max(1, Math.round(ms / 50))
  let step = 0
  fadeTimer = setInterval(() => {
    step++
    const v = from + ((to - from) * step) / steps
    try {
      audio.volume = Math.min(1, Math.max(0, v))
    } catch {
      /* ignore */
    }
    if (step >= steps) {
      clearFade()
      done?.()
    }
  }, 50)
}

/**
 * Start (or switch to) the ambient bed for a track. No-op when ambient is
 * disabled, the app is muted, or already playing this track. Must be called
 * from — or shortly after — a user gesture so autoplay isn't blocked.
 */
export function startAmbient(track: AmbientTrack): void {
  if (typeof window === 'undefined') return
  if (!isAmbientOn() || isGloballyMuted()) return
  if (el && currentTrack === track) return
  stopAmbient()

  const url = `/audio/ambient/${track}.mp3`
  try {
    const a = new Audio(url)
    a.loop = true
    a.volume = 0
    a.preload = 'auto'
    activeEls.add(a)
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => fade(a, TARGET_VOLUME, 1500)).catch(() => {
        // No clip shipped yet, or autoplay blocked — silently give up.
        teardown(a)
        if (el === a) {
          el = null
          currentTrack = null
        }
      })
    }
    el = a
    currentTrack = track
  } catch {
    el = null
    currentTrack = null
  }
}

/** Immediately and permanently silence one element (no cancellable fade). */
function teardown(a: HTMLAudioElement): void {
  try {
    a.pause()
    a.loop = false
    a.src = ''
  } catch {
    /* ignore */
  }
  activeEls.delete(a)
}

/**
 * Hard-stop EVERY ambient element so none can keep looping. Deliberately
 * skips the graceful fade-out: a fade that can be cancelled mid-flight is what
 * orphaned looping clips before. Reliability wins over a 500ms fade here.
 */
export function stopAmbient(): void {
  clearFade()
  activeEls.forEach(teardown)
  activeEls.clear()
  el = null
  currentTrack = null
}

/**
 * Persist the on/off preference. Turning it on immediately starts `track`
 * (the toggle tap is the user gesture autoplay needs); turning it off stops.
 */
export function setAmbientOn(on: boolean, track: AmbientTrack): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AMBIENT_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (on) startAmbient(track)
  else stopAmbient()
}
