import { expect, test } from '@playwright/test'

const routes = ['ui', 'astiango', 'cloud', 'calendar', 'midori'] as const
const hallmarkWidths = [320, 375, 414, 768] as const

for (const route of routes) {
  test(`${route} renders without icon ligatures leaking into the interface`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await page.goto(`/${route}`)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('main, .q-page').first()).toBeVisible()

    expect(await page.locator('.material-icons').count()).toBe(0)
    if (route === 'ui') expect(await page.locator('.material-icons-round').count()).toBe(0)
    else expect(await page.locator('.material-icons-round').count()).toBeGreaterThan(0)
    expect(consoleErrors).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth + 1))
  })
}

test.describe('reference application reflow and themes', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-light')
  })

  for (const width of hallmarkWidths) {
    test(`all routes remain bounded in light and dark at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 400 ? 760 : 900 })

      for (const route of routes) {
        const consoleErrors: string[] = []
        const recordConsoleError = (message: { type: () => string, text: () => string }) => {
          if (message.type() === 'error') consoleErrors.push(message.text())
        }
        page.on('console', recordConsoleError)
        await page.goto(`/${route}`)

        for (const theme of ['light', 'dark'] as const) {
          await page.getByRole('combobox', { name: 'Tema' }).selectOption(theme)
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme)

          const audit = await page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            mainCount: document.querySelectorAll('main').length,
            canvas: getComputedStyle(document.body).backgroundColor,
            text: getComputedStyle(document.body).color
          }))

          expect(audit.scrollWidth).toBeLessThanOrEqual(audit.clientWidth + 1)
          expect(audit.mainCount).toBe(1)
          expect(audit.canvas).not.toBe(audit.text)
        }

        expect(consoleErrors).toEqual([])
        page.off('console', recordConsoleError)
      }
    })
  }
})

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

test('priority form and stepper contracts work together with native keyboard behavior', async ({ page }) => {
  await page.goto('/ui')
  await page.locator('[data-ui-tab="components"]').click()

  const visibility = page.getByRole('group', { name: 'Visibilidad' })
  const team = visibility.getByRole('radio', { name: /Equipo/ })
  const link = visibility.getByRole('radio', { name: /^Enlace/ })
  await expect(team).toBeChecked()
  await team.focus()
  await team.press('ArrowRight')
  await expect(link).toBeChecked()

  await page.locator('[data-ui-tab="patterns"]').click()
  const progress = page.getByRole('navigation', { name: 'Preparar publicación' })
  await expect(progress.getByRole('button', { name: /Permisos/ })).toHaveAttribute('aria-current', 'step')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(progress.getByRole('button', { name: /Revisión/ })).toHaveAttribute('aria-current', 'step')
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

test('cloud defers upload UI until the workflow is requested', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light')

  const lazyRequests: string[] = []
  page.on('request', (request) => {
    if (/A(?:Drawer|FileUpload|UploadQueue)-/.test(request.url())) lazyRequests.push(request.url())
  })

  await page.goto('/cloud')
  await expect(page.locator('main')).toBeVisible()
  expect(lazyRequests).toEqual([])

  const newButton = page.getByRole('button', { name: 'Nuevo', exact: true }).first()
  await newButton.click()
  await expect(page.getByRole('dialog', { name: 'Añadir a Astian Cloud' })).toBeVisible()
  expect(lazyRequests.some((url) => url.includes('ADrawer-'))).toBe(true)
  expect(lazyRequests.some((url) => url.includes('AFileUpload-'))).toBe(true)
  expect(lazyRequests.some((url) => url.includes('AUploadQueue-'))).toBe(false)

  await page.getByRole('textbox', { name: 'URL del archivo' }).fill('https://astian.org/report.pdf')
  await page.getByRole('button', { name: 'Añadir archivos' }).click()
  await expect.poll(() => lazyRequests.some((url) => url.includes('AUploadQueue-'))).toBe(true)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Añadir a Astian Cloud' })).toBeHidden()
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
