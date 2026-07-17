import { expect, test } from '@playwright/test'

const routes = ['ui', 'astiango', 'cloud', 'calendar', 'midori'] as const

for (const route of routes) {
  test(`${route} renders without icon ligatures leaking into the interface`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await page.goto(`/${route}`)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('main, .q-page').first()).toBeVisible()

    expect(await page.locator('.material-icons').count()).toBe(0)
    expect(await page.locator('.material-icons-round').count()).toBeGreaterThan(0)
    expect(consoleErrors).toEqual([])

    await expect(page).toHaveScreenshot(`${route}-${testInfo.project.name}.png`, { fullPage: true })
  })
}

test('desktop product navigation remains persistent after changing routes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'))

  await page.goto('/ui')
  const drawer = page.locator('.product-shell__drawer')
  await expect(drawer).toBeVisible()
  await page.getByRole('link', { name: /AstianGO/ }).click()
  await expect(page).toHaveURL(/\/astiango$/)
  await expect(drawer).toBeVisible()
})

test('mobile product navigation closes after selecting a product', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'))

  await page.goto('/ui')
  await page.getByRole('button', { name: 'Abrir navegación' }).click()
  const drawer = page.locator('.product-shell__drawer')
  await expect(drawer).toBeVisible()
  await page.getByRole('link', { name: /Astian Cloud/ }).click()
  await expect(page).toHaveURL(/\/cloud$/)
  await expect(drawer).toBeHidden()
})

test('overlay demo opens its dropdown and keeps it available for interaction', async ({ page }) => {
  await page.goto('/ui')
  await page.getByRole('button', { name: 'Abrir menú' }).click()

  await expect(page.getByText('Duplicar vista', { exact: true })).toBeVisible()
  await expect(page.getByText('Mover a producto', { exact: true })).toBeVisible()
  await expect(page.locator('.q-menu.a-dropdown')).toHaveCSS('opacity', '1')

  await page.getByText('Duplicar vista', { exact: true }).click()
  await expect(page.locator('.q-menu.a-dropdown')).toBeHidden()
  await expect(page.getByText('Cambios guardados', { exact: true })).toBeVisible()
})
