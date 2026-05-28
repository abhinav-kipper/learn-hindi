import type { Story } from '@/types/story'

import chaiStall from '@/content/stories/01-chai-stall.json'
import lostInBazaar from '@/content/stories/02-lost-in-bazaar.json'
import sundayWithNani from '@/content/stories/03-sunday-with-nani.json'
import diwaliNight from '@/content/stories/04-diwali-night.json'
import atTheDoctor from '@/content/stories/05-at-the-doctor.json'

const stories: Story[] = [
  chaiStall as Story,
  lostInBazaar as Story,
  sundayWithNani as Story,
  diwaliNight as Story,
  atTheDoctor as Story,
]

export function getAllStories(): Story[] {
  return stories
}

export function getStoryById(id: string): Story | undefined {
  return stories.find(s => s.id === id)
}
