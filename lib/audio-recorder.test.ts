import { describe, it, expect } from 'vitest'
import {
  encodeWav,
  toMono,
  wavDurationSeconds,
  WAV_SAMPLE_RATE,
} from './audio-recorder'

const ascii = (dv: DataView, off: number, len: number) =>
  Array.from({ length: len }, (_, i) => String.fromCharCode(dv.getUint8(off + i))).join('')

describe('encodeWav', () => {
  it('writes a RIFF/WAVE header Gemini will accept', () => {
    const dv = new DataView(encodeWav(new Float32Array(1000), WAV_SAMPLE_RATE))
    expect(ascii(dv, 0, 4)).toBe('RIFF')
    expect(ascii(dv, 8, 4)).toBe('WAVE')
    expect(ascii(dv, 12, 4)).toBe('fmt ')
    expect(ascii(dv, 36, 4)).toBe('data')
  })

  it('declares 16-bit mono PCM at the target sample rate', () => {
    const dv = new DataView(encodeWav(new Float32Array(100), WAV_SAMPLE_RATE))
    expect(dv.getUint16(20, true)).toBe(1) // PCM
    expect(dv.getUint16(22, true)).toBe(1) // mono
    expect(dv.getUint32(24, true)).toBe(WAV_SAMPLE_RATE)
    expect(dv.getUint16(34, true)).toBe(16) // bits
    expect(dv.getUint32(28, true)).toBe(WAV_SAMPLE_RATE * 2) // byte rate
    expect(dv.getUint16(32, true)).toBe(2) // block align
  })

  it('sizes the buffer as header + 2 bytes per sample', () => {
    const buf = encodeWav(new Float32Array(500), WAV_SAMPLE_RATE)
    expect(buf.byteLength).toBe(44 + 500 * 2)
    expect(new DataView(buf).getUint32(40, true)).toBe(500 * 2)
  })

  it('declares a RIFF size of everything after the first 8 bytes', () => {
    const buf = encodeWav(new Float32Array(300), WAV_SAMPLE_RATE)
    expect(new DataView(buf).getUint32(4, true)).toBe(buf.byteLength - 8)
  })

  it('downsamples a higher input rate rather than changing pitch', () => {
    // 48 kHz in, 16 kHz out, so a third of the samples survive.
    const buf = encodeWav(new Float32Array(4800), 48000)
    expect(buf.byteLength).toBe(44 + 1600 * 2)
  })

  it('never upsamples when the input is already below the target', () => {
    const buf = encodeWav(new Float32Array(800), 8000)
    expect(buf.byteLength).toBe(44 + 800 * 2)
  })

  it('round-trips sample values', () => {
    const dv = new DataView(encodeWav(Float32Array.from([0, 0.5, -0.5]), WAV_SAMPLE_RATE))
    expect(dv.getInt16(44, true)).toBe(0)
    expect(dv.getInt16(46, true)).toBeCloseTo(0x7fff * 0.5, -1)
    expect(dv.getInt16(48, true)).toBeCloseTo(-0x8000 * 0.5, -1)
  })

  it('clips a hot mic instead of wrapping it into noise', () => {
    // Without the clamp, 2.0 would overflow Int16 and come back negative,
    // which sounds like loud static rather than a loud voice.
    const dv = new DataView(encodeWav(Float32Array.from([2, -2]), WAV_SAMPLE_RATE))
    expect(dv.getInt16(44, true)).toBe(0x7fff)
    expect(dv.getInt16(46, true)).toBe(-0x8000)
  })

  it('handles an empty recording without throwing', () => {
    expect(encodeWav(new Float32Array(0), WAV_SAMPLE_RATE).byteLength).toBe(44)
  })
})

describe('toMono', () => {
  it('returns the single channel untouched', () => {
    const ch = Float32Array.from([0.1, 0.2])
    expect(toMono([ch])).toBe(ch)
  })

  it('averages stereo channels', () => {
    const out = toMono([Float32Array.from([1, 0]), Float32Array.from([0, 1])])
    expect(Array.from(out)).toEqual([0.5, 0.5])
  })

  it('averages more than two channels', () => {
    const out = toMono([
      Float32Array.from([3]),
      Float32Array.from([0]),
      Float32Array.from([0]),
    ])
    expect(out[0]).toBeCloseTo(1)
  })

  it('returns an empty buffer for no channels', () => {
    expect(toMono([]).length).toBe(0)
  })
})

describe('wavDurationSeconds', () => {
  it('ignores the 44-byte header', () => {
    expect(wavDurationSeconds(44)).toBe(0)
  })

  it('reads one second of 16-bit mono at the target rate', () => {
    expect(wavDurationSeconds(44 + WAV_SAMPLE_RATE * 2)).toBe(1)
  })

  it('never reports a negative duration for a truncated blob', () => {
    expect(wavDurationSeconds(10)).toBe(0)
  })
})
