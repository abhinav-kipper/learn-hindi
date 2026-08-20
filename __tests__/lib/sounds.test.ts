import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Regression tests for playSound's clip → synth fallback. The bug: playClip()
// returned true whenever a clip was in the manifest, even when the clip failed
// to play (cold cache after a service-worker purge, decode error), so playSound
// returned without ever reaching the synth — silent buttons.

describe('playSound clip/synth fallback', () => {
  let originalAudio: typeof Audio
  const win = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown }
  let originalAC: unknown
  let originalWebkitAC: unknown

  /** Mock HTMLAudioElement whose play() resolves or rejects on demand. */
  function setupAudio(mode: 'resolve' | 'reject') {
    const playSpy = vi.fn(() =>
      mode === 'resolve' ? Promise.resolve() : Promise.reject(new Error('cannot play')),
    )
    class MockAudio {
      currentTime = 0
      volume = 0
      preload = ''
      src: string
      play = playSpy
      constructor(src: string) {
        this.src = src
      }
    }
    global.Audio = MockAudio as unknown as typeof Audio
    return playSpy
  }

  /** Minimal Web-Audio mock; returns the createOscillator spy so a test can
   *  assert whether the synth voice actually ran. */
  function setupAudioContext() {
    const createOscillator = vi.fn(() => ({
      connect: vi.fn(),
      frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      type: 'sine',
      start: vi.fn(),
      stop: vi.fn(),
    }))
    const ctx = {
      state: 'running',
      resume: vi.fn(),
      currentTime: 0,
      destination: {},
      sampleRate: 44100,
      createOscillator,
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      })),
      createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(8) })),
      createBufferSource: vi.fn(() => ({ connect: vi.fn(), buffer: null, start: vi.fn(), stop: vi.fn() })),
      createBiquadFilter: vi.fn(() => ({
        connect: vi.fn(),
        type: '',
        frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        Q: { value: 0 },
      })),
    }
    // A plain function (not vi.fn) so `new AudioContext()` actually returns ctx
    // — a vi.fn mock does not run its body when invoked with `new`.
    win.AudioContext = function () {
      return ctx
    } as unknown as typeof AudioContext
    return createOscillator
  }

  const flush = () => new Promise((r) => setTimeout(r, 0))

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    originalAudio = global.Audio
    originalAC = win.AudioContext
    originalWebkitAC = win.webkitAudioContext
  })

  afterEach(() => {
    global.Audio = originalAudio
    win.AudioContext = originalAC
    win.webkitAudioContext = originalWebkitAC
  })

  it('falls back to the synth when a shipped clip fails to play', async () => {
    localStorage.setItem('bolna-seekho-muted', 'false')
    const playSpy = setupAudio('reject')
    const createOscillator = setupAudioContext()

    const { playSound } = await import('@/lib/sounds')
    playSound('tap')
    await flush() // let the play() rejection reach its .catch → synth

    expect(playSpy).toHaveBeenCalled()
    expect(createOscillator).toHaveBeenCalled() // synth voice actually fired
  })

  it('does not also fire the synth when the clip plays fine', async () => {
    localStorage.setItem('bolna-seekho-muted', 'false')
    const playSpy = setupAudio('resolve')
    const createOscillator = setupAudioContext()

    const { playSound } = await import('@/lib/sounds')
    playSound('tap')
    await flush()

    expect(playSpy).toHaveBeenCalled()
    expect(createOscillator).not.toHaveBeenCalled()
  })

  it('plays nothing at all when muted', async () => {
    localStorage.setItem('bolna-seekho-muted', 'true')
    const playSpy = setupAudio('resolve')
    const createOscillator = setupAudioContext()

    const { playSound } = await import('@/lib/sounds')
    playSound('tap')
    await flush()

    expect(playSpy).not.toHaveBeenCalled()
    expect(createOscillator).not.toHaveBeenCalled()
  })
})
