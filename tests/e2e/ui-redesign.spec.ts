import { expect, test } from '@playwright/test'

const hallmarkViewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 }
] as const

test.describe('catálogo /ui rediseñado', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-light')
  })

  for (const viewport of hallmarkViewports) {
    test(`reflow, targets y DOM a ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/ui')
      await expect(page.locator('[data-ui-panel="foundations"]').last()).toBeVisible()

      const documentAudit = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        elementCount: document.querySelectorAll('*').length,
        mains: document.querySelectorAll('main').length,
        lang: document.documentElement.lang
      }))

      expect(documentAudit.scrollWidth).toBeLessThanOrEqual(documentAudit.clientWidth + 1)
      expect(documentAudit.elementCount).toBeLessThanOrEqual(360)
      expect(documentAudit.mains).toBe(1)
      expect(documentAudit.lang).toBe('es')
      await expect(page.locator('[data-ui-panel="components"]')).toHaveCount(0)
      await expect(page.locator('[data-ui-panel="patterns"]')).toHaveCount(0)

      const undersizedTargets = await page.locator(
        'header a[href], header button, header select, main a[href], main button, main select, main input:not([type="hidden"])'
      ).evaluateAll((elements) => elements.flatMap((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        if (style.visibility === 'hidden' || style.display === 'none' || rect.width === 0 || rect.height === 0) return []
        return rect.width + 0.1 < 44 || rect.height + 0.1 < 44
          ? [{ label: element.getAttribute('aria-label') ?? element.textContent?.trim(), width: rect.width, height: rect.height }]
          : []
      }))
      expect(undersizedTargets).toEqual([])
    })
  }

  test('carga un único panel y difiere los paneles restantes', async ({ page }) => {
    const panelRequests: string[] = []
    const resourceRequests: string[] = []
    page.on('request', (request) => {
      resourceRequests.push(request.url())
      if (/Ui(?:Foundations|Components|Patterns)Panel-/.test(request.url())) panelRequests.push(request.url())
    })

    await page.goto('/ui')
    await expect(page.locator('[data-ui-panel="foundations"]').last()).toBeVisible()
    expect(panelRequests.some((url) => url.includes('UiFoundationsPanel-'))).toBe(true)
    expect(panelRequests.some((url) => url.includes('UiComponentsPanel-'))).toBe(false)
    expect(panelRequests.some((url) => url.includes('UiPatternsPanel-'))).toBe(false)
    expect(resourceRequests.some((url) => url.endsWith('.woff2'))).toBe(false)

    await page.locator('[data-ui-tab="components"]').click()
    await expect(page.locator('#ui-components')).toBeVisible()
    await expect(page.locator('#ui-foundations')).toHaveCount(0)
    expect(panelRequests.some((url) => url.includes('UiComponentsPanel-'))).toBe(true)

    await page.locator('[data-ui-tab="patterns"]').click()
    await expect(page.locator('#ui-patterns')).toBeVisible()
    await expect(page.locator('#ui-components')).toHaveCount(0)
    expect(panelRequests.some((url) => url.includes('UiPatternsPanel-'))).toBe(true)
  })

  test('el comando navega por teclado y restaura el foco', async ({ page }) => {
    await page.goto('/ui')
    const trigger = page.locator('.ui-catalog__search-trigger')
    await trigger.focus()
    await page.keyboard.press('Control+k')

    const dialog = page.locator('.ui-catalog__command-dialog')
    const input = dialog.getByRole('combobox', { name: 'Buscar en el catálogo' })
    await expect(dialog).toBeVisible()
    await expect(input).toBeFocused()

    await input.fill('marketing')
    const firstActive = await input.getAttribute('aria-activedescendant')
    await input.press('ArrowDown')
    expect(await input.getAttribute('aria-activedescendant')).not.toBe(firstActive)
    await input.press('Enter')

    await expect(dialog).toBeHidden()
    await expect(page.locator('[data-ui-tab="patterns"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#ui-patterns')).toBeVisible()
    await expect(trigger).toBeFocused()

    await page.keyboard.press('Control+k')
    await expect(input).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('skip link, drawer y reduced motion conservan foco', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/ui')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Saltar al contenido principal' })
    await expect(skipLink).toBeFocused()
    const skipBox = await skipLink.boundingBox()
    expect(skipBox?.x ?? -1).toBeGreaterThanOrEqual(0)
    expect(skipBox?.y ?? -1).toBeGreaterThanOrEqual(0)
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()

    const menu = page.getByRole('button', { name: 'Abrir navegación' })
    await menu.click()
    await expect(page.locator('.product-shell__drawer')).toBeVisible()
    await expect(page.getByRole('link', { name: /Design system/ }).first()).toBeFocused()

    const transitionSeconds = await page.locator('.product-shell__drawer').evaluate((element) => (
      getComputedStyle(element).transitionDuration
        .split(',')
        .map((duration) => Number.parseFloat(duration) * (duration.includes('ms') ? 0.001 : 1))
    ))
    expect(Math.max(...transitionSeconds)).toBeLessThanOrEqual(0.001)

    await page.keyboard.press('Escape')
    await expect(page.locator('.product-shell__drawer')).toBeHidden()
    await expect(menu).toBeFocused()
  })

  test('tema claro, oscuro y sistema se resuelven y persisten', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/ui')

    const themeSelect = page.getByRole('combobox', { name: 'Tema' })
    const lightBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

    await themeSelect.selectOption('dark')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('body')).toHaveClass(/body--dark/)
    const darkBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(darkBackground).not.toBe(lightBackground)

    await page.reload()
    await expect(themeSelect).toHaveValue('dark')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await themeSelect.selectOption('system')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await themeSelect.selectOption('light')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).not.toHaveClass(/body--dark/)
  })
})
