'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Cute Moments — Duolingo-style. A bouncy emoji + text popup that springs in
 * from screen center, holds briefly, and fades out. Fires via a global hook
 * from anywhere. A short cooldown prevents stacking.
 */

interface Moment {
  id: number
  emoji: string
  text: string
}

interface CuteMomentsAPI {
  /** Show a specific moment. */
  show: (emoji: string, text?: string) => void
  /** Show a random encouraging moment from the pool. */
  cheer: () => void
}

const Ctx = createContext<CuteMomentsAPI | null>(null)

// Mix Hindi exclamations with English ones — feels native to the app.
const POOL: Array<{ emoji: string; text: string }> = [
  { emoji: '🌟', text: 'Shabash!' },
  { emoji: '✨', text: 'Bahut accha!' },
  { emoji: '🎉', text: 'Wah!' },
  { emoji: '🙌', text: 'Kya baat!' },
  { emoji: '🔥', text: 'Mast!' },
  { emoji: '💯', text: 'Bilkul sahi!' },
  { emoji: '⭐', text: 'Nice!' },
  { emoji: '👏', text: 'Brilliant!' },
  { emoji: '🎯', text: 'Spot on!' },
  { emoji: '💪', text: 'Keep going!' },
  { emoji: '🌈', text: 'You got this!' },
  { emoji: '🎊', text: 'Awesome!' },
]

const COOLDOWN_MS = 1200

export function CuteMomentsProvider({ children }: { children: ReactNode }) {
  const [moment, setMoment] = useState<Moment | null>(null)
  const lastShownRef = useRef(0)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((emoji: string, text = '') => {
    const now = Date.now()
    if (now - lastShownRef.current < COOLDOWN_MS) return
    lastShownRef.current = now

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    const id = now
    setMoment({ id, emoji, text })
    dismissTimerRef.current = setTimeout(() => {
      setMoment(m => (m?.id === id ? null : m))
    }, 1600)
  }, [])

  const cheer = useCallback(() => {
    const pick = POOL[Math.floor(Math.random() * POOL.length)]
    show(pick.emoji, pick.text)
  }, [show])

  return (
    <Ctx.Provider value={{ show, cheer }}>
      {children}
      <AnimatePresence>
        {moment && (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="fixed inset-x-0 top-[28%] z-[100] flex justify-center pointer-events-none"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-1 bg-white rounded-3xl shadow-2xl px-7 py-5 border-2 border-amber-300">
              <motion.span
                className="text-5xl"
                initial={{ rotate: -12 }}
                animate={{ rotate: [-12, 12, -6, 6, 0] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {moment.emoji}
              </motion.span>
              {moment.text && (
                <p className="text-base font-extrabold text-amber-700 tracking-tight">
                  {moment.text}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useCuteMoments(): CuteMomentsAPI {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Safe no-op fallback so callers don't need to null-check
    return { show: () => {}, cheer: () => {} }
  }
  return ctx
}
