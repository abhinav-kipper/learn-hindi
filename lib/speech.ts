// Shared speech synthesis utility for Hindi text read-aloud

let currentUtterance: SpeechSynthesisUtterance | null = null

/** Strip content in parentheses (typically English translations) */
function stripParenthetical(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim()
}

/** Speak Hindi text aloud using the browser's speech synthesis */
export function speakHindi(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  // Stop any current speech
  stopSpeaking()

  const cleaned = stripParenthetical(text)
  const utterance = new SpeechSynthesisUtterance(cleaned)

  // Prefer a Hindi voice
  const voices = window.speechSynthesis.getVoices()
  const hindiVoice =
    voices.find((v) => v.lang === 'hi-IN') ||
    voices.find((v) => v.lang.startsWith('hi'))
  if (hindiVoice) utterance.voice = hindiVoice
  utterance.lang = 'hi-IN'
  utterance.rate = 0.9

  utterance.onend = () => { currentUtterance = null }
  utterance.onerror = () => { currentUtterance = null }

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

/** Stop any current speech */
export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  currentUtterance = null
}

/** Check if currently speaking */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  return window.speechSynthesis.speaking
}
