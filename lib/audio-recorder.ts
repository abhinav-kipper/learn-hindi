/**
 * Shared browser audio capture, used by the pronunciation coach and the
 * Spreken (speaking) module.
 *
 * Two things make this fiddly enough to be worth sharing:
 *
 * 1. **Gemini will not take what MediaRecorder gives us.** Browsers record to
 *    webm (Chrome/Android) or mp4 (Safari/iOS); the Gemini audio API accepts
 *    wav/mp3/ogg/flac/aac. So we decode and re-encode to 16 kHz mono 16-bit
 *    WAV in the browser before uploading.
 * 2. **This is the only capture path that works on an iPhone.** The Web Speech
 *    API (`components/voice-button.tsx`) is deliberately disabled on iOS Safari
 *    and on an installed iOS PWA because it is present but non-functional
 *    there. MediaRecorder is supported, so anything that must work on the
 *    learner's phone records audio and transcribes server-side instead.
 */

/** 16 kHz mono is plenty for speech and keeps the upload small. */
export const WAV_SAMPLE_RATE = 16000

/** Pick a container the browser can actually record. '' means "let it choose". */
export function pickMime(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg']
  if (typeof MediaRecorder === 'undefined') return ''
  return (
    types.find((t) => {
      try {
        return MediaRecorder.isTypeSupported(t)
      } catch {
        return false
      }
    }) || ''
  )
}

/** True when this browser can record at all. */
export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = reject
    r.readAsDataURL(blob)
  })

/**
 * Mix to mono by averaging the channels. Returns `channels[0]` untouched when
 * there is only one, so the common case allocates nothing.
 */
export function toMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0)
  if (channels.length === 1) return channels[0]
  const len = channels[0].length
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    let sum = 0
    for (const ch of channels) sum += ch[i] ?? 0
    out[i] = sum / channels.length
  }
  return out
}

/**
 * Encode mono float samples as a 16-bit PCM WAV at WAV_SAMPLE_RATE,
 * downsampling by nearest-neighbour. Pure, so it is unit tested directly.
 */
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const ratio = Math.max(1, sampleRate / WAV_SAMPLE_RATE)
  const outLen = Math.floor(samples.length / ratio)
  const dataSize = outLen * 2
  const buf = new ArrayBuffer(44 + dataSize)
  const dv = new DataView(buf)
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i))
  }
  w(0, 'RIFF')
  dv.setUint32(4, 36 + dataSize, true)
  w(8, 'WAVE')
  w(12, 'fmt ')
  dv.setUint32(16, 16, true) // PCM chunk size
  dv.setUint16(20, 1, true) // format = PCM
  dv.setUint16(22, 1, true) // mono
  dv.setUint32(24, WAV_SAMPLE_RATE, true)
  dv.setUint32(28, WAV_SAMPLE_RATE * 2, true) // byte rate
  dv.setUint16(32, 2, true) // block align
  dv.setUint16(34, 16, true) // bits per sample
  w(36, 'data')
  dv.setUint32(40, dataSize, true)
  let off = 44
  for (let i = 0; i < outLen; i++) {
    // Clamp before scaling, so a hot mic clips rather than wrapping around
    // into noise.
    const s = Math.max(-1, Math.min(1, samples[Math.floor(i * ratio)]))
    dv.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    off += 2
  }
  return buf
}

/** Decode a recorded blob and re-encode it as WAV that Gemini will accept. */
export async function blobToWav(blob: Blob): Promise<Blob> {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AC()
  try {
    const audio = await ctx.decodeAudioData(await blob.arrayBuffer())
    const channels: Float32Array[] = []
    for (let c = 0; c < audio.numberOfChannels; c++) channels.push(audio.getChannelData(c))
    return new Blob([encodeWav(toMono(channels), audio.sampleRate)], { type: 'audio/wav' })
  } finally {
    try {
      await ctx.close()
    } catch {
      /* already closed */
    }
  }
}

/**
 * Roughly how long a WAV blob plays for, in seconds. Used to tell a learner
 * they barely said anything before we spend a model call on it.
 */
export function wavDurationSeconds(byteLength: number): number {
  const data = Math.max(0, byteLength - 44)
  return data / (WAV_SAMPLE_RATE * 2)
}
