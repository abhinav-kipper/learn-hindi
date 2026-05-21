// Shared speech utility for Hindi and Dutch text read-aloud
// Uses Google Translate TTS via our own proxy (avoids CORS, free, no API key)
// Falls back to browser speechSynthesis if Google TTS fails

let currentAudio: HTMLAudioElement | null = null

/** Strip content in parentheses (typically English translations) */
function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim()
}

/** Generate TTS URL via our own API proxy */
function getTTSUrl(text: string, ttsLocale = 'hi'): string {
  const encoded = encodeURIComponent(text.slice(0, 200))
  return `/api/tts?text=${encoded}&lang=${ttsLocale}`
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

/** Speak text in the given locale using Google Translate TTS with fallback to browser */
export function speak(text: string, ttsLocale = 'hi', onEnd?: () => void): void {
  if (typeof window === 'undefined') return

  stopSpeaking()

  const cleaned = stripParenthetical(text)
  if (!cleaned) {
    onEnd?.()
    return
  }

  const chunks = splitText(cleaned)
  playChunks(chunks, 0, ttsLocale, onEnd)
}

/** Speak Hindi text — kept for backward compatibility */
export function speakHindi(text: string): void {
  speak(text, 'hi')
}

function playChunks(chunks: string[], index: number, ttsLocale = 'hi', onEnd?: () => void): void {
  if (index >= chunks.length) {
    currentAudio = null
    onEnd?.()
    return
  }

  const url = getTTSUrl(chunks[index], ttsLocale)
  const audio = new Audio(url)

  audio.onended = () => {
    playChunks(chunks, index + 1, ttsLocale, onEnd)
  }

  audio.onerror = () => {
    console.warn('Google TTS failed, falling back to browser voice')
    fallbackSpeak(chunks.slice(index).join(' '), ttsLocale, onEnd)
  }

  currentAudio = audio
  audio.play().catch(() => {
    fallbackSpeak(chunks.slice(index).join(' '), ttsLocale, onEnd)
  })
}

/** Fallback: use browser speechSynthesis */
function fallbackSpeak(text: string, ttsLocale = 'hi', onEnd?: () => void): void {
  if (!window.speechSynthesis) {
    onEnd?.()
    return
  }

  const bcp47 = ttsLocale === 'nl' ? 'nl-NL' : 'hi-IN'
  const utterance = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  const voice =
    voices.find((v) => v.lang === bcp47) ||
    voices.find((v) => v.lang.startsWith(ttsLocale))
  if (voice) utterance.voice = voice
  utterance.lang = bcp47
  utterance.rate = 0.9
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

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
