'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Lesson } from '@/types/lesson'
import { ProgressDots } from './progress-dots'
import { SectionIntro } from './section-intro'
import { SectionPhrases } from './section-phrases'
import { SectionGrammar } from './section-grammar'
import { SectionCulture } from './section-culture'
import { SectionSkills } from './section-skills'
import { SectionCta } from './section-cta'
import { FeatureTooltip } from '@/components/feature-tooltip'
import { playSound } from '@/lib/sounds'

type Section = 'intro' | 'phrases' | 'grammar' | 'culture' | 'skills' | 'cta'

interface LessonFlowProps {
  lesson: Lesson
}

export function LessonFlow({ lesson }: LessonFlowProps) {
  const sections = useMemo(() => {
    const s: Section[] = ['intro', 'phrases']
    if (lesson.grammar_notes.length > 0) s.push('grammar')
    if (lesson.culture_notes.length > 0) s.push('culture')
    s.push('skills', 'cta')
    return s
  }, [lesson])

  const [sectionIndex, setSectionIndex] = useState(0)
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
    grammar: 'Grammar',
    culture: 'Culture',
    skills: 'Skills',
    cta: 'Practice',
  }

  const sectionVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  }

  const sectionBg: Record<Section, string> = {
    intro: 'bg-gradient-to-b from-indigo-50 to-white dark:from-[#0f0f18] dark:to-[var(--bg-base)]',
    phrases: 'bg-gradient-to-b from-violet-50 to-white dark:from-[#12101c] dark:to-[var(--bg-base)]',
    grammar: 'bg-gradient-to-b from-emerald-50 to-white dark:from-[#0f1412] dark:to-[var(--bg-base)]',
    culture: 'bg-gradient-to-b from-amber-50 to-white dark:from-[#14120f] dark:to-[var(--bg-base)]',
    skills: 'bg-gradient-to-b from-sky-50 to-white dark:from-[#0f1214] dark:to-[var(--bg-base)]',
    cta: 'bg-gradient-to-b from-pink-50 to-white dark:from-[#14101c] dark:to-[var(--bg-base)]',
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'intro': return <SectionIntro lesson={lesson} onNext={goNext} />
      case 'phrases': return <SectionPhrases phrases={lesson.phrases} onNext={goNext} />
      case 'grammar': return <SectionGrammar notes={lesson.grammar_notes} onNext={goNext} />
      case 'culture': return <SectionCulture notes={lesson.culture_notes} onNext={goNext} />
      case 'skills': return <SectionSkills skills={lesson.skill_breakdown} onNext={goNext} />
      case 'cta': return <SectionCta lesson={lesson} />
    }
  }

  return (
    <div className={`h-dvh flex flex-col ${sectionBg[currentSection]} transition-colors duration-500`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 safe-top">
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
      </div>

      {/* Quick action bar */}
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
        <Link
          href={`/practice/${lesson.id}`}
          className="text-xs px-3 py-1 rounded-full bg-[var(--accent)] text-white font-medium ml-1 hover:opacity-90 transition-colors"
        >
          💬 Practice
        </Link>
      </div>

      {/* Section content */}
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
