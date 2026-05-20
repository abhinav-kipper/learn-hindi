// Sound effects system using Web Audio API — no audio files needed!
// Generates short, subtle sounds programmatically.

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
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.value = frequency
  oscillator.type = type
  gainNode.gain.setValueAtTime(volume, start)
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

function playNoise(duration: number, volume = 0.15, filterFreq = 1000) {
  const ctx = getAudioContext()
  if (!ctx) return

  const bufferSize = ctx.sampleRate * duration
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
  filter.Q.value = 1.0

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + duration)
}

function playSoundTap() {
  // Short click/pop: 5ms, 800Hz sine wave, quick decay
  playTone(800, 0.05, 'sine', 0.2)
}

function playSoundCorrect() {
  // Happy ascending two-tone: C5 → E5
  const ctx = getAudioContext()
  if (!ctx) return
  playTone(523, 0.12, 'sine', 0.25, ctx.currentTime)
  playTone(659, 0.18, 'sine', 0.25, ctx.currentTime + 0.12)
}

function playSoundWrong() {
  // Short low buzz with slight wobble
  const ctx = getAudioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.08)
  oscillator.frequency.linearRampToValueAtTime(210, ctx.currentTime + 0.15)
  oscillator.type = 'sawtooth'
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.15)
}

function playSoundComplete() {
  // Celebratory ascending arpeggio: C5 → E5 → G5 → C6
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    playTone(freq, 0.15, 'sine', 0.2, ctx.currentTime + i * 0.12)
  })
}

function playSoundSwipe() {
  // Soft whoosh: white noise, 100ms, bandpass filter
  playNoise(0.1, 0.1, 2000)
}

function playSoundStreak() {
  // Sparkly chime: high sine + harmonics
  const ctx = getAudioContext()
  if (!ctx) return
  playTone(1200, 0.15, 'sine', 0.15, ctx.currentTime)
  playTone(1800, 0.12, 'sine', 0.1, ctx.currentTime + 0.05)
  playTone(2400, 0.2, 'sine', 0.08, ctx.currentTime + 0.1)
}

function playSoundLevelup() {
  // Triumphant fanfare: chord C+E+G played together
  const ctx = getAudioContext()
  if (!ctx) return
  playTone(523, 0.4, 'sine', 0.15, ctx.currentTime)
  playTone(659, 0.4, 'sine', 0.12, ctx.currentTime)
  playTone(784, 0.4, 'sine', 0.12, ctx.currentTime)
  // Add a higher octave after a beat
  playTone(1047, 0.3, 'sine', 0.1, ctx.currentTime + 0.2)
}

function playSoundPop() {
  // Bubbly pop: 50ms, 600Hz sine with quick pitch drop
  const ctx = getAudioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.setValueAtTime(600, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05)
  oscillator.type = 'sine'
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.06)
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
