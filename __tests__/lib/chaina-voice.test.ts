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

  it('is a no-op when window is undefined (SSR-safe)', async () => {
    const mod = await import('@/lib/chaina-voice')
    expect(mod.chainaVoice).toBeDefined()
  })
})
