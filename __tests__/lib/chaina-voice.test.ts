import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('chainaVoice', () => {
  let originalAudio: typeof Audio
  let originalSpeechSynth: typeof window.speechSynthesis

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    originalAudio = global.Audio
    originalSpeechSynth = window.speechSynthesis
  })

  afterEach(() => {
    global.Audio = originalAudio
    Object.defineProperty(window, 'speechSynthesis', { value: originalSpeechSynth, configurable: true })
  })

  it('falls back to speechSynthesis when Audio fails', async () => {
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockRejectedValue(new Error('404')),
      pause: vi.fn(),
      set src(_: string) {},
      get src() { return '' },
      set onerror(fn: () => void) { setTimeout(fn, 0) },
      volume: 1,
    })) as unknown as typeof Audio

    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.setClipBase('/chaina')
    chainaVoice.play('tap', 0, 'fallback text')

    await new Promise(r => setTimeout(r, 50))
    expect(speakSpy).toHaveBeenCalledTimes(1)
  })

  it('respects the global bolna-seekho-muted key', async () => {
    localStorage.setItem('bolna-seekho-muted', '1')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello')
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it("respects bolna-seekho-muted when stored as 'true' (the value toggleMute writes)", async () => {
    localStorage.setItem('bolna-seekho-muted', 'true')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello')
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it('unmuting restores the voice in the same session (no sticky global mute)', async () => {
    // Regression: caching the global mute into this.muted left the mascot
    // silent after unmute until reload if it first inited while muted.
    localStorage.setItem('bolna-seekho-muted', 'true')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello') // inits while muted → stays silent
    expect(speakSpy).not.toHaveBeenCalled()

    localStorage.setItem('bolna-seekho-muted', 'false') // user unmutes
    chainaVoice.speak('hello again') // must speak now, not stay stuck
    expect(speakSpy).toHaveBeenCalledTimes(1)
  })

  it('respects the chaina-voice-muted key', async () => {
    localStorage.setItem('chaina-voice-muted', '1')
    const speakSpy = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: speakSpy, cancel: vi.fn(), getVoices: () => [], onvoiceschanged: null },
      configurable: true,
    })
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.speak('hello')
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it('setMuted(true) persists to chaina-voice-muted', async () => {
    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.setMuted(true)
    expect(localStorage.getItem('chaina-voice-muted')).toBe('1')
    expect(chainaVoice.isMuted()).toBe(true)
  })

  it('prime() plays a silent clip once to unlock audio, then is a no-op', async () => {
    const playSpy = vi.fn().mockResolvedValue(undefined)
    const ctor = vi.fn(function (this: Record<string, unknown>) {
      this.play = playSpy
      this.pause = vi.fn()
      this.volume = 1
    })
    global.Audio = ctor as unknown as typeof Audio

    const { chainaVoice } = await import('@/lib/chaina-voice')
    chainaVoice.prime()
    chainaVoice.prime()
    chainaVoice.prime()
    expect(ctor).toHaveBeenCalledTimes(1)
    expect(playSpy).toHaveBeenCalledTimes(1)
  })

  it('is a no-op when window is undefined (SSR-safe)', async () => {
    const mod = await import('@/lib/chaina-voice')
    expect(mod.chainaVoice).toBeDefined()
  })
})
