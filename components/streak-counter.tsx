'use client'

import { useEffect, useState } from 'react'
import { getStreak, updateStreak } from '@/lib/progress'

export function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    updateStreak()
    setStreak(getStreak())
  }, [])

  return (
    <div className="flex items-center gap-2 bg-orange-100 rounded-full px-4 py-2 w-fit">
      <span className="text-2xl">🔥</span>
      <span className="font-bold text-orange-700">{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
  )
}
