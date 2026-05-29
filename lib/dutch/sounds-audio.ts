import manifestJson from '@/content/dutch/sounds-audio.json'

// text → pre-rendered mp3 filename, produced by scripts/generate-audio.mjs.
// Empty until the ElevenLabs generation has been run; callers fall back to
// live TTS for anything not listed here.
const manifest = manifestJson as Record<string, string>

/** URL of the pre-rendered clip for a spoken string, or null if none exists. */
export function getSoundsAudioUrl(text: string): string | null {
  const file = manifest[text.trim()]
  return file ? `/audio/sounds/${file}` : null
}
