'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getSentenceGameById } from '@/lib/sentence-game'
import { SentenceBuilderGame } from '@/components/games/SentenceBuilderGame'

export default function SentencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const game = getSentenceGameById(id)
  if (!game) notFound()
  return <SentenceBuilderGame game={game} />
}
