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

test('priority form and stepper contracts work together with native keyboard behavior', async ({ page }) => {
  await page.goto('/ui')

  const visibility = page.getByRole('group', { name: 'Visibilidad' })
  const team = visibility.getByRole('radio', { name: /Equipo/ })
  const link = visibility.getByRole('radio', { name: /Con enlace/ })
  await expect(team).toBeChecked()
  await team.focus()
  await team.press('ArrowRight')
  await expect(link).toBeChecked()

  await expect(page.locator('input[type="date"]')).toHaveAttribute('min', '2026-08-01')
  await expect(page.locator('input[type="datetime-local"]')).toHaveValue('2026-08-04T09:30')

  const progress = page.getByRole('navigation', { name: 'Progreso' })
  await expect(progress.getByRole('button', { name: /Detalles/ })).toHaveAttribute('aria-current', 'step')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(progress.getByRole('button', { name: /Acceso/ })).toHaveAttribute('aria-current', 'step')
})

test('cloud selection keeps one controlled model and exposes a keyboard move action', async ({ page }) => {
  await page.goto('/cloud')

  const grid = page.locator('.a-file-grid')
  const firstSelection = grid.getByRole('checkbox', { name: /Seleccionar/ }).first()
  await firstSelection.focus()
  await firstSelection.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a')
  const selection = grid.getByRole('checkbox', { name: /Seleccionar/ })
  await expect.poll(async () => selection.evaluateAll((inputs) => (
    inputs.every((input) => (input as HTMLInputElement).checked)
  ))).toBe(true)
  await expect(grid.getByRole('button', { name: /Mover .*…/ }).first()).toBeVisible()
})

test('desktop cloud marquee and internal drop emit controlled outcomes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'))
  await page.goto('/cloud')

  const cards = page.locator('.a-file-grid .a-file-card')
  const firstBox = await cards.nth(0).boundingBox()
  const secondBox = await cards.nth(1).boundingBox()
  expect(firstBox).not.toBeNull()
  expect(secondBox).not.toBeNull()
  if (!firstBox || !secondBox) return

  const startX = firstBox.x + firstBox.width + Math.max(1, (secondBox.x - firstBox.x - firstBox.width) / 2)
  const startY = firstBox.y + firstBox.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(secondBox.x + secondBox.width * .75, secondBox.y + secondBox.height * .75, { steps: 8 })
  await page.mouse.up()

  await expect.poll(async () => page.locator('.a-file-grid input[type="checkbox"]:checked').count()).toBeGreaterThan(0)

  await cards.nth(0).dragTo(cards.nth(1))
  await expect(page.getByText('La referencia validó la intención sin modificar la colección')).toBeVisible()
})
