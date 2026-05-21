'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lesson } from '@/types/lesson'
import { ProgressDots } from './progress-dots'
import { SectionIntro } from './section-intro'
import { SectionPhrases } from './section-phrases'
import { SectionCta } from './section-cta'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'
import { computeLessonResume } from '@/lib/phrase-progress'
import { useLanguage } from '@/lib/language-context'

type Section = 'intro' | 'phrases' | 'cta'

interface LessonFlowProps {
  lesson: Lesson
}

export function LessonFlow({ lesson }: LessonFlowProps) {
  const router = useRouter()
  const { config } = useLanguage()
  const sections: Section[] = useMemo(() => {
    return ['intro', 'phrases', 'cta']
  }, [])

  // Resume position is computed ONCE on mount so opening a lesson the user
  // half-finished drops them where they left off (last viewed phrase or the
  // Practice CTA). Recomputing later would yank them mid-session.
  const resume = useMemo(
    () => computeLessonResume(lesson, config.storagePrefix),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [sectionIndex, setSectionIndex] = useState(resume.sectionIndex)
  const [direction, setDirection] = useState(0)

  const currentSection = sections[sectionIndex]

  const goNext = () => {
    if (sectionIndex < sections.length - 1) {
      setDirection(1)
      setSectionIndex(i => i + 1)
      playSound('swipe')
    }
  }

  const goBack = () => {
    if (sectionIndex > 0) {
      setDirection(-1)
      setSectionIndex(i => i - 1)
      playSound('swipe')
    }
  }

  const goTo = (index: number) => {
    setDirection(index > sectionIndex ? 1 : -1)
    setSectionIndex(index)
    playSound('tap')
  }

  const sectionLabels: Record<Section, string> = {
    intro: 'Intro',
    phrases: 'Phrases',
    cta: 'Practice',
  }

  const sectionVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  }

  const sectionBg: Record<Section, string> = {
    intro: 'bg-gradient-to-b from-indigo-50 to-white',
    phrases: 'bg-gradient-to-b from-violet-50 to-white',
    cta: 'bg-gradient-to-b from-pink-50 to-white',
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'intro': return <SectionIntro lesson={lesson} onNext={goNext} />
      case 'phrases': return (
        <SectionPhrases
          lessonId={lesson.id}
          phrases={lesson.phrases}
          grammarNotes={lesson.grammar_notes}
          cultureNotes={lesson.culture_notes}
          onNext={goNext}
          initialIndex={resume.phraseIndex}
        />
      )
      case 'cta': return <SectionCta lesson={lesson} />
    }
  }

  return (
    <div className={`h-dvh flex flex-col ${sectionBg[currentSection]} transition-colors duration-500`}>
      {/* Top bar — swipe down to go home */}
      <motion.div
        className="flex items-center justify-between px-4 pt-4 safe-top"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            router.push('/')
          }
        }}
      >
        <button
          onClick={goBack}
          disabled={sectionIndex === 0}
          className="text-sm text-[var(--text-tertiary)] disabled:opacity-0 w-12"
        >
          ←
        </button>
        <FeatureTooltip
          id="lesson"
          message="Swipe through sections — or tap these dots to jump."
          position="bottom"
        >
          <ProgressDots
            total={sections.length}
            current={sectionIndex}
            onTap={goTo}
            labels={sections.map(s => sectionLabels[s])}
          />
        </FeatureTooltip>
        <a href="/" className="text-sm text-[var(--text-tertiary)] w-12 text-right">✕</a>
      </motion.div>

      {/* Quick action bar — section labels only */}
      <div className="flex items-center justify-center gap-3 px-4 py-2">
        {sections.map((s, i) => (
          <button
            key={s}
            onClick={() => goTo(i)}
            className={`text-xs px-2.5 py-1 rounded-full transition-all ${
              i === sectionIndex
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      {/* Section content — use the dots/buttons to navigate; no horizontal
          swipe here so it doesn't fight the phrase carousel's swipes inside. */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSection}
            custom={direction}
            variants={sectionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex flex-col"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
