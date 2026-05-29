import manifestJson from '@/content/hindi/sounds-audio.json'

// Romanized spoken string → pre-rendered mp3 filename, produced by
// scripts/generate-audio.mjs (Anika Hindi voice, fed the Devanagari `dev`
// forms). Empty until generated; callers fall back to live TTS otherwise.
const manifest = manifestJson as Record<string, string>

/** URL of the pre-rendered clip for a spoken string, or null if none exists. */
export function getHindiSoundsAudioUrl(text: string): string | null {
  const file = manifest[text.trim()]
  return file ? `/audio/hi-sounds/${file}` : null
}
