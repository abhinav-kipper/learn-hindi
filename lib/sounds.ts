// Sound effects — Web Audio API, no asset files. Tuned to feel cute and
// friendly (Duolingo-ish): sine + triangle waves, major intervals, rising
// pitch glides for positive feedback, soft minor steps for negative.

export type SoundType = 'tap' | 'correct' | 'wrong' | 'complete' | 'swipe' | 'streak' | 'levelup' | 'pop'

const MUTE_KEY = 'bolna-seekho-muted'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

export function isMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === 'true'
}

export function toggleMute(): boolean {
  const newMuted = !isMuted()
  localStorage.setItem(MUTE_KEY, String(newMuted))
  return newMuted
}

/** Single tone with soft attack and exponential decay. */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startTime?: number,
) {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = startTime ?? ctx.currentTime
  const attackTime = 0.01
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = frequency
  osc.type = type

  gain.gain.setValueAtTime(0.001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + attackTime)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  osc.start(start)
  osc.stop(start + duration + 0.01)
}

/** Tone with a pitch glide — the secret to "cute". */
function playGlide(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startTime?: number,
) {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = startTime ?? ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(startFreq, start)
  osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration)

  gain.gain.setValueAtTime(0.001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  osc.start(start)
  osc.stop(start + duration + 0.01)
}

/** Filtered noise burst. */
function playNoise(duration: number, volume = 0.2, filterFreq = 3000, filterQ = 3.0, startTime?: number) {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = startTime ?? ctx.currentTime
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = filterQ

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(start)
  source.stop(start + duration + 0.01)
}

// === TAP — soft "boop", rising pitch ===
function playSoundTap() {
  // Quick upward glide feels friendly, like a button press in a cartoon
  playGlide(700, 1000, 0.07, 'sine', 0.35)
  // Subtle octave for warmth
  playTone(2000, 0.04, 'sine', 0.06)
}

// === POP — bubble burst, sharp pitch swoop ===
function playSoundPop() {
  // Sharp downward glide = popping bubble
  playGlide(1200, 500, 0.1, 'sine', 0.5)
  // Tiny high blip at start for "pop" impact
  playTone(1800, 0.018, 'sine', 0.25)
}

// === SWIPE — light paper-turn whoosh ===
function playSoundSwipe() {
  const ctx = getAudioContext()
  if (!ctx) return

  const duration = 0.13
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Sweep from high to mid — papery, not industrial
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(3200, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + duration)
  filter.Q.value = 2.5

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(ctx.currentTime)
  source.stop(ctx.currentTime + duration + 0.01)
}

// === CORRECT — bright two-note ascending chime ("ding-DING!") ===
function playSoundCorrect() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  // First note: E5 (659Hz)
  playTone(659, 0.16, 'sine', 0.5, now)
  playTone(1318, 0.12, 'sine', 0.22, now + 0.005)   // octave shimmer

  // Second note (70ms later): G5 (784Hz) — major third up
  // The rising interval is what makes it feel positive
  playTone(784, 0.3, 'sine', 0.55, now + 0.09)
  playTone(1568, 0.22, 'sine', 0.28, now + 0.1)     // octave shimmer
  playTone(2349, 0.14, 'sine', 0.08, now + 0.1)     // top harmonic for brightness

  // Glitter on the second note
  playNoise(0.06, 0.05, 6500, 4.0, now + 0.08)
}

// === WRONG — cute, soft "uh-oh" — descending minor second ===
function playSoundWrong() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  // Triangle wave instead of sine + noise — softer, more cartoon-like
  // Two descending notes: E4 → D4 (whole step down) for friendly "no"
  playTone(330, 0.16, 'triangle', 0.4, now)
  playTone(165, 0.16, 'sine', 0.12, now)            // sub-octave body

  playTone(294, 0.22, 'triangle', 0.42, now + 0.14)
  playTone(147, 0.22, 'sine', 0.13, now + 0.14)     // sub-octave body
}

// === COMPLETE — ascending arpeggio + sustained sparkle ===
function playSoundComplete() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  // C major arpeggio C5-E5-G5-C6
  const notes = [523, 659, 784, 1047]
  const spacing = 0.07
  notes.forEach((freq, i) => {
    const t = now + i * spacing
    playTone(freq, 0.18, 'sine', 0.5, t)
    playTone(freq * 2, 0.14, 'sine', 0.16, t + 0.005)   // octave shimmer
  })

  // Hold the top note longer with bright overtones
  const peakStart = now + notes.length * spacing
  playTone(1047, 0.55, 'sine', 0.42, peakStart)
  playTone(2093, 0.42, 'sine', 0.18, peakStart + 0.01)
  playTone(3136, 0.3, 'sine', 0.08, peakStart + 0.02)

  // Sparkle on top
  playNoise(0.12, 0.07, 5500, 3.5, peakStart)
}

// === SWIPE replaced — already above ===

// === STREAK — twinkling fairy-dust bells ===
function playSoundStreak() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  // Random little bells, mostly diatonic to C major (so they stay musical):
  // C7, D7, E7, G7, C7, E7
  const notes = [2093, 2349, 2637, 3136, 2093, 2637]
  notes.forEach((freq, i) => {
    const t = now + i * 0.055
    const jitter = 1 + (Math.random() - 0.5) * 0.04
    playTone(freq * jitter, 0.12, 'sine', 0.4, t)
    // Octave below for body so they aren't piercing
    playTone(freq * jitter * 0.5, 0.08, 'sine', 0.08, t)
  })

  // Continuous shimmer noise underneath the cascade
  playNoise(0.32, 0.05, 7000, 5.0, now + 0.03)
}

// === LEVELUP — fanfare + held major chord + sparkle ===
function playSoundLevelup() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  // Ascending fanfare: C5 → E5 → G5 (fast)
  const fanfare = [523, 659, 784]
  fanfare.forEach((freq, i) => {
    const t = now + i * 0.06
    playTone(freq, 0.12, 'sine', 0.5, t)
    playTone(freq * 2, 0.1, 'sine', 0.2, t + 0.005)
  })

  // Big held C major chord arrives on the fanfare peak
  const chordStart = now + 0.2
  const chordFreqs = [523, 659, 784, 1047]   // C5 E5 G5 C6
  const duration = 0.75
  chordFreqs.forEach(freq => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.001, chordStart)
    gain.gain.exponentialRampToValueAtTime(0.45 / chordFreqs.length * 1.8, chordStart + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, chordStart + duration)

    osc.start(chordStart)
    osc.stop(chordStart + duration + 0.01)
  })

  // Octave doublings for richness
  playTone(1047, 0.55, 'sine', 0.28, chordStart + 0.04)
  playTone(2093, 0.4, 'sine', 0.12, chordStart + 0.08)

  // Bright impact sparkle
  playNoise(0.2, 0.1, 4500, 2.8, chordStart)
  playNoise(0.15, 0.06, 8000, 5.0, chordStart + 0.04)
}

const soundFunctions: Record<SoundType, () => void> = {
  tap: playSoundTap,
  correct: playSoundCorrect,
  wrong: playSoundWrong,
  complete: playSoundComplete,
  swipe: playSoundSwipe,
  streak: playSoundStreak,
  levelup: playSoundLevelup,
  pop: playSoundPop,
}

// Haptic patterns matched to each sound — same expressive intent, just felt.
// Numbers are ms; arrays alternate vibrate/pause/vibrate/...
const haptics: Record<SoundType, number | number[]> = {
  tap: 8,
  pop: 10,
  swipe: 12,
  correct: 20,
  wrong: [30, 30, 30],
  streak: [10, 40, 10, 40, 10],
  complete: [20, 50, 30, 50, 40],
  levelup: [40, 40, 60, 40, 100],
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  try { navigator.vibrate(pattern) } catch { /* ignore */ }
}

export function playSound(type: SoundType): void {
  if (typeof window === 'undefined') return
  if (isMuted()) return

  vibrate(haptics[type])

  try {
    soundFunctions[type]()
  } catch {
    // Silently ignore audio errors (e.g., user hasn't interacted yet)
  }
}
