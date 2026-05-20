'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/lib/sounds'

interface SwipeableCarouselProps {
  items: React.ReactNode[]
  onComplete?: () => void
}

export function SwipeableCarousel({ items, onComplete }: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = () => {
    if (currentIndex < items.length - 1) {
      setDirection(1)
      setCurrentIndex(i => i + 1)
      playSound('swipe')
    } else if (onComplete) {
      onComplete()
    }
  }

  const prev = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(i => i - 1)
      playSound('swipe')
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  }

  return (
    <div className="flex flex-col items-center flex-1">
      {/* Card area */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 || info.velocity.x < -500) next()
              else if (info.offset.x > 50 || info.velocity.x > 500) prev()
            }}
            className="absolute w-full px-6"
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + counter */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-[var(--accent)] scale-125' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">{currentIndex + 1} / {items.length}</p>
      </div>
    </div>
  )
}
