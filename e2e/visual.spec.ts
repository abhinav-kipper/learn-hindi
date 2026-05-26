import { test, expect } from '@playwright/test'
import { seedAndGoto } from './helpers'

test.describe('visual regression — Big 5 routes', () => {
  test('home — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/')
    await expect(page).toHaveScreenshot('home-fresh.png')
  })

  test('home — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/')
    await expect(page).toHaveScreenshot('home-mid-progress.png')
  })

  test('lesson — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/lessons/greetings')
    await expect(page).toHaveScreenshot('lesson-fresh.png')
  })

  test('lesson — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/lessons/greetings')
    await expect(page).toHaveScreenshot('lesson-mid-progress.png')
  })

  test('practice — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/practice/greetings')
    await expect(page).toHaveScreenshot('practice-fresh.png')
  })

  test('quiz — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/quiz')
    await expect(page).toHaveScreenshot('quiz-mid-progress.png')
  })

  test('progress — fresh', async ({ page }) => {
    await seedAndGoto(page, 'fresh', '/progress')
    await expect(page).toHaveScreenshot('progress-fresh.png')
  })

  test('progress — mid-progress', async ({ page }) => {
    await seedAndGoto(page, 'mid-progress', '/progress')
    await expect(page).toHaveScreenshot('progress-mid-progress.png')
  })
})
