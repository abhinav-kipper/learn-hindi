'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAllCategories, getTotalWordCount, getTotalLearnedCount, getLearnedCountForCategory, VocabCategory } from '@/lib/vocabulary'

export default function VocabularyPage() {
  const [categories, setCategories] = useState<VocabCategory[]>([])
  const [totalLearned, setTotalLearned] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [categoryProgress, setCategoryProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const cats = getAllCategories()
    setCategories(cats)
    setTotalWords(getTotalWordCount())
    setTotalLearned(getTotalLearnedCount())

    const progress: Record<string, number> = {}
    cats.forEach(cat => {
      progress[cat.id] = getLearnedCountForCategory(cat.id)
    })
    setCategoryProgress(progress)
  }, [])

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Vocabulary 📚
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {totalLearned} / {totalWords} words explored
        </p>
        {/* Progress bar */}
        <div className="mt-3 w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalWords > 0 ? `${(totalLearned / totalWords) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-4">
        {categories.map((category, index) => {
          const learned = categoryProgress[category.id] || 0
          const total = category.words.length
          const progressPct = total > 0 ? (learned / total) * 100 : 0

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link href={`/vocabulary/${category.id}`}>
                <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${category.gradient} text-white shadow-lg hover:shadow-xl transition-shadow`}>
                  {/* Background decoration */}
                  <div className="absolute top-2 right-3 text-4xl opacity-30">
                    {category.emoji}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{category.emoji}</span>
                      <h2 className="text-lg font-bold">{category.title}</h2>
                    </div>
                    <p className="text-sm text-white/80 mb-3">
                      {learned}/{total} words explored
                    </p>

                    {/* Mini progress bar */}
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/80 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
