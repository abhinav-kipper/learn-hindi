'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getDuelById } from '@/lib/games'
import { DuelGame } from '@/components/games/DuelGame'

export default function DuelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const duel = getDuelById(id)
  if (!duel) notFound()
  return <DuelGame duel={duel} />
}
