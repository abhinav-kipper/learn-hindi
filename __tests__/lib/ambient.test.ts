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

  it('stopAmbient hard-stops every element it started (no orphaned loops)', async () => {
    // Regression: a start/stop during the old fade-out orphaned a looping clip
    // that nothing could stop. stopAmbient() must pause EVERY element.
    // NB: a real class is required here — vi.fn().mockImplementation() does not
    // run its body when invoked with `new`, so it can't capture instances.
    const instances: Array<{ pause: ReturnType<typeof vi.fn> }> = []
    class MockAudio {
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      loop = false
      preload = ''
      volume = 0
      src = ''
      constructor(public url: string) {
        instances.push(this)
      }
    }
    global.Audio = MockAudio as unknown as typeof Audio
    localStorage.setItem('bolna-seekho-ambient', '1')

    const { startAmbient, stopAmbient } = await import('@/lib/ambient')
    startAmbient('hindi') // element 0
    startAmbient('dutch') // switches track: tears down 0, starts element 1
    expect(instances.length).toBe(2)

    stopAmbient()
    // Neither element may be left looping.
    for (const inst of instances) expect(inst.pause).toHaveBeenCalled()
  })

  it('toggleMute stops the ambient bed when muting (mute is authoritative)', async () => {
    // The regression: muting only wrote a flag; an already-looping ambient bed
    // kept playing because the flag is read only when ambient *starts*.
    const stopAmbient = vi.fn()
    vi.doMock('@/lib/ambient', () => ({
      stopAmbient,
      startAmbient: vi.fn(),
      isAmbientOn: () => false,
      setAmbientOn: vi.fn(),
    }))
    localStorage.setItem('bolna-seekho-muted', 'false') // start unmuted
    const { toggleMute } = await import('@/lib/sounds')

    expect(toggleMute()).toBe(true) // now muted
    expect(stopAmbient).toHaveBeenCalledTimes(1)

    // Unmuting must NOT stop it again.
    expect(toggleMute()).toBe(false)
    expect(stopAmbient).toHaveBeenCalledTimes(1)

    vi.doUnmock('@/lib/ambient')
  })
})
