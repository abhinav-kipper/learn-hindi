// Shared speech utility for Hindi text read-aloud
// Uses Google Translate TTS for natural Hindi pronunciation (free, no API key)
// Falls back to browser speechSynthesis if Google TTS fails

let currentAudio: HTMLAudioElement | null = null

/** Strip content in parentheses (typically English translations) */
function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim()
}

/**
 * Generate Google Translate TTS URL for Hindi text
 * Uses the same endpoint Google Translate uses (undocumented but stable)
 * Limit: ~200 characters per request
 */
function getGoogleTTSUrl(text: string): string {
  const encoded = encodeURIComponent(text.slice(0, 200))
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encoded}`
}

/**
 * Split long text into chunks under 200 chars at word boundaries
 */
function splitText(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }

    // Find last space before maxLen
    let splitIdx = remaining.lastIndexOf(' ', maxLen)
    if (splitIdx === -1) splitIdx = maxLen

    chunks.push(remaining.slice(0, splitIdx))
    remaining = remaining.slice(splitIdx).trim()
  }

  return chunks
}

/** Speak Hindi text using Google Translate TTS with fallback to browser */
export function speakHindi(text: string): void {
  if (typeof window === 'undefined') return

  stopSpeaking()

  const cleaned = stripParenthetical(text)
  if (!cleaned) return

  const chunks = splitText(cleaned)
  playChunks(chunks, 0)
}

function playChunks(chunks: string[], index: number): void {
  if (index >= chunks.length) {
    currentAudio = null
    return
  }

  const url = getGoogleTTSUrl(chunks[index])
  const audio = new Audio(url)

  audio.onended = () => {
    playChunks(chunks, index + 1)
  }

  audio.onerror = () => {
    // Fallback to browser speech synthesis
    console.warn('Google TTS failed, falling back to browser voice')
    fallbackSpeak(chunks.slice(index).join(' '))
  }

  currentAudio = audio
  audio.play().catch(() => {
    // If autoplay blocked or CORS issue, fallback
    fallbackSpeak(chunks.slice(index).join(' '))
  })
}

/** Fallback: use browser speechSynthesis */
function fallbackSpeak(text: string): void {
  if (!window.speechSynthesis) return

  const utterance = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  const hindiVoice =
    voices.find((v) => v.lang === 'hi-IN') ||
    voices.find((v) => v.lang.startsWith('hi'))
  if (hindiVoice) utterance.voice = hindiVoice
  utterance.lang = 'hi-IN'
  utterance.rate = 0.9

  window.speechSynthesis.speak(utterance)
}

/** Stop any current speech */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/** Check if currently speaking */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false
  if (currentAudio && !currentAudio.paused) return true
  if (window.speechSynthesis?.speaking) return true
  return false
}
