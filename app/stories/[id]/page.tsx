'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StoryReader } from '@/components/stories/StoryReader'
import { getStoryById } from '@/lib/stories'
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
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
        Story not found.{' '}
        <button onClick={() => router.push('/')} style={{ textDecoration: 'underline' }}>
          Back to home
        </button>
      </div>
    )
  }

  return <StoryReader story={story} />
}
