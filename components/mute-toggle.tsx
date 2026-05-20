'use client'

import { useState, useEffect } from 'react'
import { isMuted, toggleMute } from '@/lib/sounds'

export function MuteToggle() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(isMuted())
  }, [])

  const handleToggle = () => {
    const newMuted = toggleMute()
    setMuted(newMuted)
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white transition-all duration-150"
    >
      {muted ? (
        // Muted icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75Z" />
          <path d="M14.22 7.22a.75.75 0 0 1 1.06 0L16.5 8.44l1.22-1.22a.75.75 0 1 1 1.06 1.06L17.56 9.5l1.22 1.22a.75.75 0 1 1-1.06 1.06L16.5 10.56l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22-1.22-1.22a.75.75 0 0 1 0-1.06Z" />
        </svg>
      ) : (
        // Sound on icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
          <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      )}
    </button>
  )
}
