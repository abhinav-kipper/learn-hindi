'use client'

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  /** BCP-47 locale to recognize (e.g. 'hi-IN', 'nl-NL'). Defaults to 'hi-IN'. */
  locale?: string
  /** Tooltip shown when idle. Defaults to 'Speak'. */
  listenLabel?: string
}

export interface VoiceButtonHandle {
  /** Start listening programmatically (e.g. from hands-free mode). */
  start: () => void
}

type ListenState = 'idle' | 'listening' | 'processing'

// Minimal type definitions for the Web Speech API (not in the default TS lib)
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  readonly isFinal: boolean
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
}

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
}

export const VoiceButton = forwardRef<VoiceButtonHandle, VoiceButtonProps>(function VoiceButton(
  { onTranscript, disabled = false, locale = 'hi-IN', listenLabel = 'Speak' },
  ref,
) {
  const [state, setState] = useState<ListenState>('idle')
  const [supported, setSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    // iOS Safari has the API in the window but it doesn't actually work
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isIOSSafari = isIOS && /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)

    // Also detect standalone PWA on iOS (no browser UA)
    const isStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
    const isIOSPWA = isIOS && isStandalone

    if (isIOSSafari || isIOSPWA) {
      setSupported(false)
    } else {
      setSupported(!!SpeechRecognitionAPI)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setState('idle')
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognitionRef.current = recognition

    recognition.lang = locale
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState('processing')
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setState('idle')
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionDenied(true)
      }
      setState('idle')
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setState((prev) => (prev === 'listening' ? 'idle' : prev))
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch {
      setState('idle')
      recognitionRef.current = null
    }
  }, [onTranscript, locale])

  useImperativeHandle(ref, () => ({
    start: () => {
      if (!supported || permissionDenied || disabled) return
      if (recognitionRef.current) return // already listening
      startListening()
    },
  }), [supported, permissionDenied, disabled, startListening])

  const handleClick = useCallback(() => {
    if (state === 'listening') {
      stopListening()
    } else {
      startListening()
    }
  }, [state, startListening, stopListening])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  if (!supported) return null

  if (permissionDenied) {
    return (
      <span className="text-xs text-red-400 px-2 self-center whitespace-nowrap">
        Mic denied
      </span>
    )
  }

  const isListening = state === 'listening'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled && !isListening}
      title={isListening ? 'Stop listening' : listenLabel}
      className={`relative flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all duration-200 shadow-sm
        ${isListening
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
    >
      {/* Pulsing ring when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.span
            key="pulse"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl bg-red-400"
          />
        )}
      </AnimatePresence>

      {/* Mic SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 relative z-10"
      >
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 10Z" />
      </svg>
    </button>
  )
})
