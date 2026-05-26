import type { Page } from '@playwright/test'
import freshSeed from './seeds/fresh.json'
import midSeed from './seeds/mid-progress.json'

type Seed = 'fresh' | 'mid-progress'

const SEEDS: Record<Seed, Record<string, unknown>> = {
  'fresh': freshSeed,
  'mid-progress': midSeed,
}

/**
 * Seeds localStorage with the named fixture, then navigates to the target so
 * the app reads the seeded state on mount.
 */
export async function seedAndGoto(page: Page, seed: Seed, path: string): Promise<void> {
  // Visit a same-origin page first so localStorage is accessible.
  await page.goto('/_dev/components')
  await page.evaluate((data) => {
    localStorage.clear()
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    }
  }, SEEDS[seed])
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
}
