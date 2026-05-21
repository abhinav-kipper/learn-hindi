// Sound effects system using Web Audio API — no audio files needed!
// Rich, playful sounds with multiple oscillators, proper envelopes, and layered effects.

export type SoundType = 'tap' | 'correct' | 'wrong' | 'complete' | 'swipe' | 'streak' | 'levelup' | 'pop'

const MUTE_KEY = 'bolna-seekho-muted'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  // Resume if suspended (iOS requirement)
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

/** Play a tone with proper attack/release envelope to avoid clicks */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startTime?: number
) {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = startTime ?? ctx.currentTime
  const attackTime = 0.008 // 8ms attack to avoid click
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.value = frequency
  oscillator.type = type

  // Envelope: ramp up quickly, then decay
  gainNode.gain.setValueAtTime(0.001, start)
  gainNode.gain.exponentialRampToValueAtTime(volume, start + attackTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

  oscillator.start(start)
  oscillator.stop(start + duration + 0.01)
}

/** Play a noise burst with bandpass filter */
function playNoise(duration: number, volume = 0.3, filterFreq = 1000, filterQ = 1.0, startTime?: number) {
  const ctx = getAudioContext()
  if (!ctx) return

  const start = startTime ?? ctx.currentTime
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = filterQ

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.001, start)
  gainNode.gain.exponentialRampToValueAtTime(volume, start + 0.005)
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start(start)
  source.stop(start + duration + 0.01)
}

/** Crisp, snappy click. Higher frequency, sharper attack. */
function playSoundTap() {
  const ctx = getAudioContext()
  if (!ctx) return

  // Main click tone
  playTone(1200, 0.04, 'sine', 0.5)
  // Subtle noise layer for texture
  playNoise(0.03, 0.15, 3000, 2.0)
}

/** Happy, bright "ding-ding!" — two quick ascending notes (C6 -> E6) */
function playSoundCorrect() {
  const ctx = getAudioContext()
  if (!ctx) return

  // C6 = 1047Hz, E6 = 1319Hz
  playTone(1047, 0.15, 'sine', 0.6, ctx.currentTime)
  playTone(1319, 0.2, 'sine', 0.6, ctx.currentTime + 0.1)
  // Add a subtle harmonic layer
  playTone(2094, 0.12, 'sine', 0.15, ctx.currentTime)
  playTone(2637, 0.15, 'sine', 0.15, ctx.currentTime + 0.1)
}

/** Distinctive low "bonk" — short 200Hz with quick pitch drop to 100Hz */
function playSoundWrong() {
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12)
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.001, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.008)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.22)

  // Low noise burst for "thud" texture
  playNoise(0.08, 0.12, 200, 0.5)
}

/** Triumphant ascending arpeggio: C5 -> E5 -> G5 -> C6, notes overlapping */
function playSoundComplete() {
  const ctx = getAudioContext()
  if (!ctx) return

  // C5=523, E5=659, G5=784, C6=1047
  const notes = [523, 659, 784, 1047]
  const spacing = 0.1

  notes.forEach((freq, i) => {
    const t = ctx.currentTime + i * spacing
    playTone(freq, 0.25, 'sine', 0.6, t)
    // Add octave harmonic for shimmer
    playTone(freq * 2, 0.2, 'sine', 0.15, t)
  })

  // Sparkle noise at the end
  playNoise(0.15, 0.1, 4000, 3.0, ctx.currentTime + notes.length * spacing)
}

/** Satisfying swoosh — noise with bandpass filter and frequency sweep */
function playSoundSwipe() {
  const ctx = getAudioContext()
  if (!ctx) return

  const duration = 0.12
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(800, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + duration * 0.7)
  filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + duration)
  filter.Q.value = 1.5

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.001, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start(ctx.currentTime)
  source.stop(ctx.currentTime + duration + 0.01)
}

/** Magical sparkle — multiple high-frequency notes in quick succession like tiny bells */
function playSoundStreak() {
  const ctx = getAudioContext()
  if (!ctx) return

  const baseFreqs = [2400, 2800, 3200, 2600, 3000]
  baseFreqs.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.05
    // Slight randomization for sparkle feel
    const randomizedFreq = freq + (Math.random() - 0.5) * 200
    playTone(randomizedFreq, 0.12, 'sine', 0.5, t)
  })

  // Subtle shimmer noise
  playNoise(0.25, 0.08, 5000, 4.0)
}

/** Big reward! Full chord (C4+E4+G4+C5) that swells and fades. ~600ms */
function playSoundLevelup() {
  const ctx = getAudioContext()
  if (!ctx) return

  // Major chord: C4=262, E4=330, G4=392, C5=523
  const chordFreqs = [262, 330, 392, 523]
  const duration = 0.6
  const swellTime = 0.1

  chordFreqs.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'

    // Swell up then fade
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.6 / chordFreqs.length * 1.8, ctx.currentTime + swellTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration + 0.01)
  })

  // Add octave doublings for richness
  playTone(523, 0.5, 'sine', 0.2, ctx.currentTime + 0.05)
  playTone(1047, 0.4, 'sine', 0.1, ctx.currentTime + 0.1)

  // Bright noise burst for impact
  playNoise(0.15, 0.12, 3000, 2.0, ctx.currentTime + 0.02)
}

/** Bouncy, bubbly pop — quick sine at 800Hz with pitch drop to 400Hz in 80ms */
function playSoundPop() {
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.setValueAtTime(800, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.001, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.005)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.12)

  // Subtle noise burst for texture
  playNoise(0.04, 0.1, 2000, 1.5)
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

export function playSound(type: SoundType): void {
  if (typeof window === 'undefined') return
  if (isMuted()) return

  try {
    soundFunctions[type]()
  } catch {
    // Silently ignore audio errors (e.g., user hasn't interacted yet)
  }
}
