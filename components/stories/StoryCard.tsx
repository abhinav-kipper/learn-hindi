'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sticker, COLORS, FONTS } from '@/components/design'
import { isStoryRead } from '@/lib/stories-progress'
import { playSound } from '@/lib/sounds'
import type { Story } from '@/types/story'

const W = '#fff' // @design-allow: white literal

type StoryCardProps = {
  story: Story
  index: number
}

const PALETTE_ROTATION = [COLORS.peach2, COLORS.butter, COLORS.mint2] as const

export function StoryCard({ story, index }: StoryCardProps) {
  const router = useRouter()
  const [read, setRead] = useState(false)
  const bg = PALETTE_ROTATION[index % PALETTE_ROTATION.length]

  useEffect(() => {
    setRead(isStoryRead(story.id))
  }, [story.id])

  const open = () => {
    playSound('tap')
    router.push(`/stories/${story.id}`)
  }

  return (
    <Sticker color={bg} onClick={open} radius={18} padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 18,
              color: COLORS.ink,
              lineHeight: 1.15,
              marginBottom: 4,
            }}
          >
            {story.title}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.ink60, lineHeight: 1.3 }}>
            {story.description}
          </div>
        </div>
        {read && (
          <div
            aria-label="Read"
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: COLORS.mint,
              border: `2.5px solid ${COLORS.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.ink,
              flexShrink: 0,
            }}
          >
            ✓
          </div>
        )}
      </div>
    </Sticker>
  )
}
