'use client'

interface ProgressDotsProps {
  total: number
  current: number
  onTap?: (index: number) => void
  labels?: string[]
}

export function ProgressDots({ total, current, onTap, labels }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onTap?.(i)}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'h-2 w-8 bg-[var(--accent)]'
              : i < current
              ? 'h-2 w-2 bg-[var(--accent)]/50'
              : 'h-2 w-2 bg-[var(--border)]'
          }`}
          aria-label={labels?.[i] || `Section ${i + 1}`}
        />
      ))}
    </div>
  )
}
