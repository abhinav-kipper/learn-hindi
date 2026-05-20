'use client'

interface ProgressDotsProps {
  total: number
  current: number
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-indigo-500'
              : i < current
              ? 'w-1.5 bg-indigo-300'
              : 'w-1.5 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
