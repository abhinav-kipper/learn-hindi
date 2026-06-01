import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('ambient soundscape', () => {
  let originalAudio: typeof Audio

  function mockAudio() {
    const ctor = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      loop: false,
      preload: '',
      volume: 0,
      set src(_: string) {},
      get src() {
        return ''
      },
    }))
    global.Audio = ctor as unknown as typeof Audio
    return ctor
  }

  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    originalAudio = global.Audio
  })

  afterEach(() => {
    global.Audio = originalAudio
  })

  it('defaults to off', async () => {
    const { isAmbientOn } = await import('@/lib/ambient')
    expect(isAmbientOn()).toBe(false)
  })

  it('persists the on/off preference', async () => {
    mockAudio()
    const { isAmbientOn, setAmbientOn } = await import('@/lib/ambient')
    setAmbientOn(true, 'hindi')
    expect(isAmbientOn()).toBe(true)
    expect(localStorage.getItem('bolna-seekho-ambient')).toBe('1')
    setAmbientOn(false, 'hindi')
    expect(isAmbientOn()).toBe(false)
    expect(localStorage.getItem('bolna-seekho-ambient')).toBe('0')
  })

  it('does not start audio while disabled', async () => {
    const ctor = mockAudio()
    const { startAmbient } = await import('@/lib/ambient')
    startAmbient('hindi')
    expect(ctor).not.toHaveBeenCalled()
  })

  it('does not start audio while globally muted, even when enabled', async () => {
    const ctor = mockAudio()
    localStorage.setItem('bolna-seekho-ambient', '1')
    localStorage.setItem('bolna-seekho-muted', 'true')
    const { startAmbient } = await import('@/lib/ambient')
    startAmbient('hindi')
    expect(ctor).not.toHaveBeenCalled()
  })

  it('starts a looping clip for the track when enabled and unmuted', async () => {
    const ctor = mockAudio()
    localStorage.setItem('bolna-seekho-ambient', '1')
    const { startAmbient } = await import('@/lib/ambient')
    startAmbient('dutch')
    expect(ctor).toHaveBeenCalledWith('/audio/ambient/dutch.mp3')
  })
})
