'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WELCOMED_KEY = 'dutch-welcomed'

export function DutchWelcomeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(WELCOMED_KEY)) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(WELCOMED_KEY, '1')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl border border-[var(--border)] p-8 max-w-sm w-full pointer-events-auto">
              <div className="text-center mb-5">
                <span className="text-5xl">🇳🇱</span>
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] text-center mb-2">
                Welkom bij Nederlands!
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
                Welcome to Dutch mode
              </p>
              <div className="space-y-2 text-sm text-[var(--text-secondary)] mb-6">
                <p>• <strong>Foundations</strong> — grammar rules and building blocks</p>
                <p>• <strong>Situations</strong> — real conversations (supermarket, café, doctor…)</p>
                <p>• Each session is a tutor-style drill — Dutch first, English always nearby</p>
                <p>• Your Hindi progress is untouched — switch back anytime</p>
              </div>
              <button
                onClick={dismiss}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-2xl shadow-md"
              >
                Laten we beginnen! 🚀
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
