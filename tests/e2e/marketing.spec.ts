import { expect, test } from '@playwright/test'

const mobileViewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 414, height: 896 }
] as const

for (const viewport of mobileViewports) {
  test(`marketing navigation reflows at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/marketing-preview')

    const mobileTrigger = page.getByRole('button', { name: 'Abrir navegación' })
    await expect(mobileTrigger).toBeVisible()
    await expect(page.locator('.a-marketing-navigation__desktop')).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1)

    await mobileTrigger.click()
    const dialog = page.getByRole('dialog', { name: 'Navegación' })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cerrar navegación' })).toBeFocused()

    const targets = dialog.locator('a[href], summary, button:not(:disabled)')
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index)
      if (!await target.isVisible()) continue
      const box = await target.boundingBox()
      expect(box, `target ${index} at ${viewport.width}px`).not.toBeNull()
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(mobileTrigger).toBeFocused()
  })
}

test('marketing navigation uses the two-column desktop panel at 768px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/marketing-preview')

  await expect(page.locator('.a-marketing-navigation__desktop')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir navegación' })).toBeHidden()

  const trigger = page.getByRole('button', { name: 'Productos' })
  await trigger.focus()
  await trigger.press('ArrowDown')

  const panel = page.locator('.a-marketing-navigation__panel:visible')
  await expect(panel).toBeVisible()
  await expect(panel.locator('.a-marketing-navigation__panel-link').first()).toBeFocused()

  const columns = await panel.locator('.a-marketing-navigation__columns').evaluate((element) => (
    getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length
  ))
  expect(columns).toBe(2)

  const panelBox = await panel.boundingBox()
  expect(panelBox).not.toBeNull()
  expect(panelBox?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0)).toBeLessThanOrEqual(768)

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()

  const outlineWidth = await trigger.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))
  expect(outlineWidth).toBeGreaterThanOrEqual(2)

  const localeTargets = page.locator('.marketing-preview__utility .a-locale-switch__link')
  for (let index = 0; index < await localeTargets.count(); index += 1) {
    const box = await localeTargets.nth(index).boundingBox()
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  }
})

test('marketing CSS honors reduced motion and primary action contrast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/marketing-preview')

  const action = page.locator('.marketing-preview__intro .a-marketing-action')
  const reducedMotionMatches = await page.evaluate(() => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))
  expect(reducedMotionMatches).toBe(true)
  const transitionDuration = await action.evaluate((element) => getComputedStyle(element).transitionDuration)
  const transitionSeconds = transitionDuration.split(',').map((duration) => parseFloat(duration))
  expect(Math.max(...transitionSeconds)).toBeLessThanOrEqual(0.00001)

  const contrastRatio = await action.evaluate((element) => {
    const parse = (value: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext('2d', { colorSpace: 'srgb' })
      if (!context) return [0, 0, 0]
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3))
      return channels.map((channel) => {
        const normalized = channel / 255
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4
      })
    }
    const luminance = (channels: number[]) => (
      channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
    )
    const styles = getComputedStyle(element)
    const foreground = luminance(parse(styles.color))
    const background = luminance(parse(styles.backgroundColor))
    const lighter = Math.max(foreground, background)
    const darker = Math.min(foreground, background)
    return (lighter + 0.05) / (darker + 0.05)
  })

  expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
})
