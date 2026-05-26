'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StoryReader } from '@/components/stories/StoryReader'
import { getStoryById } from '@/lib/stories'
import { FONTS, COLORS } from '@/components/design'
import type { Story } from '@/types/story'

export default function StoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [story, setStory] = useState<Story | null | undefined>(undefined)

  useEffect(() => {
    if (!params?.id) return
    const found = getStoryById(params.id)
    setStory(found ?? null)
  }, [params?.id])

  if (story === undefined) return null
  if (story === null) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: FONTS.body, color: COLORS.ink }}>
        Story not found.{' '}
        <button onClick={() => router.push('/')} style={{ textDecoration: 'underline', background: 'transparent', border: 'none', color: COLORS.ink, fontFamily: FONTS.body, cursor: 'pointer' }}>
          Back to home
        </button>
      </div>
    )
  }

  return <StoryReader story={story} />
}
